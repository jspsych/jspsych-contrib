import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "stop-signal",
  version: version,
  parameters: {
    /** Each element of the array is a path to an image file. */
    stimuli: {
      type: ParameterType.IMAGE,
      default: undefined,
      array: true,
    },
    /** Set the height of the image in pixels. If left null (no value specified), then the image will display at its natural height. */
    stimulus_height: {
      type: ParameterType.INT,
      default: null,
    },
    /** Set the width of the image in pixels. If left null (no value specified), then the image will display at its natural width. */
    stimulus_width: {
      type: ParameterType.INT,
      default: null,
    },
    /** If setting *only* the width or *only* the height and this parameter is true, then the other dimension will be
     * scaled to maintain the image's aspect ratio.  */
    maintain_aspect_ratio: {
      type: ParameterType.BOOL,
      default: true,
    },

    /**
     * The total time the trial will take.
     */
    trial_duration: {
      type: ParameterType.INT,
      default: 1000,
    },

    /**
     * The time the first image will be shown.
     */
    frame_delay: {
      type: ParameterType.INT,
      default: 500,
    },

    /** Labels for the buttons. Each different string in the array will generate a different button. */
    choices: {
      type: ParameterType.STRING,
      default: undefined,
      array: true,
    },

    /**
     * ``(choice: string, choice_index: number)=>`<button class="jspsych-btn">${choice}</button>``; | A function that
     * generates the HTML for each button in the `choices` array. The function gets the string and index of the item in
     * the `choices` array and should return valid HTML. If you want to use different markup for each button, you can do
     * that by using a conditional on either parameter. The default parameter returns a button element with the text
     * label of the choice.
     */
    button_html: {
      type: ParameterType.FUNCTION,
      default: function (choice: string, choice_index: number) {
        return `<button class="jspsych-btn">${choice}</button>`;
      },
    },

    /** Setting to `'grid'` will make the container element have the CSS property `display: grid` and enable the use of
     * `grid_rows` and `grid_columns`. Setting to `'flex'` will make the container element have the CSS property
     * `display: flex`. You can customize how the buttons are laid out by adding inline CSS in the `button_html` parameter.  */
    button_layout: {
      type: ParameterType.STRING,
      default: "grid",
    },
    /**
     * The number of rows in the button grid. Only applicable when `button_layout` is set to `'grid'`. If null, the
     *  number of rows will be determined automatically based on the number of buttons and the number of columns.
     */
    grid_rows: {
      type: ParameterType.INT,
      default: 1,
    },
    /**
     * The number of columns in the button grid. Only applicable when `button_layout` is set to `'grid'`. If null, the
     * number of columns will be determined automatically based on the number of buttons and the number of rows.
     */
    grid_columns: {
      type: ParameterType.INT,
      default: null,
    },
    /** How long the button will delay enabling in milliseconds. */
    enable_button_after: {
      type: ParameterType.INT,
      default: 0,
    },
    /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that
     * it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key(s) to press). */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /**
     * If true, the images will be drawn onto a canvas element. This prevents a blank screen (white flash) between consecutive
     * images in some browsers, like Firefox and Edge. If false, the image will be shown via an img element, as in previous
     * versions of jsPsych.
     */
    render_on_canvas: {
      type: ParameterType.BOOL,
      default: true,
    },

    /**
     * If true, then participants can select multiple buttons for one trial.
     */
    multiple_responses: {
      type: ParameterType.BOOL,
      default: false,
    },
  },

  data: {
    /** An array, where each element is an object that represents a stimulus in the animation sequence. Each object has
     * a `stimulus` property, which is the image that was displayed, and a `time` property, which is the time in ms,
     * measured from when the sequence began, that the stimulus was displayed. The array will be encoded in JSON format
     * when data is saved using either the `.json()` or `.csv()` functions.
     */
    animation_sequence: {
      type: ParameterType.COMPLEX,
      array: true,
      nested: {
        stimulus: {
          type: ParameterType.STRING,
        },
        time: {
          type: ParameterType.INT,
        },
      },
    },
    /** An array, where each element is an object representing a response given by the participant. Each object has a
     * `stimulus` property, indicating which image was displayed when the button was pressed, an `rt` property, indicating
     * the time of the key press relative to the start of the animation, and a `button_press` property, indicating which
     * button was pressed. The array will be encoded in JSON format when data is saved using either the `.json()` or `.csv()`
     * functions.
     */
    response: {
      type: ParameterType.COMPLEX,
      array: true,
      nested: {
        stimulus: {
          type: ParameterType.STRING,
        },
        rt: {
          type: ParameterType.INT,
        },
        /** Indicates which button the participant pressed. The first button in the `choices` array is 0, the second is 1, and so on.  */
        button_press: {
          type: ParameterType.INT,
        },
      },
    },
  },
  // prettier-ignore
  citations: '__CITATIONS__',
};

type Info = typeof info;

/**
 * This plugin displays a single image or a series of two images
 */
class StopSignalPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  /* This function is called when the trial is run */
  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var animate_frame = 0;
    var reps = 0;
    var startTime = performance.now();
    var animation_sequence = [];
    var responses = [];
    var current_stim = "";

    const calculateImageDimensions = (image: HTMLImageElement): [number, number] => {
      let width: number, height: number;
      // calculate image height and width - this can only be done after image loads because it uses
      // the image's naturalWidth/naturalHeight properties
      if (trial.stimulus_height !== null) {
        height = trial.stimulus_height;
        if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
          width = image.naturalWidth * (trial.stimulus_height / image.naturalHeight);
        }
      } else {
        height = image.naturalHeight;
      }
      if (trial.stimulus_width !== null) {
        width = trial.stimulus_width;
        if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
          height = image.naturalHeight * (trial.stimulus_width / image.naturalWidth);
        }
      } else if (!(trial.stimulus_height !== null && trial.maintain_aspect_ratio)) {
        // if stimulus width is null, only use the image's natural width if the width value wasn't set
        // in the if statement above, based on a specified height and maintain_aspect_ratio = true
        width = image.naturalWidth;
      }

      return [width, height];
    };

    /* This sets up a canvas */
    if (trial.render_on_canvas) {
      var canvas = document.createElement("canvas");
      canvas.id = "jspsych-stop-signal-image";
      canvas.style.margin = "0";
      canvas.style.padding = "0";
      display_element.insertBefore(canvas, null);
      var ctx = canvas.getContext("2d");
    }

    /* This is called when the trial ends */
    const endTrial = () => {
      this.jsPsych.pluginAPI.clearAllTimeouts();

      var trial_data = {
        animation_sequence: animation_sequence,
        response: responses,
      };

      this.jsPsych.finishTrial(trial_data);
    };

    /* The following section of code displays the animation */
    const show_next_frame = () => {
      if (trial.render_on_canvas) {
        display_element.querySelector<HTMLElement>("#jspsych-stop-signal-image").style.visibility =
          "visible";
        var img = new Image();
        img.src = trial.stimuli[animate_frame];
        const [width, height] = calculateImageDimensions(img);
        canvas.height = height;
        canvas.width = height;
        ctx.drawImage(img, 0, 0, width, height);
        if (trial.prompt !== null && animate_frame == 0 && reps == 0) {
          display_element.insertAdjacentHTML("beforeend", trial.prompt);
        }
      } else {
        // show image
        display_element.innerHTML =
          '<img src="' + trial.stimuli[animate_frame] + '" id="jspsych-stop-signal-image"></img>';
        if (trial.prompt !== null) {
          display_element.innerHTML += trial.prompt;
        }
      }
      current_stim = trial.stimuli[animate_frame];

      // record when image was shown
      animation_sequence.push({
        stimulus: trial.stimuli[animate_frame],
        time: Math.round(performance.now() - startTime),
      });
    };

    /* This code displays the two images one after the other by
    calling show_next_frame() */
    if (trial.stimuli.length > 1) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        animate_frame = 1;
        if (!trial.render_on_canvas) {
          display_element.innerHTML = ""; // this clears everything
        }
        show_next_frame();
      }, trial.frame_delay);
    }

    /* this code just ends the trial after the trial duration */
    this.jsPsych.pluginAPI.setTimeout(() => {
      endTrial();
    }, trial.trial_duration);

    /* The following section of code displays the buttons */
    const buttonGroupElement = document.createElement("div");
    buttonGroupElement.id = "jspsych-stop-signal-btngroup";

    if (trial.button_layout === "grid") {
      buttonGroupElement.classList.add("jspsych-btn-group-grid");
      if (trial.grid_rows === null && trial.grid_columns === null) {
        throw new Error(
          "You cannot set `grid_rows` to `null` without providing a value for `grid_columns`."
        );
      }
      const n_cols =
        trial.grid_columns === null
          ? Math.ceil(trial.choices.length / trial.grid_rows)
          : trial.grid_columns;
      const n_rows =
        trial.grid_rows === null
          ? Math.ceil(trial.choices.length / trial.grid_columns)
          : trial.grid_rows;
      buttonGroupElement.style.gridTemplateColumns = `repeat(${n_cols}, 1fr)`;
      buttonGroupElement.style.gridTemplateRows = `repeat(${n_rows}, 1fr)`;
    } else if (trial.button_layout === "flex") {
      buttonGroupElement.classList.add("jspsych-btn-group-flex");
    }

    for (const [choiceIndex, choice] of trial.choices.entries()) {
      buttonGroupElement.insertAdjacentHTML("beforeend", trial.button_html(choice, choiceIndex));
      const buttonElement = buttonGroupElement.lastChild as HTMLElement;
      buttonElement.dataset.choice = choiceIndex.toString();
      buttonElement.addEventListener("click", () => {
        /* calls after_respnse function when button is clicked */
        after_response(choiceIndex);
      });
    }

    display_element.appendChild(buttonGroupElement);

    // start timing
    var start_time = performance.now();

    /* This functions records responses by the subject */
    function after_response(choice) {
      // Measures rt
      var end_time = performance.now();
      var rt = Math.round(end_time - start_time);

      // Adds another element to reponses array
      responses.push({
        button_press: parseInt(choice), // gets the button id
        rt: rt,
        stimulus: current_stim,
      });

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector("#jspsych-stop-signal-image").className += " responded";

      // disable all the buttons after a response
      if (!trial.multiple_responses) {
        for (const button of buttonGroupElement.children) {
          button.setAttribute("disabled", "disabled");
        }
      }

      if (trial.response_ends_trial) {
        endTrial();
      }
    }

    function enable_buttons() {
      var btns = document.querySelectorAll("#jspsych-stop-signal-btngroup button");
      for (var i = 0; i < btns.length; i++) {
        btns[i].removeAttribute("disabled");
      }
    }

    function disable_buttons() {
      var btns = document.querySelectorAll("#jspsych-stop-signal-btngroup button");
      for (var i = 0; i < btns.length; i++) {
        btns[i].setAttribute("disabled", "disabled");
      }
    }

    // set timer of button delay
    if (trial.enable_button_after > 0) {
      disable_buttons();
      this.jsPsych.pluginAPI.setTimeout(() => {
        enable_buttons();
      }, trial.enable_button_after);
    }

    // show the first frame immediately
    show_next_frame();
  }
}

export default StopSignalPlugin;
