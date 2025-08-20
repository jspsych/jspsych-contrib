import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "vaast-image",
  version: version,
  parameters: {
    /**
     * The image to be displayed.
     */
    stimulus: {
      type: ParameterType.IMAGE,
      pretty_name: "Stimulus",
      default: undefined,
    },
    /**
     * The key press associated with an approach movement.
     */
    approach_key: {
      type: ParameterType.KEY,
      pretty_name: "Approach key",
      default: "Z",
    },
    /**
     * The key press associated with an avoidance movement.
     */
    avoidance_key: {
      type: ParameterType.KEY,
      pretty_name: "Avoidance key",
      default: "S",
    },
    /**
     * This array contains the key(s) that the participant is allowed to press in order to advance to the next trial
     * if their key press was incorrect. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values this page}
     * and
     * {@link https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/ this page (event.key column)}
     * for more examples. Any key presses that are not listed in the array will be ignored.
     * The default value of `"ALL_KEYS"` means that all keys will be accepted as valid responses.
     * Specifying `"NO_KEYS"` will mean that no responses are allowed.
     */
    key_to_move_forward: {
      type: ParameterType.KEYS,
      pretty_name: "Key to move forward",
      default: "ALL_KEYS",
    },
    /**
     * If true, then the code included in 'html_when_wrong' will be displayed when the user makes an incorrect key press.
     */
    display_feedback: {
      type: ParameterType.BOOL,
      pretty_name: "Display feedback",
      default: false,
    },
    /**
     * How long the feedback is shown (in ms).
     */
    feedback_duration: {
      type: ParameterType.INT,
      pretty_name: "Feedback duration",
      default: null,
    },
    /**
     * The content to display when a user presses the wrong key.
     */
    html_when_wrong: {
      type: ParameterType.HTML_STRING,
      pretty_name: "HTML when wrong",
      default: '<span style="color: red; font-size: 80px">X</span>',
    },
    /**
     * If true, the user will be forced to press the correct key in order to advance to the next trial after a wrong key press.
     */
    force_correct_key_press: {
      type: ParameterType.BOOL,
      pretty_name: "Force correct key press",
      default: false,
    },
    /**
     * The movement associated with the stimulus (either "approach" or "avoidance").
     */
    stim_movement: {
      type: ParameterType.STRING,
      pretty_name: "Stimulus movement association",
      options: ["approach", "avoidance"],
      default: undefined,
    },
    /**
     * An array with the sizes of the image as function of the position.
     * The medium font corresponds to the stimulus font size when it's first presented.
     * The smaller and larger fonts correspond to the stimulus font size when the movement is avoidance and approach, respectively.
     */
    font_sizes: {
      type: ParameterType.INT,
      array: true,
      pretty_name: "Stimulus size",
      default: null,
    },
    /**
     * If true, then the trial will end whenever the participant makes a response
     * (assuming they make their response before the cutoff specified by the trial_duration parameter).
     * If false, then the trial will continue until the value for trial_duration is reached.
     * For example, set this parameter to false for trials where the participant sees the visual changes caused by the chosen movement.
     */
    response_ends_trial: {
      type: ParameterType.BOOL,
      pretty_name: "Response ends trial",
      default: true,
    },
    /**
     * How long to wait for the participant to make a response before ending the trial in milliseconds.
     * If the value of this parameter is `null`, then the trial will wait for a response indefinitely.
     */
    trial_duration: {
      type: ParameterType.INT,
      pretty_name: "Trial duration",
      default: null,
    },
    /**
     * An array with the images displayed as background as function of the position.
     */
    background_images: {
      type: ParameterType.IMAGE,
      array: true,
      pretty_name: "Background",
      default: undefined,
    },
    /**
     * The position in the "background_images" array which will be used to set the background (and the stimulus size).
     */
    position: {
      type: ParameterType.INT,
      pretty_name: "Initial position",
      default: 3,
    },
  },
  data: {
    /**
     * The path to the image file that was displayed on the screen.
     */
    stimulus: {
      type: ParameterType.STRING,
    },
    /**
     * Indicates which key that the participant pressed.
     */
    response: {
      type: ParameterType.STRING,
    },
    /**
     * Boolean indicating whether the user's key press was correct or incorrect for the given stimulus.
     */
    correct: {
      type: ParameterType.BOOL,
    },
    /**
     * The response time in milliseconds for the participant to make a response.
     * The time is measured from when the stimulus first appears on the screen until the participant's response.
     */
    rt: {
      type: ParameterType.INT,
    },
    /**
     * The movement associated with the stimulus.
     */
    movement: {
      type: ParameterType.STRING,
    },
    /**
     * The position in the "background_images" array used to set the background and the stimulus size.
     */
    position: {
      type: ParameterType.INT,
    },
  },
  // prettier-ignore
  citations: '__CITATIONS__',
};

type Info = typeof info;

/**
 * **vaast-image**
 *
 * The VAAST-image plugin displays a single trial with an image stimulus appearing on a background image.
 * The participant has to either approach or avoid the image stimulus shown on the screen, depending on the instructions.
 * They respond by pressing one key or another. The scene changes accordingly.
 * This plugin is used in VAAST (Visual Approach and Avoidance by the Self Task) experiments.
 *
 * @author Cédric Batailler
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-vaast-image/README.md}}
 */
class VaastImagePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    let html_str = "";

    const position = trial.position ?? 3;

    html_str +=
      "<div style='position: absolute; right: 0; top: 0; width: 100%; height: 100%; background: url(" +
      trial.background_images[trial.position] +
      ") center no-repeat; background-color: #000000'></div>";
    html_str +=
      "<div style='position: relative; right: 0; top:0; width: " +
      trial.font_sizes[trial.position] +
      "px'><img width='" +
      trial.font_sizes[trial.position] +
      "' src='" +
      trial.stimulus +
      "' id='jspsych-vaast-stim'></img></div>";

    html_str +=
      "<div id='wrongImgID' style='position: relative; top: 150px; margin-left: auto; margin-right: auto; left: 0; right: 0'>";

    if (trial.display_feedback === true) {
      html_str +=
        "<div id='wrongImgContainer' style='visibility: hidden; position: absolute; top: -75px; margin-left: auto; margin-right: auto; left: 0; right: 0'><p>" +
        trial.html_when_wrong +
        "</p></div>";
    }

    html_str += "</div>";

    display_element.innerHTML = html_str;

    // store response
    let response = {
      rt: null,
      key: null,
      correct: false,
    };

    // function to end trial when it is time
    const end_trial = () => {
      // kill keyboard listeners
      if (typeof keyboardListener !== "undefined") {
        this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      let trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        key_press: response.key,
        correct: response.correct,
        movement: trial.stim_movement,
        position: trial.position,
      };

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);
    };

    const approach_key = trial.approach_key ?? "Z";
    const avoidance_key = trial.avoidance_key ?? "S";

    // function to handle responses by the subject
    const after_response = (info) => {
      let wImg = document.getElementById("wrongImgContainer");
      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector("#jspsych-vaast-stim").className += " responded";

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.stim_movement == "avoidance") {
        if (
          response.rt !== null &&
          this.jsPsych.pluginAPI.compareKeys(response.key, avoidance_key)
        ) {
          response.correct = true;
          if (trial.response_ends_trial) {
            end_trial();
          }
        } else {
          response.correct = false;
          if (!trial.response_ends_trial && trial.display_feedback == true) {
            wImg.style.visibility = "visible";
          }
          if (
            trial.response_ends_trial &&
            trial.display_feedback == true &&
            trial.feedback_duration !== null
          ) {
            wImg.style.visibility = "visible";
            this.jsPsych.pluginAPI.setTimeout(() => {
              end_trial();
            }, trial.feedback_duration);
          }
          if (
            trial.response_ends_trial &&
            trial.display_feedback == true &&
            trial.feedback_duration == null
          ) {
            wImg.style.visibility = "visible";
            if (trial.force_correct_key_press) {
              let keyListener = this.jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_trial,
                valid_responses: [avoidance_key],
              });
            } else {
              let keyListener = this.jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_trial,
                valid_responses: trial.key_to_move_forward,
              });
            }
          } else if (trial.response_ends_trial && trial.display_feedback != true) {
            end_trial();
          } else if (!trial.response_ends_trial && trial.display_feedback != true) {
          }
        }
      } else if (trial.stim_movement == "approach") {
        if (
          response.rt !== null &&
          this.jsPsych.pluginAPI.compareKeys(response.key, approach_key)
        ) {
          response.correct = true;
          if (trial.response_ends_trial) {
            end_trial();
          }
        } else {
          response.correct = false;
          if (!trial.response_ends_trial && trial.display_feedback == true) {
            wImg.style.visibility = "visible";
          }
          if (
            trial.response_ends_trial &&
            trial.display_feedback == true &&
            trial.feedback_duration !== null
          ) {
            wImg.style.visibility = "visible";
            this.jsPsych.pluginAPI.setTimeout(() => {
              end_trial();
            }, trial.feedback_duration);
          }
          if (
            trial.response_ends_trial &&
            trial.display_feedback == true &&
            trial.feedback_duration == null
          ) {
            wImg.style.visibility = "visible";
            if (trial.force_correct_key_press) {
              let keyListener = this.jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_trial,
                valid_responses: [approach_key],
              });
            } else {
              let keyListener = this.jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_trial,
                valid_responses: trial.key_to_move_forward,
              });
            }
          } else if (trial.response_ends_trial && trial.display_feedback != true) {
            end_trial();
          } else if (!trial.response_ends_trial && trial.display_feedback != true) {
          }
        }
      }
    };

    // start the response listener
    if (approach_key != "NO_KEYS" && avoidance_key != "NO_KEYS") {
      var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: [approach_key, avoidance_key],
        rt_method: "performance",
        persist: false,
        allow_held_key: false,
      });
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null && trial.response_ends_trial != true) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        end_trial();
      }, trial.trial_duration);
    }
  }
}

export default VaastImagePlugin;
