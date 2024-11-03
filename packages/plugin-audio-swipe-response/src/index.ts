import interact from "interactjs";
import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
import { AudioPlayerInterface } from "jspsych/src/modules/plugin-api/AudioPlayer";

import { version } from "../package.json";

const info = <const>{
  name: "audio-swipe-response",
  version: version,
  parameters: {
    /** The HTML string to be displayed. */
    stimulus: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Stimulus",
      default: undefined,
    },
    /** Array containing the key(s) the participant is allowed to press to respond to the stimulus. */
    keyboard_choices: {
      type: ParameterType.KEYS,
      pretty_name: "Keyboard Choices",
      default: ["ArrowLeft", "ArrowRight"],
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
    /** Indicates which direction the participant swiped. This will be either `"left"` or `"right"`.
     * If the participant responded using the keyboard, then this field will be `null`. */
    swipe_response: {
      type: ParameterType.INT,
    },
    /** Indicates the source of the response. This will either be `"swipe"` or `"keyboard"`. */
    response_source: {
      type: ParameterType.STRING,
    },
  },
};

type Info = typeof info;

/**
 * **audio-swipe-response**
 *
 * jsPsych plugin for playing an audio file and getting a swipe response
 * @author Adam Richie-Halford
 * @see {@link https://www.jspsych.org/plugins/jspsych-audio-swipe-response/ audio-swipe-response plugin documentation on jspsych.org}
 */
class AudioSwipeResponsePlugin implements JsPsychPlugin<Info> {
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
      swipe: null,
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

      // show prompt if there is one
      if (trial.prompt !== null) {
        display_element.innerHTML = trial.prompt;
      }

      // start audio
      this.audio.play();

      // start keyboard listener when trial starts or sound ends
      if (trial.response_allowed_while_playing) {
        setup_keyboard_listener();
        setup_swipe_listener();
      } else if (!trial.trial_ends_after_audio) {
        this.audio.addEventListener("ended", setup_keyboard_listener);
        this.audio.addEventListener("ended", setup_swipe_listener);
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
      // stop the audio file if it is playing
      this.audio.stop();

      // remove end event listeners if they exist
      this.audio.removeEventListener("ended", end_trial);
      this.audio.removeEventListener("ended", setup_keyboard_listener);

      // kill keyboard listeners
      this.jsPsych.pluginAPI.cancelAllKeyboardResponses();

      // kill the swipe interaction
      interact(display_element).unset();

      // gather the data to store for the trial
      const trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        keyboard_response: response.key,
        swipe_response: response.swipe,
        response_source: response.source,
      };

      // reset display element position
      resetPosition();

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);

      trial_complete();
    };

    let position = {
      x: 0,
      y: 0,
      rotation: 0,
    };

    const setPosition = (coordinates) => {
      const { x = 0, y = 0, rotation = 0 } = coordinates;
      position = { x, y, rotation };
      display_element.style.transform = `translate3D(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
    };

    const resetPosition = async () => {
      display_element.style.transition = `${trial.swipe_animation_duration / 1000}s ease-in-out, ${
        trial.swipe_animation_duration / 1000
      }s ease-in`;
      setPosition({ x: 0, y: 0, rotation: 0 });
      display_element.style.transition = null;
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

    const sendCardToLeft = async () => {
      display_element.style.transition = `${trial.swipe_animation_duration / 1000}s ease-in-out, ${
        trial.swipe_animation_duration / 1000
      }s ease-in`;
      setPosition({ x: -trial.swipe_offscreen_coordinate, y: position.y, rotation: 0 });
    };

    const sendCardToRight = async () => {
      display_element.style.transition = `${trial.swipe_animation_duration / 1000}s ease-in-out, ${
        trial.swipe_animation_duration / 1000
      }s ease-in`;
      setPosition({ x: trial.swipe_offscreen_coordinate, y: position.y, rotation: 0 });
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
          swipe: left_or_right,
          source: "swipe",
        };
      }

      if (trial.response_ends_trial) {
        if (trial.swipe_animation_duration > 0) {
          this.jsPsych.pluginAPI.setTimeout(end_trial, trial.swipe_animation_duration);
        } else {
          end_trial();
        }
      }
    };

    const setup_swipe_listener = () => {
      interact(display_element).draggable({
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
    };

    // function to handle keyboard responses by the participant
    const after_keyboard_response = (info) => {
      // only record the first response
      if (response.key == null) {
        response = {
          source: "keyboard",
          swipe: null,
          ...info,
        };
      }

      if (response.key.toLowerCase() == trial.keyboard_choices[0].toLowerCase()) {
        sendCardToLeft();
      } else if (response.key.toLowerCase() == trial.keyboard_choices[1].toLowerCase()) {
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
      swipe_response: null,
      response_source: "keyboard",
    };

    const swipe_data = {
      stimulus: trial.stimulus,
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      swipe_response: Math.random() < 0.5 ? "left" : "right",
      keyboard_response: null,
      response_source: "swipe",
    };

    const default_data = Math.random() < 0.5 ? keyboard_data : swipe_data;

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
        if (data.swipe_response !== null) {
          const test_stimulus_div = document.getElementById(
            "jspsych-audio-swipe-response-stimulus"
          );

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

export default AudioSwipeResponsePlugin;
