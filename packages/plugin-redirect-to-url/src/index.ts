import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "plugin-redirect-to-url",
  version: version,
  parameters: {
    /**
     * Optional HTML content to be displayed above the response buttons.
     * This can be used to provide context or instructions before redirecting.
     */
    stimulus: {
      type: ParameterType.HTML_STRING,
      default: null,
    },

    /**
     * An array of strings representing the labels for each response button.
     * Each string in the array creates a corresponding clickable button for the participant.
     */
    choices: {
      type: ParameterType.STRING,
      default: null,
      array: true,
    },

    /**
     * A function that returns the HTML for each button.
     * Receives the `choice` label and `choice_index` as arguments.
     * By default, returns a styled `<button>` element using the choice label.
     */
    button_html: {
      type: ParameterType.FUNCTION,
      default: function (choice: string, choice_index: number) {
        return `<button class="jspsych-btn">${choice}</button>`;
      },
    },

    /**
     * The destination URL to redirect the participant to after they make a response.
     * This should be a fully qualified URL (e.g., "https://www.jspsych.org/").
     */
    url: {
      type: ParameterType.STRING,
      default: undefined,
    },

    /**
     * If true, the jsPsych experiment will be aborted after the redirect,
     * without calling `finishTrial()`. This is useful for ending the study cleanly
     * when redirecting to an external site like Prolific.
     */
    abort_on_submit: {
      type: ParameterType.BOOL,
      default: true,
    },

    /**
     * If true, the redirect URL will be opened in a new browser tab or window,
     * rather than replacing the current tab. This can help preserve the original experiment tab.
     */
    open_in_new_tab: {
      type: ParameterType.BOOL,
      default: false,
    },
  },

  data: {
    /**
     * The HTML stimulus shown to the participant at the start of the trial.
     */
    stimulus: {
      type: ParameterType.STRING,
    },

    /**
     * The response time in milliseconds from when the stimulus appears to when a button is clicked.
     */
    rt: {
      type: ParameterType.INT,
    },

    /**
     * The index of the response button clicked by the participant (0-based).
     */
    response: {
      type: ParameterType.INT,
    },
  },

  citations: "__CITATIONS__",
};

type Info = typeof info;

/**
 * **plugin-redirect-to-url**
 *
 * The `redirect-to-url` plugin is designed to smoothly redirect participants to an external URL after a trial or at the end of an experiment.
 * This is especially useful when integrating with participant recruitment or compensation platforms such as Prolific or MTurk.
 * The plugin optionally displays an HTML stimulus along with one or more response buttons.
 * When a participant clicks one of the buttons, the plugin records their response and response time, disables further input, and then redirects the browser to a specified URL.
 * You can configure whether the redirection should occur in the current tab or open a new tab,
 * and whether the redirection should also terminate the jsPsych experiment (`abort_on_submit`) or allow it to continue after saving the response.
 * The plugin also supports fully customizable HTML button rendering via a user-defined function.
 *
 * @author Courtney B. Hilton
 * @see {@link https://github.com/themusiclab/pose/tree/main/test/plugin-redirect-to-url/README.md}}
 */
class RedirectToUrlPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  //////////////////////////
  // DOM CREATION HELPERS //
  //////////////////////////

  private renderStimulus(display_element: HTMLElement, stimulus: string) {
    const stimulusElement = document.createElement("div");
    stimulusElement.id = "jspsych-html-button-response-stimulus";
    stimulusElement.innerHTML = stimulus;
    display_element.appendChild(stimulusElement);
  }

  private renderButtons(
    display_element: HTMLElement,
    trial: TrialType<Info>,
    onClick: (choiceIndex: number) => void
  ): HTMLDivElement {
    const buttonGroup = document.createElement("div");
    buttonGroup.id = "jspsych-html-button-response-btngroup";
    buttonGroup.classList.add("jspsych-btn-group-flex");

    trial.choices.forEach((choice, index) => {
      buttonGroup.insertAdjacentHTML(
        "beforeend",
        trial.button_html(choice, index)
      );
      const button = buttonGroup.lastChild as HTMLElement;
      button.dataset.choice = index.toString();
      button.addEventListener("click", () => onClick(index));
    });

    return buttonGroup;
  }

  ///////////////////
  // OTHER HELPERS //
  ///////////////////

  private redirectToUrl(trial: TrialType<Info>) {
    if (trial.open_in_new_tab) {
      const newTab = window.open(trial.url, "_blank");
      if (newTab) newTab.focus();
    } else {
      window.location.href = trial.url;
    }
  }

  private disableButtons(buttonGroup: HTMLDivElement) {
    Array.from(buttonGroup.children).forEach((btn) =>
      btn.setAttribute("disabled", "true")
    );
  }

  private endTrial(
    trial: TrialType<Info>,
    response: { rt: number; button: number }
  ) {
    const trialData = {
      rt: response.rt,
      stimulus: trial.stimulus,
      response: response.button,
    };

    if (trial.abort_on_submit) {
      this.jsPsych.abortExperiment(null, trialData);
    } else {
      this.jsPsych.finishTrial(trialData);
    }

    this.redirectToUrl(trial);
  }

  //////////////////////////
  // JSPSYCH TRIAL METHOD //
  //////////////////////////

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    const startTime = performance.now();
    const response = {
      rt: null as number | null,
      button: null as number | null,
    };

    if (trial.stimulus) {
      this.renderStimulus(display_element, trial.stimulus);
    }

    const buttonGroup = this.renderButtons(
      display_element,
      trial,
      (choiceIndex) => {
        const endTime = performance.now();
        response.rt = Math.round(endTime - startTime);
        response.button = choiceIndex;
        this.disableButtons(buttonGroup);
        this.endTrial(trial, response);
      }
    );

    display_element.appendChild(buttonGroup);
  }
}

export default RedirectToUrlPlugin;
