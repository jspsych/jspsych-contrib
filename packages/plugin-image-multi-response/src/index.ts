import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "image-multi-response",
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
    /** Any content here will be displayed under the button(s). */
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
    /** How long to show the trial. */
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
    /** If true, then trial will end when user responds. */
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
     * Indicates which button the subject pressed. The first button in the `choices` array is 0, the second is 1, and so on.
     * If the subject responded using the keyboard, then this field will be `null`.
     */
    button_response: {
      type: ParameterType.INT,
    },
    /**
     * Indicates which key the subject pressed.
     * If the subject responded using button clicks, then this field will be `null`.
     */
    keyboard_response: {
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
 * image-multi-response
 * jsPsych plugin for displaying an html stimulus and getting a response
 * @author Adam Richie-Halford
 * @see {@link https://www.jspsych.org/plugins/jspsych-image-multi-response/ image-multi-response plugin documentation on jspsych.org}
 */
class ImageMultiResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var height: number, width: number;
    var html: string;
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
      canvas.id = "jspsych-image-multi-response-stimulus";
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

      var btngroup_div = document.createElement("div");
      btngroup_div.id = "jspsych-image-multi-response-btngroup";
      html = "";
      for (var i = 0; i < trial.button_choices.length; i++) {
        var button_str = trial.button_html(trial.button_choices[i], i);

        html +=
          '<div class="jspsych-image-multi-response-button" style="display: inline-block; margin:' +
          trial.margin_vertical +
          " " +
          trial.margin_horizontal +
          '" id="jspsych-image-multi-response-button-' +
          i +
          '" data-choice="' +
          i +
          '">' +
          button_str +
          "</div>";
      }
      btngroup_div.innerHTML = html;
      // add canvas to screen and draw image
      display_element.insertBefore(canvas, null);
      if (img.complete && Number.isFinite(width) && Number.isFinite(height)) {
        // if image has loaded and width/height have been set, then draw it now
        // (don't rely on img onload function to draw image when image is in the cache, because that causes a delay in the image presentation)
        ctx.drawImage(img, 0, 0, width, height);
        image_drawn = true;
      }
      // add buttons to screen
      display_element.insertBefore(btngroup_div, canvas.nextElementSibling);
      // add prompt if there is one
      if (trial.prompt !== null) {
        display_element.insertAdjacentHTML("beforeend", trial.prompt);
      }
    } else {
      // display stimulus as an image element
      html =
        '<img draggable="false" src="' +
        trial.stimulus +
        '" id="jspsych-image-multi-response-stimulus">';

      html += '<div id="jspsych-image-multi-response-btngroup">';

      for (var i = 0; i < trial.button_choices.length; i++) {
        var button_str = trial.button_html(trial.button_choices[i], i);
        html +=
          '<div class="jspsych-image-multi-response-button" style="display: inline-block; margin:' +
          trial.margin_vertical +
          " " +
          trial.margin_horizontal +
          '" id="jspsych-image-multi-response-button-' +
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
      // update the page content
      display_element.innerHTML = html;

      // set image dimensions after image has loaded (so that we have access to naturalHeight/naturalWidth)
      var img = display_element.querySelector(
        "#jspsych-image-multi-response-stimulus"
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

    // function to handle responses by the subject
    var after_keyboard_response = function (info) {
      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector("#jspsych-image-multi-response-stimulus").className +=
        " responded";

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

    // Add event listener for keys
    if (trial.keyboard_choices != "NO_KEYS") {
      var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_keyboard_response,
        valid_responses: trial.keyboard_choices,
        rt_method: "performance",
        persist: false,
        allow_held_key: false,
      });
    }

    // start time
    var start_time = performance.now();

    // add event listeners to buttons
    for (var i = 0; i < trial.button_choices.length; i++) {
      display_element
        .querySelector("#jspsych-image-multi-response-button-" + i)
        .addEventListener("click", (e) => {
          var btn_el = e.currentTarget as HTMLButtonElement;
          var choice = btn_el.getAttribute("data-choice"); // don't use dataset for jsdom compatibility
          after_response(choice);
        });
    }

    // store response
    var response = {
      rt: null,
      button: null,
      key: null,
      source: null,
    };

    // function to end trial when it is time
    const end_trial = () => {
      // kill any remaining setTimeout handlers
      this.jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== "undefined") {
        this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        button_response: response.button,
        keyboard_response: response.key,
        response_source: response.source,
      };

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    function after_response(choice: string) {
      // measure rt
      var end_time = performance.now();
      var rt = Math.round(end_time - start_time);
      response.button = parseInt(choice);
      response.rt = rt;
      response.source = "button";

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector("#jspsych-image-multi-response-stimulus").className +=
        " responded";

      // disable all the buttons after a response
      var btns = document.querySelectorAll(".jspsych-image-multi-response-button button");
      for (var i = 0; i < btns.length; i++) {
        //btns[i].removeEventListener('click');
        btns[i].setAttribute("disabled", "disabled");
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    }

    // hide image if timing is set
    if (trial.stimulus_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        display_element.querySelector<HTMLElement>(
          "#jspsych-image-multi-response-stimulus"
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

    this.trial(display_element, trial);
    load_callback();

    if (data.rt !== null) {
      if (data.button_response !== null) {
        this.jsPsych.pluginAPI.clickTarget(
          display_element.querySelector(`div[data-choice="${data.button_response}"] button`),
          data.rt
        );
      } else {
        this.jsPsych.pluginAPI.pressKey(data.keyboard_response, data.rt);
      }
    }
  }
}

export default ImageMultiResponsePlugin;
