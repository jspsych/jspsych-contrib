import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "plugin-capture-url-params",
  version: version,
  parameters: {
    /**
     * A list of URL query parameters to extract and save to the data object.
     * For example, Prolific uses: "PROLIFIC_PID", "STUDY_ID", and "SESSION_ID".
     * If left empty, all available URL parameters will be captured.
     */
    url_params: {
      type: ParameterType.STRING,
      array: true,
      default: [],
    },

    /**
     * If true, an alert box will be shown to the participant if one or more
     * of the specified URL parameters is missing.
     */
    show_error: {
      type: ParameterType.BOOL,
      default: true,
    },

    /**
     * The message to show participants if required URL parameters are missing.
     * This is only displayed if `show_error` is true.
     */
    error_message: {
      type: ParameterType.STRING,
      default: "URL parameters could not be retrieved.",
    },

    /**
     * If true (default), the experiment continues even if some specified
     * parameters are missing. If false, the experiment is aborted when any
     * required parameter is not found.
     */
    soft_fail: {
      type: ParameterType.BOOL,
      default: true,
    },

    /**
     * The message to show particpants if the experiment is aborted due to missing
     * URL parameters. This is only used if `soft_fail` is false.
     */
    abort_message: {
      type: ParameterType.HTML_STRING,
      default: "There was an error and we are unable to continue your session.",
    },
  },
  data: {
    /**
     * An object containing the captured URL parameter key-value pairs.
     * If `url_params` is empty, this will include all parameters in the URL.
     */
    response: {
      type: ParameterType.OBJECT,
    },
  },
  citations: "__CITATIONS__",
};

type Info = typeof info;

/**
 * The `plugin-capture-url-params` plugin saves data embedded in the URL parameters into the jsPsych data object.
 * This is useful when working with external participant platforms like Prolific, which use URL parameters to pass unique identifiers such as `PROLIFIC_PID`, `STUDY_ID`, or `SESSION_ID`.
 *
 * By default, the plugin captures all available URL parameters. You can also specify a subset of required parameters using the `url_params` option.
 * If any of these required parameters are missing, the plugin can optionally show an error message to participants and either allow the experiment to continue (`soft_fail = true`) or stop the experiment (`soft_fail = false`).
 */
class CaptureUrlParamsPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  ///////////////////////
  // URL PARAM HELPERS //
  ///////////////////////

  private getAllUrlParams(): Record<string, string> {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(params.entries());
  }

  private getSpecifiedUrlParams(trial: TrialType<Info>): Record<string, string | undefined> {
    const paramData = trial.url_params.reduce((acc: Record<string, string | undefined>, key) => {
      acc[key] = this.jsPsych.data.getURLVariable(key);
      return acc;
    }, {});

    const missing = Object.entries(paramData)
      .filter(([, value]) => value === undefined)
      .map(([key]) => key);

    if (missing.length > 0) {
      console.warn(`Missing URL parameters: ${missing.join(", ")}`);

      if (trial.show_error) {
        alert(trial.error_message);
      }

      if (!trial.soft_fail) {
        this.jsPsych.abortExperiment(trial.abort_message);
      }
    }

    return paramData;
  }

  //////////////////////////
  // JSPSYCH TRIAL METHOD //
  //////////////////////////

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    const urlParamData =
      trial.url_params.length === 0 ? this.getAllUrlParams() : this.getSpecifiedUrlParams(trial);

    const trial_data = {
      response: urlParamData,
    };

    this.jsPsych.finishTrial(trial_data);
  }
}

export default CaptureUrlParamsPlugin;
