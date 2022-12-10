import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "audio-multi-response",
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
    /** Array containing the key(s) the subject is allowed to press to respond to the stimulus. */
    keyboard_choices: {
      type: ParameterType.KEYS,
      pretty_name: "Keyboard Choices",
      default: "NO_KEYS",
    },
    /** The HTML for creating button. Can create own style. Use the "%choice%" string to indicate where the label from the choices parameter should be inserted. */
    button_html: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Button HTML",
      default: '<button class="jspsych-btn">%choice%</button>',
      array: true,
    },
    /** Any content here will be displayed below the stimulus. */
    prompt: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Prompt",
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
    /** If true, trial will end when subject makes a response. */
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
  private audio;

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
    var startTime;

    // load audio file
    this.jsPsych.pluginAPI
      .getAudioBuffer(trial.stimulus)
      .then((buffer) => {
        if (context !== null) {
          this.audio = context.createBufferSource();
          this.audio.buffer = buffer;
          this.audio.connect(context.destination);
        } else {
          this.audio = buffer;
          this.audio.currentTime = 0;
        }
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

      //display buttons
      var buttons = [];
      if (Array.isArray(trial.button_html)) {
        if (trial.button_html.length == trial.button_choices.length) {
          buttons = trial.button_html;
        } else {
          console.error(
            "Error in audio-multi-response plugin. The length of the button_html array does not equal the length of the choices array"
          );
        }
      } else {
        for (var i = 0; i < trial.button_choices.length; i++) {
          buttons.push(trial.button_html);
        }
      }

      var html = '<div id="jspsych-audio-multi-response-btngroup">';
      for (var i = 0; i < trial.button_choices.length; i++) {
        var str = buttons[i].replace(/%choice%/g, trial.button_choices[i]);
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

      //show prompt if there is one
      if (trial.prompt !== null) {
        html += '<div id="jspsych-audio-multi-response-prompt">' + trial.prompt + "</div>";
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

      // start audio
      if (context !== null) {
        startTime = context.currentTime;
        this.audio.start(startTime);
      } else {
        this.audio.play();
      }

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
      // kill any remaining setTimeout handlers
      this.jsPsych.pluginAPI.clearAllTimeouts();

      // stop the audio file if it is playing
      // remove end event listeners if they exist
      if (context !== null) {
        this.audio.stop();
      } else {
        this.audio.pause();
      }

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

      // clear the display
      display_element.innerHTML = "";

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

    // function to handle responses by the subject
    function after_button_response(choice) {
      // measure rt
      var endTime = performance.now();
      var rt = Math.round(endTime - startTime);
      if (context !== null) {
        endTime = context.currentTime;
        rt = Math.round((endTime - startTime) * 1000);
      }
      response.button = parseInt(choice);
      response.rt = rt;
      response.source = "button";

      // disable all the buttons after a response
      disable_buttons();

      if (trial.response_ends_trial) {
        end_trial();
      }
    }

    // function to handle keyboard responses by the subject
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
