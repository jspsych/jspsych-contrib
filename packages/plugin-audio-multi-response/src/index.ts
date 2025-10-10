import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
import { AudioPlayer, AudioPlayerInterface } from "jspsych/src/modules/plugin-api/AudioPlayer";

import { version } from "../package.json";

const info = <const>{
  name: "audio-multi-response",
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
      default: "NO_KEYS",
    },
    /**
     * A function that generates the HTML for each button in the `button_choices` array.
     * The function gets the string and index of the item in the `button_choices` array and should return valid HTML.
     * If you want to use different markup for each button, you can do that by using a conditional on either parameter.
     * The default parameter returns a button element with the text label of the choice.
     */
    button_html: {
      type: ParameterType.FUNCTION,
      pretty_name: "Button HTML",
      default: function (choice: string) {
        return `<button class="jspsych-btn">${choice}</button>`;
      },
    },
    /** Any content here will be displayed below the stimulus. */
    prompt: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Prompt",
      default: null,
    },
    /** Whether to display the prompt above the buttons. */
    prompt_above_buttons: {
      type: ParameterType.BOOL,
      pretty_name: "Prompt above buttons",
      default: false,
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
    /** If true, then the trial will end as soon as the audio file finishes playing. */
    trial_ends_after_audio: {
      type: ParameterType.BOOL,
      pretty_name: "Trial ends after audio",
      default: false,
    },
    /** If true, then responses are allowed while the audio is playing. If false, then the audio must finish playing before a response is accepted. */
    response_allowed_while_playing: {
      type: ParameterType.BOOL,
      pretty_name: "Response allowed while playing",
      default: true,
    },
  },
  data: {
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus
     * first began playing until the participant made a key response. */
    rt: {
      type: ParameterType.INT,
    },
    /** The HTML content that was displayed on the screen. */
    stimulus: {
      type: ParameterType.STRING,
    },
    /** Indicates which key the participant pressed. If the participant responded using button clicks, then this field will be `null`. */
    keyboard_response: {
      type: ParameterType.STRING,
    },
    /** Indicates which button the participant pressed. The first button in the `button_choices` array is 0,
     * the second is 1, and so on. If the participant responded using the keyboard,
     * then this field will be `null`. */
    button_response: {
      type: ParameterType.INT,
    },
    /** Indicates the source of the response. This will either be `"button"` or `"keyboard"`. */
    response_source: {
      type: ParameterType.STRING,
    },
  },
};

type Info = typeof info;

/**
 * **audio-multi-response**
 * jsPsych plugin for playing an audio file and getting a button or keyboard response
 * @author Adam Richie-Halford
 * @see {@link https://www.jspsych.org/plugins/jspsych-audio-multi-response/ audio-multi-response plugin documentation on jspsych.org}
 */
class AudioMultiResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;
  private audio: AudioPlayerInterface;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>, on_load: () => void) {
    // hold the .resolve() function from the Promise that ends the trial
    let trial_complete;

    // setup stimulus
    var context = this.jsPsych.pluginAPI.audioContext();

    // store response
    let response = {
      rt: null,
      key: null,
      button: null,
      source: null,
    };

    // record webaudio context start time
    var startTime: number;

    // load audio file
    this.jsPsych.pluginAPI
      .getAudioPlayer(trial.stimulus)
      .then((player) => {
        this.audio = player;
        setupTrial();
      })
      .catch((err) => {
        console.error(
          `Failed to load audio file "${trial.stimulus}". Try checking the file path. We recommend using the preload plugin to load audio files.`
        );
        console.error(err);
      });

    const setupTrial = () => {
      // set up end event if trial needs it
      if (trial.trial_ends_after_audio) {
        this.audio.addEventListener("ended", end_trial);
      }

      // enable buttons after audio ends if necessary
      if (!trial.response_allowed_while_playing && !trial.trial_ends_after_audio) {
        this.audio.addEventListener("ended", setup_keyboard_listener);
        this.audio.addEventListener("ended", enable_buttons);
      }

      let html = '<div id="jspsych-audio-multi-response-btngroup">';

      for (var i = 0; i < trial.button_choices.length; i++) {
        var str = trial.button_html(trial.button_choices[i]);
        html +=
          '<div class="jspsych-audio-multi-response-button" style="cursor: pointer; display: inline-block; margin:' +
          trial.margin_vertical +
          " " +
          trial.margin_horizontal +
          '" id="jspsych-audio-multi-response-button-' +
          i +
          '" data-choice="' +
          i +
          '">' +
          str +
          "</div>";
      }
      html += "</div>";

      // show prompt if there is one
      if (trial.prompt !== null) {
        if (trial.prompt_above_buttons) {
          html = '<div id="jspsych-audio-multi-response-prompt">' + trial.prompt + "</div>" + html;
        } else {
          html += '<div id="jspsych-audio-multi-response-prompt">' + trial.prompt + "</div>";
        }
      }

      display_element.innerHTML = html;

      if (trial.response_allowed_while_playing) {
        enable_buttons();
        setup_keyboard_listener();
      } else {
        disable_buttons();
      }

      // start time
      startTime = performance.now();

      this.audio.play();

      // end trial if time limit is set
      if (trial.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          end_trial();
        }, trial.trial_duration);
      }

      on_load();
    };

    // function to end trial when it is time
    const end_trial = () => {
      this.audio.stop();

      this.audio.removeEventListener("ended", end_trial);
      this.audio.removeEventListener("ended", setup_keyboard_listener);
      this.audio.removeEventListener("ended", enable_buttons);

      // kill keyboard listeners
      this.jsPsych.pluginAPI.cancelAllKeyboardResponses();

      // gather the data to store for the trial
      const trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        keyboard_response: response.key,
        button_response: response.button,
        response_source: response.source,
      };

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);

      trial_complete();
    };

    function button_response(e) {
      var choice = e.currentTarget.getAttribute("data-choice"); // don't use dataset for jsdom compatibility
      after_button_response(choice);
    }

    function disable_buttons() {
      var btns = document.querySelectorAll(".jspsych-audio-multi-response-button");
      for (var i = 0; i < btns.length; i++) {
        var btn_el = btns[i].querySelector("button");
        if (btn_el) {
          btn_el.disabled = true;
        }
        btns[i].removeEventListener("click", button_response);
      }
    }

    function enable_buttons() {
      var btns = document.querySelectorAll(".jspsych-audio-multi-response-button");
      for (var i = 0; i < btns.length; i++) {
        var btn_el = btns[i].querySelector("button");
        if (btn_el) {
          btn_el.disabled = false;
        }
        btns[i].addEventListener("click", button_response);
      }
    }

    // function to handle responses by the participant
    function after_button_response(choice: string) {
      // measure rt
      var endTime = performance.now();
      var rt = Math.round(endTime - startTime);

      response.button = parseInt(choice);
      response.rt = rt;
      response.source = "button";

      // disable all the buttons after a response
      disable_buttons();

      if (trial.response_ends_trial) {
        end_trial();
      }
    }

    // function to handle keyboard responses by the participant
    const after_keyboard_response = (info) => {
      // only record the first response
      if (response.key == null) {
        response = {
          source: "keyboard",
          button: null,
          ...info,
        };
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    const setup_keyboard_listener = () => {
      // start the keyboard response listener
      if (trial.keyboard_choices != "NO_KEYS") {
        let responseArgs;

        if (context !== null) {
          responseArgs = {
            rt_method: "audio",
            audio_context: context,
            audio_context_start_time: startTime,
          };
        } else {
          responseArgs = {
            rt_method: "performance",
          };
        }

        this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_keyboard_response,
          valid_responses: trial.keyboard_choices,
          persist: false,
          allow_held_key: false,
          ...responseArgs,
        });
      }
    };

    return new Promise((resolve) => {
      trial_complete = resolve;
    });
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
      keyboard_response: this.jsPsych.pluginAPI.getValidKey(trial.keyboard_choices),
      button_response: null,
      response_source: "keyboard",
    };

    const button_data = {
      stimulus: trial.stimulus,
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      button_response: this.jsPsych.randomization.randomInt(0, trial.button_choices.length - 1),
      keyboard_response: null,
      response_source: "button",
    };

    const default_data = Math.random() < 0.5 ? keyboard_data : button_data;

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

    const respond = () => {
      if (data.rt !== null) {
        if (data.button_response !== null) {
          this.jsPsych.pluginAPI.clickTarget(
            display_element.querySelector(`div[data-choice="${data.response}"] button`),
            data.rt
          );
        } else {
          this.jsPsych.pluginAPI.pressKey(data.keyboard_response, data.rt);
        }
      }
    };

    this.trial(display_element, trial, () => {
      load_callback();
      if (!trial.response_allowed_while_playing) {
        this.audio.addEventListener("ended", respond);
      } else {
        respond();
      }
    });
  }
}

export default AudioMultiResponsePlugin;
