import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "html-keyboard-response-raf",
  version: version,
  parameters: {
    /**
     * The HTML string to be displayed.
     */
    stimulus: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Stimulus",
      default: undefined,
    },
    /**
     * Array containing the key(s) the participant is allowed to press to respond to the stimulus.
     */
    choices: {
      type: ParameterType.KEYS,
      pretty_name: "Choices",
      default: "ALL_KEYS",
    },
    /**
     * Any content here will be displayed below the stimulus.
     */
    prompt: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Prompt",
      default: null,
    },
    /**
     * How long to show the stimulus.
     */
    stimulus_duration: {
      type: ParameterType.INT,
      pretty_name: "Stimulus duration",
      default: null,
    },
    /**
     * How long to show trial before it ends.
     */
    trial_duration: {
      type: ParameterType.INT,
      pretty_name: "Trial duration",
      default: null,
    },
    /**
     * If true, trial will end when participant makes a response.
     */
    response_ends_trial: {
      type: ParameterType.BOOL,
      pretty_name: "Response ends trial",
      default: true,
    },
    /**
     * Frames per second for requestAnimationFrame.
     */
    fps: {
      type: ParameterType.INT,
      pretty_name: "FPS",
      default: 60,
    },
  },
  data: {
    /** The response time in milliseconds for the participant to make a response.
     * The time is measured from when the stimulus first appears on the screen until the participant's response. */
    rt: {
      type: ParameterType.INT,
    },
    /** Indicates which key the participant pressed. */
    response: {
      type: ParameterType.STRING,
    },
    /** The HTML content that was displayed on the screen. */
    stimulus: {
      type: ParameterType.STRING,
    },
  },
};

type Info = typeof info;

/**
 * **html-keyboard-response-raf**
 *
 * jsPsych plugin for displaying a stimulus and getting a keyboard response, using requestAnimationFrame for timing.
 *
 * @author Josh de Leeuw
 */
class HtmlKeyboardResponseRafPlugin implements JsPsychPlugin<Info> {
  static info = info;

  private keyboardListener;
  private hideStimulusFrameCount: number = Infinity;
  private endTrialFrameCount: number = Infinity;
  private stimulusIsHidden = false;
  private currAnimationFrameHandler: number;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var new_html = '<div id="jspsych-html-keyboard-response-stimulus">' + trial.stimulus + "</div>";

    // add prompt
    if (trial.prompt !== null) {
      new_html += trial.prompt;
    }

    // store response
    var response = {
      rt: null,
      key: null,
    };

    var frame_counter = 0;

    // draw
    this.currAnimationFrameHandler = requestAnimationFrame(() => {
      display_element.innerHTML = new_html;

      // start the response listener
      if (trial.choices != "NO_KEYS") {
        this.keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: trial.choices,
          rt_method: "performance",
          persist: false,
          allow_held_key: false,
        });
      }

      // hide stimulus if stimulus_duration is set
      if (trial.stimulus_duration !== null) {
        this.hideStimulusFrameCount = Math.round(trial.stimulus_duration / (1000 / trial.fps));
      }

      // end trial if trial_duration is set
      if (trial.trial_duration !== null) {
        this.endTrialFrameCount = Math.round(trial.trial_duration / (1000 / trial.fps));
      }

      this.currAnimationFrameHandler = requestAnimationFrame(checkForEnd);
    });

    const checkForEnd = () => {
      frame_counter++;
      if (frame_counter >= this.hideStimulusFrameCount && !this.stimulusIsHidden) {
        this.stimulusIsHidden = true;
        display_element.querySelector<HTMLElement>(
          "#jspsych-html-keyboard-response-stimulus"
        ).style.visibility = "hidden";
      }
      if (frame_counter >= this.endTrialFrameCount) {
        end_trial();
      } else {
        this.currAnimationFrameHandler = requestAnimationFrame(checkForEnd);
      }
    };

    // function to end trial when it is time
    const end_trial = () => {
      cancelAnimationFrame(this.currAnimationFrameHandler);

      // kill keyboard listeners
      if (typeof this.keyboardListener !== "undefined") {
        this.jsPsych.pluginAPI.cancelKeyboardResponse(this.keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        response: response.key,
      };

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the participant
    const after_response = (info) => {
      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector("#jspsych-html-keyboard-response-stimulus").className +=
        " responded";

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };
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
    const default_data = {
      stimulus: trial.stimulus,
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      response: this.jsPsych.pluginAPI.getValidKey(trial.choices),
    };

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
      this.jsPsych.pluginAPI.pressKey(data.response, data.rt);
    }
  }
}

export default HtmlKeyboardResponseRafPlugin;
