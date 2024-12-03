import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "image-array-keyboard-response",
  version: version,
  parameters: {
    /** The images to be displayed */
    stimulus: {
      type: ParameterType.IMAGE,
      pretty_name: "Stimulus",
      default: undefined,
      array: true,
    },
    /**
     * Set the image rectangle in pixels, each array in the form of [positionX, positionY, width, height].
     * If width and height are left null, then the image will display at its natural height.
     */
    stimulus_rect: {
      type: ParameterType.COMPLEX,
      pretty_name: "Image rectangle",
      default: null,
      array: true,
    },
    /** Maintain the aspect ratio after setting width or height */
    maintain_aspect_ratio: {
      type: ParameterType.BOOL,
      pretty_name: "Maintain aspect ratio",
      default: true,
    },
    /** Array containing the key(s) the participant is allowed to press to respond to the stimulus. */
    choices: {
      type: ParameterType.KEYS,
      pretty_name: "Choices",
      default: "ALL_KEYS",
    },
    /** How long to show the stimulus. */
    stimulus_duration: {
      type: ParameterType.INT,
      pretty_name: "Stimulus duration",
      default: null,
    },
    /** How long to show trial before it ends */
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
    /**
     * If true, the image will be drawn onto a canvas element (prevents blank screen between consecutive images in some browsers).
     * If false, the image will be shown via an img element.
     */
    render_on_canvas: {
      type: ParameterType.BOOL,
      pretty_name: "Render on canvas",
      default: true,
    },
  },
  data: {
    /** The response time in milliseconds for the participant to make a response.
     * The time is measured from when the stimulus first appears on the screen until the participant's response. */
    rt: {
      type: ParameterType.INT,
    },
    /** The paths to the stimuli shown in the trial. */
    stimulus: {
      type: ParameterType.STRING,
      array: true,
    },
    /** The key that the participant pressed. */
    response: {
      type: ParameterType.STRING,
    },
  },
};

type Info = typeof info;

/**
 * **image-array-keyboard-response**
 *
 * jsPsych plugin for displaying an image array and getting a keyboard response
 *
 * @author Younes Strittmatter
 * @see {@link https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-image-array-keyboard-response image-array-keyboard-response plugin documentation on github.com}
 */
class ImageArrayKeyboardResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    let height: number, width: number;
    if (trial.render_on_canvas) {
      let image_drawn = [];
      // first clear the display element (because the render_on_canvas method appends to display_element instead of overwriting it with .innerHTML)
      if (display_element.hasChildNodes()) {
        // can't loop through child list because the list will be modified by .removeChild()
        while (display_element.firstChild) {
          display_element.removeChild(display_element.firstChild);
        }
      }

      // create canvas element and image
      let canvas = document.createElement("canvas");
      canvas.id = "jspsych-image-keyboard-response-stimulus";
      canvas.style.margin = "0";
      canvas.style.padding = "0";
      canvas.width = document.body.clientWidth;
      canvas.height = document.body.clientHeight;
      let ctx = canvas.getContext("2d");
      for (let i = 0; i < trial.stimulus.length; i++) {
        const x = trial.stimulus_rect[i][0];
        const y = trial.stimulus_rect[i][1];
        let img = new Image();
        img.onload = () => {
          // if image wasn't preloaded, then it will need to be drawn whenever it finishes loading
          if (image_drawn.length < i || !image_drawn[i]) {
            getHeightWidth(); // only possible to get width/height after image loads
            ctx.drawImage(img, x, y, width, height);
          }
        };
        img.src = trial.stimulus[i];

        // get/set image height and width - this can only be done after image loads because uses image's naturalWidth/naturalHeight properties
        const getHeightWidth = () => {
          const stimulus_height = trial.stimulus_rect[i][3];
          const stimulus_width = trial.stimulus_rect[i][2];

          if (stimulus_height !== null) {
            height = stimulus_height;
            if (stimulus_width == null && trial.maintain_aspect_ratio) {
              width = img.naturalWidth * (stimulus_height / img.naturalHeight);
            }
          } else {
            height = img.naturalHeight;
          }
          if (stimulus_width !== null) {
            width = stimulus_width;
            if (stimulus_height == null && trial.maintain_aspect_ratio) {
              height = img.naturalHeight * (stimulus_width / img.naturalWidth);
            }
          } else if (!(stimulus_height !== null && trial.maintain_aspect_ratio)) {
            // if stimulus width is null, only use the image's natural width if the width value wasn't set
            // in the if statement above, based on a specified height and maintain_aspect_ratio = true
            width = img.naturalWidth;
          }
          //canvas.height = height;
          //canvas.width = width;
        };
        getHeightWidth(); // call now, in case image loads immediately (is cached)
        // add canvas and draw image
        display_element.insertBefore(canvas, null);
        if (img.complete && Number.isFinite(width) && Number.isFinite(height)) {
          // if image has loaded and width/height have been set, then draw it now
          // (don't rely on img onload function to draw image when image is in the cache, because that causes a delay in the image presentation)
          ctx.drawImage(img, x, y, width, height);
          image_drawn[i] = true;
        }
      }
    } else {
      for (let i = 0; i < trial.stimulus.length; i++) {
        let stimulus_height = trial.stimulus_rect[i][3];
        let stimulus_width = trial.stimulus_rect[i][2];
        let x = trial.stimulus_rect[i][0];
        let y = trial.stimulus_rect[i][1];

        // display stimulus as an image element
        display_element.innerHTML +=
          '<img src="' +
          trial.stimulus[i] +
          '" id="jspsych-image-keyboard-response-stimulus-' +
          i.toString() +
          '">';
        // add prompt
        // update the page content

        // set image dimensions after image has loaded (so that we have access to naturalHeight/naturalWidth)
        let img = display_element.querySelector(
          "#jspsych-image-keyboard-response-stimulus-" + i.toString()
        ) as HTMLImageElement;
        if (stimulus_height !== null) {
          height = stimulus_height;
          if (stimulus_width == null && trial.maintain_aspect_ratio) {
            width = img.naturalWidth * (stimulus_height / img.naturalHeight);
          }
        } else {
          height = img.naturalHeight;
        }
        if (stimulus_width !== null) {
          width = stimulus_width;
          if (stimulus_height == null && trial.maintain_aspect_ratio) {
            height = img.naturalHeight * (stimulus_width / img.naturalWidth);
          }
        } else if (!(stimulus_height !== null && trial.maintain_aspect_ratio)) {
          // if stimulus width is null, only use the image's natural width if the width value wasn't set
          // in the if statement above, based on a specified height and maintain_aspect_ratio = true
          width = img.naturalWidth;
        }
        img.style.height = height.toString() + "px";
        img.style.width = width.toString() + "px";
        img.style.left = x.toString() + "px";
        img.style.top = y.toString() + "px";
        img.style.position = "absolute";
      }
    }

    // store response
    var response = {
      rt: null,
      key: null,
    };

    // function to end trial when it is time
    const end_trial = () => {
      // kill keyboard listeners
      if (typeof keyboardListener !== "undefined") {
        this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
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
    var after_response = (info) => {
      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      for (let i; i < trial.stimulus.length; i++) {
        display_element.querySelector(
          "#jspsych-image-keyboard-response-stimulus-" + i.toString()
        ).className += " responded";
      }

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start the response listener
    if (trial.choices != "NO_KEYS") {
      var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: "performance",
        persist: false,
        allow_held_key: false,
      });
    }

    // hide stimulus if stimulus_duration is set
    if (trial.stimulus_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        for (let i; i < trial.stimulus.length; i++) {
          display_element.querySelector<HTMLElement>(
            "#jspsych-image-keyboard-response-stimulus-" + i.toString()
          ).style.visibility = "hidden";
        }
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        end_trial();
      }, trial.trial_duration);
    } else if (trial.response_ends_trial === false) {
      console.warn(
        "The experiment may be deadlocked. Try setting a trial duration or set response_ends_trial to true."
      );
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
}

export default ImageArrayKeyboardResponsePlugin;
