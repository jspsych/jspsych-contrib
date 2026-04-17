import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "circle-click-response",
  version: version,
  parameters: {
    /** The HTML content to display in the center of the screen. */
    stimulus: {
      type: ParameterType.HTML_STRING,
      default: undefined,
    },
    /** An array of HTML strings representing the clickable options arranged in a circle around the stimulus. */
    choices: {
      type: ParameterType.HTML_STRING,
      array: true,
      default: undefined,
    },
    /** An optional HTML string to display as a prompt below the stimulus and circle. */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /** The radius of the circle in pixels. */
    circle_radius: {
      type: ParameterType.INT,
      default: 200,
    },
    /** The maximum time in milliseconds that the participant has to respond. If null, the trial will wait indefinitely. */
    trial_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** The duration in milliseconds to display the stimulus before the choices appear. If 0, stimulus and choices appear simultaneously. */
    stimulus_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** The index of the correct response in the choices array. If null, correctness is not evaluated. */
    correct_choice: {
      type: ParameterType.INT,
      default: null,
    },
    /** HTML string to display as feedback after a correct response. If null, no feedback is shown. Only used when correct_choice is set. */
    feedback_correct: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /** HTML string to display as feedback after an incorrect response. If null, no feedback is shown. Only used when correct_choice is set. */
    feedback_incorrect: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /** The duration in milliseconds to display feedback. Only used when feedback is shown. */
    feedback_duration: {
      type: ParameterType.INT,
      default: 1000,
    },
  },
  data: {
    /** The HTML content displayed as the central stimulus. */
    stimulus: {
      type: ParameterType.HTML_STRING,
    },
    /** The HTML content of the chosen option. */
    response: {
      type: ParameterType.HTML_STRING,
    },
    /** The index of the chosen option in the choices array. */
    response_index: {
      type: ParameterType.INT,
    },
    /** The response time in milliseconds. */
    rt: {
      type: ParameterType.INT,
    },
    /** Whether the response was correct. Null if correct_choice was not specified. */
    correct: {
      type: ParameterType.BOOL,
    },
  },
  citations: "__CITATIONS__",
};

type Info = typeof info;

/**
 * **circle-click-response**
 *
 * A plugin that displays a central HTML stimulus surrounded by clickable options arranged in a circle.
 *
 * @author Josh de Leeuw
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-circle-click-response/README.md}
 */
class CircleClickResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    const n_choices = trial.choices.length;
    const radius = trial.circle_radius;

    // Build HTML
    let html = `<div id="jspsych-circle-click-response-wrapper" style="position: relative; width: ${
      radius * 2 + 120
    }px; height: ${radius * 2 + 120}px; margin: auto;">`;

    // Central stimulus
    html += `<div id="jspsych-circle-click-response-stimulus" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">${trial.stimulus}</div>`;

    // Choice options arranged in a circle
    for (let i = 0; i < n_choices; i++) {
      const angle = (2 * Math.PI * i) / n_choices - Math.PI / 2; // Start from top
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      html += `<div class="jspsych-circle-click-response-choice" data-choice-index="${i}" style="position: absolute; top: 50%; left: 50%; transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px)); cursor: pointer; user-select: none;">${trial.choices[i]}</div>`;
    }

    html += `</div>`;

    // Prompt
    if (trial.prompt !== null) {
      html += `<div id="jspsych-circle-click-response-prompt">${trial.prompt}</div>`;
    }

    // Feedback container (hidden initially)
    html += `<div id="jspsych-circle-click-response-feedback" style="display: none; text-align: center; margin-top: 10px;"></div>`;

    display_element.innerHTML = html;

    const start_time = performance.now();

    const end_trial = (response_index: number | null) => {
      // Clear any pending timeouts
      this.jsPsych.pluginAPI.clearAllTimeouts();

      const end_time = performance.now();
      const rt = response_index !== null ? Math.round(end_time - start_time) : null;

      let correct: boolean | null = null;
      if (trial.correct_choice !== null && response_index !== null) {
        correct = response_index === trial.correct_choice;
      }

      const trial_data = {
        stimulus: trial.stimulus,
        response: response_index !== null ? trial.choices[response_index] : null,
        response_index: response_index,
        rt: rt,
        correct: correct,
      };

      // Check if feedback should be shown
      const show_feedback =
        correct !== null &&
        ((correct && trial.feedback_correct !== null) ||
          (!correct && trial.feedback_incorrect !== null));

      if (show_feedback) {
        // Remove click listeners
        const choice_elements = display_element.querySelectorAll(
          ".jspsych-circle-click-response-choice"
        );
        choice_elements.forEach((el) => {
          (el as HTMLElement).style.pointerEvents = "none";
        });

        const feedback_el = display_element.querySelector(
          "#jspsych-circle-click-response-feedback"
        ) as HTMLElement;
        feedback_el.innerHTML = correct ? trial.feedback_correct : trial.feedback_incorrect;
        feedback_el.style.display = "block";

        this.jsPsych.pluginAPI.setTimeout(() => {
          this.jsPsych.finishTrial(trial_data);
        }, trial.feedback_duration);
      } else {
        this.jsPsych.finishTrial(trial_data);
      }
    };

    // Add click listeners to choices
    const choice_elements = display_element.querySelectorAll(
      ".jspsych-circle-click-response-choice"
    );
    choice_elements.forEach((el) => {
      el.addEventListener("click", (e) => {
        const target = (e.currentTarget as HTMLElement).getAttribute("data-choice-index");
        end_trial(parseInt(target, 10));
      });
    });

    // Handle stimulus duration (hide stimulus after duration)
    if (trial.stimulus_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        const stim_el = display_element.querySelector(
          "#jspsych-circle-click-response-stimulus"
        ) as HTMLElement;
        stim_el.style.visibility = "hidden";
      }, trial.stimulus_duration);
    }

    // Handle trial duration (end trial if no response)
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        end_trial(null);
      }, trial.trial_duration);
    }
  }
}

export default CircleClickResponsePlugin;
