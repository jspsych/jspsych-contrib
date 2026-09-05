import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "chiasm-setup",
  version: version,
  parameters: {
    /** HTML shown while the Chiasm tracker is being initialized. */
    loading_message: {
      type: ParameterType.HTML_STRING,
      default: "<p>Initializing eye tracking...</p>",
    },
    /** Whether to abort the experiment when initialization fails. */
    abort_on_failure: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** HTML shown to the participant when initialization fails and the experiment is aborted. */
    error_message: {
      type: ParameterType.HTML_STRING,
      default: "<p>Eye tracking setup failed. The experiment cannot continue.</p>",
    },
  },
  data: {
    /** Whether tracker initialization succeeded. */
    success: { type: ParameterType.BOOL },
    /** Milliseconds elapsed during initialization. */
    setup_duration: { type: ParameterType.INT },
    /** Error message if initialization failed, otherwise null. */
    error: { type: ParameterType.STRING },
  },
  citations: "__CITATIONS__",
};

type Info = typeof info;

/**
 * **plugin-chiasm-setup**
 *
 * jsPsych plugin that initializes the Chiasm eye tracker and starts a recording session.
 * Looks up the `chiasm` extension on the `JsPsych` instance and invokes its `start()`
 * method, which creates the tracker, registers the gaze prediction callback, sends
 * experiment metadata, and opens the backend session. No participant-facing UI is
 * shown beyond `loading_message`; the calibration ceremony belongs to
 * `plugin-chiasm-calibrate`.
 *
 * @author Chiasm
 * @see {@link https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-chiasm-setup/README.md}
 */
class ChiasmSetupPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  async trial(display_element: HTMLElement, trial: TrialType<Info>): Promise<void> {
    display_element.innerHTML = trial.loading_message;
    const startTime = performance.now();

    const extension = (this.jsPsych.extensions as Record<string, any>)["chiasm"];
    if (!extension || typeof extension.start !== "function") {
      const error =
        "plugin-chiasm-setup: the `chiasm` extension is not registered on this jsPsych instance.";
      console.error(error);
      if (trial.abort_on_failure) {
        // Render only the experimenter-controlled message to the participant;
        // the raw error goes to the data payload (and console) but never into
        // the DOM, avoiding any HTML injection from upstream error text.
        this.jsPsych.abortExperiment(trial.error_message, {
          chiasm_setup_failed: true,
          error,
        });
        return;
      }
      this.jsPsych.finishTrial({
        success: false,
        setup_duration: Math.round(performance.now() - startTime),
        error,
      });
      return;
    }

    try {
      await extension.start();
      this.jsPsych.finishTrial({
        success: true,
        setup_duration: Math.round(performance.now() - startTime),
        error: null,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("plugin-chiasm-setup: extension.start() failed:", err);
      if (trial.abort_on_failure) {
        // Render only the experimenter-controlled message to the participant;
        // the raw error goes to the data payload (and console) but never into
        // the DOM, avoiding any HTML injection from upstream error text.
        this.jsPsych.abortExperiment(trial.error_message, {
          chiasm_setup_failed: true,
          error: errorMsg,
        });
        return;
      }
      this.jsPsych.finishTrial({
        success: false,
        setup_duration: Math.round(performance.now() - startTime),
        error: errorMsg,
      });
    }
  }
}

export default ChiasmSetupPlugin;
