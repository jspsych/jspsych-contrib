import interact from "interactjs";
import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "html-swipe-response",
  version: version,
  parameters: {
    /** The HTML string to be displayed. */
    stimulus: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Stimulus",
      default: undefined,
    },
    /** Array containing the label(s) for the button(s). */
    button_choices: {
      type: ParameterType.STRING,
      pretty_name: "Button Choices",
      default: [],
      array: true,
    },
    /** Array containing the key(s) the participant is allowed to press to respond to the stimulus. */
    keyboard_choices: {
      type: ParameterType.KEYS,
      pretty_name: "Keyboard Choices",
      default: ["ArrowLeft", "ArrowRight"],
    },
    /**
     * A function that generates the HTML for each button in the `choices` array.
     * The function gets the string and index of the item in the `choices` array and should return valid HTML.
     * If you want to use different markup for each button, you can do that by using a conditional on either parameter.
     * The default parameter returns a button element with the text label of the choice.
     */
    button_html: {
      type: ParameterType.FUNCTION,
      pretty_name: "Button HTML",
      default: function (choice: string, choice_index: number) {
        return `<button class="jspsych-btn">${choice}</button>`;
      },
    },
    /** Any content here will be displayed below the stimulus. */
    prompt: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Prompt",
      default: null,
    },
    /** How long to show the stimulus. */
    stimulus_duration: {
      type: ParameterType.INT,
      pretty_name: "Stimulus duration",
      default: null,
    },
    /** How long to show trial before it ends. */
    trial_duration: {
      type: ParameterType.INT,
      pretty_name: "Trial duration",
      default: null,
    },
    /** The vertical margin of the button. */
    margin_vertical: {
      type: ParameterType.STRING,
      pretty_name: "Margin vertical",
      default: "0px",
    },
    /** The horizontal margin of the button. */
    margin_horizontal: {
      type: ParameterType.STRING,
      pretty_name: "Margin horizontal",
      default: "8px",
    },
    /** If true, trial will end when participant makes a response. */
    response_ends_trial: {
      type: ParameterType.BOOL,
      pretty_name: "Response ends trial",
      default: true,
    },
    /** How far away from the center should the participant have to swipe for a
     * left/right response to be recorded. */
    swipe_threshold: {
      type: ParameterType.INT,
      pretty_name: "Swipe translation threshold",
      default: 20,
    },
    /** The offscreen coordinate for the swipe animation */
    swipe_offscreen_coordinate: {
      type: ParameterType.INT,
      pretty_name: "Swipe offscreen coordinate",
      default: 1000,
    },
    /** How much should the swipe animation rotate the stimulus */
    swipe_animation_max_rotation: {
      type: ParameterType.INT,
      pretty_name: "Swipe animation max rotation",
      default: 20,
    },
    /** How long should the swipe animation last in milliseconds. Set this to
     * zero to disable the animation. This will not be included in the reaction
     * time. */
    swipe_animation_duration: {
      type: ParameterType.INT,
      pretty_name: "Swipe animation duration (ms)",
      default: 250,
    },
  },
  data: {
    /**
     * The response time in milliseconds for the participant to make a response.
     * The time is measured from when the stimulus first appears on the screen until the participant's response.
     */
    rt: {
      type: ParameterType.INT,
    },
    /** The HTML content that was displayed on the screen. */
    stimulus: {
      type: ParameterType.STRING,
    },
    /**
     * Indicates which button the participant pressed. The first button in the `choices` array is 0, the second is 1, and so on.
     * If the participant responded using the keyboard, then this field will be `null`.
     */
    button_response: {
      type: ParameterType.INT,
    },
    /**
     * Indicates which key the participant pressed.
     * If the participant responded using button clicks, then this field will be `null`.
     */
    keyboard_response: {
      type: ParameterType.STRING,
    },
    /**
     * Indicates which direction the participant swiped.
     * This will be either `"left"` or `"right"`. If the participant responded using the keyboard,
     * then this field will be `null`.
     */
    swipe_response: {
      type: ParameterType.STRING,
    },
    /** Indicates the source of the response. This will either be `"button"` or `"keyboard"`. */
    response_source: {
      type: ParameterType.STRING,
    },
  },
};

type Info = typeof info;

/**
 * **html-swipe-response**
 *
 * jsPsych plugin for displaying a stimulus and getting a swipe response
 * @author Adam Richie-Halford
 * @see {@link https://www.jspsych.org/plugins/jspsych-html-swipe-response/ html-swipe-response plugin documentation on jspsych.org}
 */
class HtmlSwipeResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // display stimulus
    let html =
      '<div id="jspsych-html-swipe-response-stimulus-container"><div id="jspsych-html-swipe-response-stimulus">' +
      trial.stimulus +
      "</div></div>";

    html += '<div id="jspsych-html-swipe-response-btngroup">';
    for (var i = 0; i < trial.button_choices.length; i++) {
      var button_str = trial.button_html(trial.button_choices[i], i);
      html +=
        '<div class="jspsych-html-swipe-response-button" style="display: inline-block; margin:' +
        trial.margin_vertical +
        " " +
        trial.margin_horizontal +
        '" id="jspsych-html-swipe-response-button-' +
        i +
        '" data-choice="' +
        i +
        '">' +
        button_str +
        "</div>";
    }
    html += "</div>";

    // add prompt
    if (trial.prompt !== null) {
      html += trial.prompt;
    }

    // draw
    display_element.innerHTML = html;

    // store response
    let response = {
      rt: null,
      key: null,
      button: null,
      swipe: null,
      source: null,
    };

    const stimulus_div = document.getElementById("jspsych-html-swipe-response-stimulus");

    let position = {
      x: 0,
      y: 0,
      rotation: 0,
    };

    const setPosition = (coordinates) => {
      const { x = 0, y = 0, rotation = 0 } = coordinates;
      position = { x, y, rotation };
      stimulus_div.style.transform = `translate3D(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
    };

    const resetPosition = async () => {
      stimulus_div.style.transition = `${trial.swipe_animation_duration / 1000}s ease-in-out, ${
        trial.swipe_animation_duration / 1000
      }s ease-in`;
      setPosition({ x: 0, y: 0, rotation: 0 });
      stimulus_div.style.transition = null;
    };

    const dragMoveListener = (event) => {
      const x = position.x + event.delta.x;
      const y = position.y + event.delta.y;
      let rotation = 0;
      if (position.x > 0) {
        rotation = Math.min(trial.swipe_animation_max_rotation, position.x / 4);
      } else {
        rotation = Math.max(-trial.swipe_animation_max_rotation, position.x / 4);
      }
      setPosition({ x: x, y: y, rotation });
    };

    // start time
    const start_time = performance.now();

    // add event listeners to buttons
    for (var i = 0; i < trial.button_choices.length; i++) {
      display_element
        .querySelector("#jspsych-html-swipe-response-button-" + i)
        .addEventListener("click", (e) => {
          var btn_el = e.currentTarget as HTMLButtonElement;
          var choice = btn_el.getAttribute("data-choice"); // don't use dataset for jsdom compatibility
          after_button_response(choice);
        });
    }

    const sendCardToLeft = async () => {
      stimulus_div.style.transition = `${trial.swipe_animation_duration / 1000}s ease-in-out, ${
        trial.swipe_animation_duration / 1000
      }s ease-in`;
      setPosition({
        x: -trial.swipe_offscreen_coordinate,
        y: position.y,
        rotation: -trial.swipe_animation_max_rotation,
      });
    };

    const sendCardToRight = async () => {
      stimulus_div.style.transition = `${trial.swipe_animation_duration / 1000}s ease-in-out, ${
        trial.swipe_animation_duration / 1000
      }s ease-in`;
      setPosition({
        x: trial.swipe_offscreen_coordinate,
        y: position.y,
        rotation: trial.swipe_animation_max_rotation,
      });
    };

    // after a valid response, the stimulus will have the CSS class 'responded'
    // which can be used to provide visual feedback that a response was recorded
    const toggle_css_respond = (idx: number) => {
      // responded class for stimulus
      display_element.querySelector("#jspsych-html-swipe-response-stimulus").className +=
        " responded";

      // responded class for button
      document
        .querySelectorAll(`#jspsych-html-swipe-response-button-${idx} > button`)
        .forEach((element) => {
          element.className += " responded";
        });
    };

    // disable all the buttons after a response
    const disable_buttons = () => {
      document.querySelectorAll(".jspsych-html-swipe-response-button button").forEach((element) => {
        element.setAttribute("disabled", "disabled");
      });
    };

    // function to handle swipe responses by the participant
    const after_swipe_response = (left_or_right: "left" | "right") => {
      if (left_or_right !== null) {
        // measure rt
        const end_time = performance.now();
        const rt = Math.round(end_time - start_time);

        response = {
          rt: rt,
          key: null,
          button: null,
          swipe: left_or_right,
          source: "swipe",
        };

        const idx = left_or_right === "left" ? 0 : 1;
        toggle_css_respond(idx);
        disable_buttons();
      }

      if (trial.response_ends_trial) {
        if (trial.swipe_animation_duration > 0) {
          this.jsPsych.pluginAPI.setTimeout(end_trial, trial.swipe_animation_duration);
        } else {
          end_trial();
        }
      }
    };

    interact(stimulus_div).draggable({
      inertia: false,
      autoScroll: true,
      modifiers: [
        interact.modifiers.restrictRect({
          endOnly: true,
        }),
      ],
      listeners: {
        move: dragMoveListener,
        end: () => {
          if (position.x < -trial.swipe_threshold) {
            sendCardToLeft();
            after_swipe_response("left");
          } else if (position.x > trial.swipe_threshold) {
            sendCardToRight();
            after_swipe_response("right");
          } else {
            resetPosition();
          }
        },
      },
    });

    // function to handle responses by the participant
    const after_keyboard_response = (info) => {
      // only record the first response
      if (response.key == null) {
        response = {
          source: "keyboard",
          button: null,
          swipe: null,
          ...info,
        };
      }

      if (response.key.toLowerCase() == trial.keyboard_choices[0].toLowerCase()) {
        toggle_css_respond(0);
        sendCardToLeft();
      } else if (response.key.toLowerCase() == trial.keyboard_choices[1].toLowerCase()) {
        toggle_css_respond(1);
        sendCardToRight();
      }
      disable_buttons();

      if (trial.response_ends_trial) {
        if (trial.swipe_animation_duration > 0) {
          this.jsPsych.pluginAPI.setTimeout(end_trial, trial.swipe_animation_duration);
        } else {
          end_trial();
        }
      }
    };

    // function to handle responses by the participant
    const after_button_response = (choice: string) => {
      // measure rt
      var end_time = performance.now();
      var rt = Math.round(end_time - start_time);
      response.button = parseInt(choice);
      response.rt = rt;
      response.source = "button";

      toggle_css_respond(parseInt(choice));
      disable_buttons();

      if (response.button === 0) {
        sendCardToLeft();
      } else if (response.button === 1) {
        sendCardToRight();
      }

      if (trial.response_ends_trial) {
        if (trial.swipe_animation_duration > 0) {
          this.jsPsych.pluginAPI.setTimeout(end_trial, trial.swipe_animation_duration);
        } else {
          end_trial();
        }
      }
    };

    let keyboardListener;

    // start the response listener
    if (trial.keyboard_choices != "NO_KEYS") {
      keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_keyboard_response,
        valid_responses: trial.keyboard_choices,
        rt_method: "performance",
        persist: false,
        allow_held_key: false,
      });
    }

    // function to end trial when it is time
    const end_trial = () => {
      // kill keyboard listeners
      if (typeof keyboardListener !== "undefined") {
        this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      interact(stimulus_div).unset();

      // gather the data to store for the trial
      const trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        button_response: response.button,
        keyboard_response: response.key,
        swipe_response: response.swipe,
        response_source: response.source,
      };

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);
    };

    // hide stimulus if stimulus_duration is set
    if (trial.stimulus_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        display_element.querySelector<HTMLElement>(
          "#jspsych-html-swipe-response-stimulus"
        ).style.visibility = "hidden";
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
    }
  }

  simulate(
    trial: TrialType<Info>,
    simulation_mode,
    simulation_options: any,
    load_callback: () => void
  ) {
    if (simulation_mode == "data-only") {
      load_callback();
      this.simulate_data_only(trial, simulation_options);
    }
    if (simulation_mode == "visual") {
      this.simulate_visual(trial, simulation_options, load_callback);
    }
  }

  private create_simulation_data(trial: TrialType<Info>, simulation_options) {
    const keyboard_data = {
      stimulus: trial.stimulus,
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      button_response: null,
      keyboard_response: this.jsPsych.pluginAPI.getValidKey(trial.keyboard_choices),
      swipe_response: null,
      response_source: "keyboard",
    };

    const swipe_data = {
      stimulus: trial.stimulus,
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      button_response: null,
      swipe_response: Math.random() < 0.5 ? "left" : "right",
      keyboard_response: null,
      response_source: "swipe",
    };

    const button_data = {
      stimulus: trial.stimulus,
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      button_response: this.jsPsych.randomization.randomInt(0, trial.button_choices.length - 1),
      swipe_response: null,
      keyboard_response: null,
      response_source: "button",
    };

    let default_data;

    if (Math.random() < 0.33) {
      default_data = keyboard_data;
    } else if (Math.random() < 0.5) {
      default_data = swipe_data;
    } else {
      default_data = button_data;
    }

    const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);

    this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);

    return data;
  }

  private simulate_data_only(trial: TrialType<Info>, simulation_options) {
    const data = this.create_simulation_data(trial, simulation_options);

    this.jsPsych.finishTrial(data);
  }

  private simulate_visual(trial: TrialType<Info>, simulation_options, load_callback: () => void) {
    const data = this.create_simulation_data(trial, simulation_options);

    const display_element = this.jsPsych.getDisplayElement();

    this.trial(display_element, trial);
    load_callback();

    if (data.rt !== null) {
      if (data.swipe_response !== null) {
        const test_stimulus_div = document.getElementById("jspsych-html-swipe-response-stimulus");

        let pageX = trial.swipe_threshold * 5;
        if (data.swipe_response === "left") {
          pageX *= -1;
        }

        setTimeout(() => {
          interact(test_stimulus_div).fire({
            type: "dragstart",
            target: test_stimulus_div,
          });

          interact(test_stimulus_div).fire({
            type: "dragmove",
            target: test_stimulus_div,
            delta: { x: pageX, y: 0 },
          });

          interact(test_stimulus_div).fire({
            type: "dragend",
            target: test_stimulus_div,
            delta: { x: pageX, y: 0 },
          });
        }, data.rt);
      } else if (data.keyboard_response !== null) {
        this.jsPsych.pluginAPI.pressKey(data.keyboard_response, data.rt);
      } else {
        this.jsPsych.pluginAPI.clickTarget(
          display_element.querySelector(`div[data-choice="${data.button_response}"] button`),
          data.rt
        );
      }
    }
  }
}

export default HtmlSwipeResponsePlugin;
