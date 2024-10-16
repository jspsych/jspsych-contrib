import interact from "interactjs";
import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "image-swipe-response",
  version: "2.0.0",
  parameters: {
    /** The image to be displayed */
    stimulus: {
      type: ParameterType.IMAGE,
      pretty_name: "Stimulus",
      default: undefined,
    },
    /** Set the image height in pixels */
    stimulus_height: {
      type: ParameterType.INT,
      pretty_name: "Image height",
      default: null,
    },
    /** Set the image width in pixels */
    stimulus_width: {
      type: ParameterType.INT,
      pretty_name: "Image width",
      default: null,
    },
    /** Maintain the aspect ratio after setting width or height */
    maintain_aspect_ratio: {
      type: ParameterType.BOOL,
      pretty_name: "Maintain aspect ratio",
      default: true,
    },
    /** Array containing the key(s) the subject is allowed to press to respond to the stimulus. */
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
    /** If true, trial will end when subject makes a response. */
    response_ends_trial: {
      type: ParameterType.BOOL,
      pretty_name: "Response ends trial",
      default: true,
    },
    /** How far away from the center should the subject have to swipe for a
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
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the
     * stimulus first appears on the screen until the participant's response.
     */
    rt: {
      type: ParameterType.INT,
    },
    /** The file path of the image displayed. */
    stimulus: {
      type: ParameterType.STRING,
    },
    /** Indicates which key the subject pressed. If the subject responded using button clicks,
     * then this field will be `null`. */
    keyboard_response: {
      type: ParameterType.STRING,
    },
    /** Indicates which direction the subject swiped. If the subject responded using the keyboard,
     * then this field will be `null`. */
    swipe_response: {
      type: ParameterType.STRING,
    },
    /** The source of the response. This will either be `"swipe"` or `"keyboard"`. */
    response_source: {
      type: ParameterType.STRING,
    },
  },
};

type Info = typeof info;

/**
 * **image-swipe-response**
 * jsPsych plugin for displaying a stimulus and getting a swipe response
 * @author Adam Richie-Halford
 * @see {@link https://www.jspsych.org/plugins/jspsych-image-swipe-response/ image-swipe-response plugin documentation on jspsych.org}
 */
class ImageSwipeResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var height: number, width: number;
    if (trial.render_on_canvas) {
      var image_drawn = false;
      // first clear the display element (because the render_on_canvas method appends to display_element instead of overwriting it with .innerHTML)
      if (display_element.hasChildNodes()) {
        // can't loop through child list because the list will be modified by .removeChild()
        while (display_element.firstChild) {
          display_element.removeChild(display_element.firstChild);
        }
      }
      // create canvas element and image
      var canvas = document.createElement("canvas");
      canvas.id = "jspsych-image-swipe-response-stimulus";
      canvas.style.margin = "0";
      canvas.style.padding = "0";
      var ctx = canvas.getContext("2d");
      var img = new Image();
      img.onload = () => {
        // if image wasn't preloaded, then it will need to be drawn whenever it finishes loading
        if (!image_drawn) {
          getHeightWidth(); // only possible to get width/height after image loads
          ctx.drawImage(img, 0, 0, width, height);
        }
      };
      img.src = trial.stimulus;
      // get/set image height and width - this can only be done after image loads because uses image's naturalWidth/naturalHeight properties
      const getHeightWidth = () => {
        if (trial.stimulus_height !== null) {
          height = trial.stimulus_height;
          if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
            width = img.naturalWidth * (trial.stimulus_height / img.naturalHeight);
          }
        } else {
          height = img.naturalHeight;
        }
        if (trial.stimulus_width !== null) {
          width = trial.stimulus_width;
          if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
            height = img.naturalHeight * (trial.stimulus_width / img.naturalWidth);
          }
        } else if (!(trial.stimulus_height !== null && trial.maintain_aspect_ratio)) {
          // if stimulus width is null, only use the image's natural width if the width value wasn't set
          // in the if statement above, based on a specified height and maintain_aspect_ratio = true
          width = img.naturalWidth;
        }
        canvas.height = height;
        canvas.width = width;
      };
      getHeightWidth(); // call now, in case image loads immediately (is cached)
      // add canvas and draw image
      display_element.insertBefore(canvas, null);
      if (img.complete && Number.isFinite(width) && Number.isFinite(height)) {
        // if image has loaded and width/height have been set, then draw it now
        // (don't rely on img onload function to draw image when image is in the cache, because that causes a delay in the image presentation)
        ctx.drawImage(img, 0, 0, width, height);
        image_drawn = true;
      }
      // add prompt if there is one
      if (trial.prompt !== null) {
        display_element.insertAdjacentHTML("beforeend", trial.prompt);
      }
    } else {
      // display stimulus as an image element
      var html = '<img src="' + trial.stimulus + '" id="jspsych-image-swipe-response-stimulus">';
      // add prompt
      if (trial.prompt !== null) {
        html += trial.prompt;
      }
      // update the page content
      display_element.innerHTML = html;

      // set image dimensions after image has loaded (so that we have access to naturalHeight/naturalWidth)
      var img = display_element.querySelector(
        "#jspsych-image-swipe-response-stimulus"
      ) as HTMLImageElement;
      if (trial.stimulus_height !== null) {
        height = trial.stimulus_height;
        if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
          width = img.naturalWidth * (trial.stimulus_height / img.naturalHeight);
        }
      } else {
        height = img.naturalHeight;
      }
      if (trial.stimulus_width !== null) {
        width = trial.stimulus_width;
        if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
          height = img.naturalHeight * (trial.stimulus_width / img.naturalWidth);
        }
      } else if (!(trial.stimulus_height !== null && trial.maintain_aspect_ratio)) {
        // if stimulus width is null, only use the image's natural width if the width value wasn't set
        // in the if statement above, based on a specified height and maintain_aspect_ratio = true
        width = img.naturalWidth;
      }
      img.style.height = height.toString() + "px";
      img.style.width = width.toString() + "px";
    }

    // store response
    let response = {
      rt: null,
      key: null,
      swipe: null,
      source: null,
    };

    const stimulus_div = document.getElementById("jspsych-image-swipe-response-stimulus");

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

    const sendCardToLeft = async () => {
      stimulus_div.style.transition = `${trial.swipe_animation_duration / 1000}s ease-in-out, ${
        trial.swipe_animation_duration / 1000
      }s ease-in`;
      setPosition({ x: -trial.swipe_offscreen_coordinate, y: position.y, rotation: 0 });
    };

    const sendCardToRight = async () => {
      stimulus_div.style.transition = `${trial.swipe_animation_duration / 1000}s ease-in-out, ${
        trial.swipe_animation_duration / 1000
      }s ease-in`;
      setPosition({ x: trial.swipe_offscreen_coordinate, y: position.y, rotation: 0 });
    };

    // after a valid response, the stimulus will have the CSS class 'responded'
    // which can be used to provide visual feedback that a response was recorded
    const toggle_css_respond = () => {
      display_element.querySelector("#jspsych-image-swipe-response-stimulus").className +=
        " responded";
    };

    // function to handle swipe responses by the subject
    const after_swipe_response = (left_or_right: "left" | "right") => {
      toggle_css_respond();

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

    // function to handle responses by the subject
    const after_keyboard_response = (info) => {
      toggle_css_respond();

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
          "#jspsych-image-swipe-response-stimulus"
        ).style.visibility = "hidden";
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
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

    this.trial(display_element, trial);
    load_callback();

    if (data.rt !== null) {
      if (data.swipe_response !== null) {
        const test_stimulus_div = document.getElementById("jspsych-image-swipe-response-stimulus");

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
  }
}

export default ImageSwipeResponsePlugin;
