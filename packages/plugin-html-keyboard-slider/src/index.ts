// Needs ability to map keys to values and functions using object array? e.g. add a different value to the step controlled by arrow keys
// Need to trim params down in future

import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
//Cannot find module '../package.json'. Consider using '--resolveJsonModule' to import module with '.json' extension.ts(2732)//
//import { version } from '../package.json';

const info = <const>{
  name: "html-keyboard-slider",
  version: "1.0.0",
  parameters: {
    // HTML Attributes
    /**
     * Slider minimum - Note Ints here can also be floats without issue
     */
    min: {
      type: ParameterType.INT,
      default: 0,
    },
    /**
     * Slider maximum
     */
    max: {
      type: ParameterType.INT,
      default: 10,
    },
    /**
     * Slider minimum increase in value
     */
    step: {
      type: ParameterType.INT,
      default: 1,
    },
    /**
     * For a more coninuous slider, set HTML Range input's step attribute to 'any', see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range#examples. Step values above still apply to 'increase_keys' and 'decrease_keys'.
     */
    step_any: {
      type: ParameterType.BOOL,
      default: false,
    },
    /**
     * Where to start the slider, defaults to minimum value
     */
    slider_start: {
      type: ParameterType.INT,
      default: null,
    },
    /**
     * Width of the slider in pixels - defaults to 100% of container otherwise
     */
    slider_width: {
      type: ParameterType.INT,
      default: null,
    },

    // KEYS
    /**
     * single charater or array of character(s) indicating which keys bottom out slider to minimum - notes: These fields are case sensitive e.g. use ['A','a'] to control slider with A key. Set to empty array or string to turn functionality off.
     */
    minimum_keys: {
      type: ParameterType.KEYS,
      default: ["`", "§"], // nullable and won't do anything if passed empty array
    },
    /**
     * keys which raise slider to maximum - can be a number e.g. "0" on a scale with 10 as maximum
     */
    maximum_keys: {
      type: ParameterType.KEYS,
      default: ["="],
    },
    /**
     * keys which decrease slider 1 step
     */
    decrease_keys: {
      type: ParameterType.KEYS,
      default: ["ArrowLeft", "ArrowDown"],
    },
    /**
     * keys which increase slider 1 step
     */
    increase_keys: {
      type: ParameterType.KEYS,
      default: ["ArrowRight", "ArrowUp"],
    },
    /**
     * Whether or not to listen to number keys
     */
    number_keys: {
      type: ParameterType.BOOL,
      default: true,
    },
    /**
     * How much the increase and decrease keys change the value on the slider - defaults to step size
     */
    keys_step: {
      type: ParameterType.FLOAT,
      default: null,
    },

    // INPUT MANIPULATION
    /**
     * Multiplies the input value after key_buffer is accounted for if on - e.g. to multiply input by 10 with 0-100%
     */
    input_multiplier: {
      type: ParameterType.INT,
      default: 1,
    },
    /**
     * Key buffer tracks presses over seconds to allow multiple button presses e.g. pressing 6 then 5 = 65. Handles negative values '-' and decimals '.' so long as they aren't assigned to other roles above.
     */
    key_buffer_on: {
      type: ParameterType.BOOL,
      default: false,
    },
    /**
     * Length of time consecutive key presses are held in memory
     */
    key_buffer_timeout: {
      type: ParameterType.INT,
      default: 300,
    },

    // TEXT
    /**
     * Prompt displayed above slider
     */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: "",
    },
    /**
     * Whether to display ticks under each value of the slider - these are also slightly 'sticky'
     */
    ticks: {
      type: ParameterType.BOOL,
      default: true,
    },
    /**
     * Interval at which to display ticks - defaults to step size
     */
    ticks_interval: {
      type: ParameterType.FLOAT,
      default: null,
    },
    /**
     * Labels (array or single value) displayed equidistantly below stimulus - Accepts HTML, e.g. "<img src='YOUR_URL_HERE' style='max-width: 100%'>" or special chars "&#128513;"
     */
    labels: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /**
     * Whether to display dividing lines between labels
     */
    label_dividers: {
      type: ParameterType.BOOL,
      default: true,
    },
    /**
     * Whether or not to display the current value of the slider below
     */
    display_value: {
      type: ParameterType.BOOL,
      default: true,
    },
    /**
     * Text displayed next to display_value, e.g. %, cm, or another unit of measure
     */
    unit_text: {
      type: ParameterType.STRING,
      default: "",
    },
    /**
     * Whether or not to prepend unit e.g. £5 - default is append e.g. 5%
     */
    prepend_unit: {
      type: ParameterType.BOOL,
      default: false,
    },

    // NON-SLIDER-COMPONENTS
    /**
     * Stimulus to be displayed, any html is valid
     */
    stimulus: {
      type: ParameterType.HTML_STRING,
      default: null, // null is nullable, undefined must be set?
    },
    /**
     * Duration of stimulus
     */
    stimulus_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /**
     * Duration of trial - if no response is made the response is recorded as null
     */
    trial_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /**
     * Whether or not a response ends the trial
     */
    response_ends_trial: {
      type: ParameterType.BOOL,
      default: false,
    },
    /**
     * Whether the slider must be interacted with to continue
     */
    require_movement: {
      type: ParameterType.BOOL,
      default: false,
    },
    /**
     * Label of the button displayed
     */
    button_label: {
      type: ParameterType.STRING,
      default: "Continue",
    },
  },
  data: {
    /**
     * Final value of the slider - defaults to slider starting value if slider not interacted with
     */
    response: {
      type: ParameterType.INT,
    },
    /**
     * Reaction time in milliseconds
     */
    rt: {
      type: ParameterType.FLOAT,
    },
    /**
     * Stimulus presented.
     */
    stimulus: {
      type: ParameterType.HTML_STRING,
    },
    /**
     * Starting value of the slider
     */
    slider_start: {
      type: ParameterType.INT,
    },
  },
};

type Info = typeof info;

/**
 * **html-keyboard-slider**
 *
 * HTML slider which allows for keyboard responses, with some extra customisations
 *
 * @author Max Lovell
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-html-keyboard-slider/README.md}}
 */
class HtmlKeyboardSliderPlugin implements JsPsychPlugin<Info> {
  static info = info;
  private keyboardListener: any; // Allows this.keyboardListener id to be saved

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // Init Data
    const startTime = performance.now();

    let data = {
      response: null,
      rt: null,
      slider_start: null,
      stimulus: trial.stimulus,
    };

    // CREATE SLIDER HTML AND CSS ---------------------------------------------------------
    let slider, continueButton, sliderValueDisplay, stimulus;
    addSliderElementsWrapper();

    // wrapper
    function addSliderElementsWrapper() {
      const container = createContainer();
      if (trial.stimulus !== null) stimulus = addStimulus(container);
      addPrompt(container);
      slider = addSlider(container);
      if (trial.ticks) addTicks(container);
      if (trial.labels) {
        const labels = addLabels(container); //make this parameter
        // Handling the location of labels in a simple manner is tricky....
        //Expanding the width of the labels is difficult as their addition already changes the length of the slider
        //labels.style.width = ((trial.labels.length + 1) / trial.labels.length) * 100 + "%";
        //labels.style.width = (slider.clientWidth*((trial.labels.length+1)/trial.labels.length)) +'px'
        // Note this lines up better but reduces the size of the slider too much:
        //slider.style.width = ((trial.labels.length-1)/trial.labels.length)*100 +'%'
        // This seems good enough for an easy solution but isn't quite the individual placement in the standard slider:
        // Width in % to allow expansion beyond container.
        if (trial.slider_width === null)
          labels.style.width = ((trial.labels.length + 1) / trial.labels.length) * 100 + "%";
        else
          labels.style.width =
            ((trial.labels.length + 1) / trial.labels.length) * slider.offsetWidth + "px";
      }

      if (trial.display_value) sliderValueDisplay = addValueText(container);
      continueButton = addContinueButton(container);
    }

    // HTML + CSS functions
    function createContainer() {
      // Create
      const container = document.createElement("div");
      // CSS
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.alignItems = "center";
      container.style.justifyContent = "center";
      container.style.textAlign = "center";
      container.style.rowGap = "10px";
      container.style.width = "100%";
      // Append
      display_element.appendChild(container);
      return container;
    }

    // Instructions text
    function addStimulus(container) {
      const stimulus = document.createElement("div");
      stimulus.id = "keyboardSliderStimulus";
      stimulus.innerHTML = trial.stimulus;
      container.appendChild(stimulus);
      return stimulus;
    }

    function addPrompt(container) {
      const prompt = document.createElement("p");
      prompt.id = "keyboardSliderPrompt";
      prompt.textContent = trial.prompt;
      container.appendChild(prompt);
    }

    // Slider display
    function addSlider(container) {
      const slider = document.createElement("input");
      slider.type = "range";
      slider.id = "keyboardSlider";
      slider.min = "" + trial.min;
      slider.max = "" + trial.max;
      slider.step = trial.step_any ? "any" : "" + trial.step;
      slider.value = trial.slider_start === null ? "" + trial.min : "" + trial.slider_start;
      data.slider_start = slider.value;
      if (trial.slider_width !== null) slider.style.width = trial.slider_width + "px";
      else slider.style.width = "100%";
      container.appendChild(slider);
      return slider;
    }

    function addTicks(container) {
      const ticks = document.createElement("datalist");
      ticks.id = "ticks";
      const interval = trial.ticks_interval === null ? trial.step : trial.ticks_interval;
      for (let t = trial.min; t <= trial.max; t += interval) {
        const tick = document.createElement("option");
        tick.classList.add("tick");
        tick.value = "" + t;

        //tick.label = "" + (t+1) // Visible labels in CSS (see proposal) but looks a little funny....
        ticks.appendChild(tick);
      }
      slider.setAttribute("list", "ticks"); // Attribute is 'readOnly' so set like this
      container.appendChild(ticks);
    }

    function addLabels(container) {
      const labels = document.createElement("div");
      labels.id = "labels";
      labels.style.display = "flex";
      labels.style.wordBreak = "break-word"; //this is needed to keep everything the right size
      // labels.style.width = "100%";
      // labels.style.justifyContent = "space-between";
      // labels.style.flex = "1 1 0px";

      const nLabels = trial.labels.length;
      for (let l = 0; l < nLabels; l++) {
        // Container
        const labelContainer = document.createElement("span");
        labelContainer.classList.add("labelContainer");
        labelContainer.style.width = "100%";
        labelContainer.style.textAlign = "center";
        labelContainer.style.padding = "5px";
        if (l < nLabels - 1 && trial.label_dividers)
          labelContainer.style.borderRight = "1px solid grey";
        // Text
        const label = document.createElement("span");
        label.classList.add("label");
        label.innerHTML = trial.labels[l]; // Use innerHTML to allow for images
        //Append
        labelContainer.appendChild(label);
        labels.appendChild(labelContainer);
      }
      //or use display: grid and labels.style.gridTemplateColumns = 'repeat('+ nLabels +', 1fr)';
      //labels.style.width = ((nLabels+1)/nLabels)*100 +'%'
      labels.style.maxWidth = "100vw";
      container.appendChild(labels);
      return labels;
    }

    // User Info
    function addValueText(container) {
      const sliderText = document.createElement("output");
      sliderText.id = "sliderText";
      sliderText.textContent = trial.prepend_unit
        ? trial.unit_text + slider.value
        : slider.value + trial.unit_text;
      container.appendChild(sliderText);
      return sliderText;
    }

    function addContinueButton(container) {
      const button = document.createElement("button");
      button.id = "keyboardSliderButton"; //id="jspsych-survey-text-next"
      button.innerHTML = trial.button_label;
      button.disabled = trial.require_movement;
      button.classList.add("jspsych-btn", "jspsych-survey-text");
      container.appendChild(button);
      return button;
    }

    // KEYBOARD BUFFER ---------------------------------------------------------
    let keyBuffer = [],
      timerId;
    function addToKeyBuffer(key) {
      // if '-' and not first value clear first. if '.' and first value add 0 first.
      if (key === "-" && keyBuffer.length > 0) clearKeybuffer();
      else if (key === "." && keyBuffer.length === 0) keyBuffer.push("0");
      keyBuffer.push(key);
      // Set new timeout
      clearTimeout(timerId); //does nothing if undefined by spec
      timerId = undefined;
      timerId = setTimeout(clearKeybuffer, trial.key_buffer_timeout);
      return concatenateKeyBuffer();
    }

    function concatenateKeyBuffer() {
      let concatNums = "";
      for (let i = 0; i < keyBuffer.length; i++) {
        concatNums += keyBuffer[i];
      }
      const numericBufferValue = +concatNums;
      if (numericBufferValue > slider.max || numericBufferValue < slider) clearKeybuffer(); //clear buffer if out of bounds
      return numericBufferValue;
    }

    function clearKeybuffer() {
      clearTimeout(timerId);
      timerId = undefined;
      keyBuffer = [];
    }

    // KEYPRESSES ---------------------------------------------------------
    const updateSliderValue = (info) => {
      const stepSize = trial.keys_step === null ? trial.step : trial.keys_step;
      if (info.key === "Enter" && !continueButton.disabled) endTrial();
      else if (trial.decrease_keys.includes(info.key))
        slider.value = "" + (+slider.value - +stepSize);
      else if (trial.increase_keys.includes(info.key))
        slider.value = "" + (+slider.value + +stepSize);
      else if (trial.minimum_keys.includes(info.key)) slider.value = slider.min;
      else if (trial.maximum_keys.includes(info.key)) slider.value = slider.max;
      else if (["-", "."].includes(info.key) && trial.key_buffer_on)
        slider.value = addToKeyBuffer(info.key);
      else if (isFinite(info.key) && trial.number_keys) {
        // if is Number
        let sliderValue = +info.key; //+ is shorthand for str to int
        if (trial.key_buffer_on) sliderValue = addToKeyBuffer(sliderValue);
        // * multiplier if is only value in keyBuffer or keyBuffer is off - otherwise just input direct values
        if (keyBuffer.length < 2) sliderValue *= trial.input_multiplier;
        slider.value = "" + sliderValue;
      }

      // Update text
      if (trial.display_value)
        sliderValueDisplay.innerHTML = trial.prepend_unit
          ? trial.unit_text + slider.value
          : slider.value + trial.unit_text;

      // Record data /// consider using slider.dispatchEvent(new Event("input"));
      data.rt = info.rt;
      data.response = slider.value; //record here so response must be made

      // end the trial
      if (trial.response_ends_trial) endTrial();
      if (info.key !== "Enter") continueButton.disabled = false;
    };

    // Note keyboard inputs don't call slider input event type so this handles clicks/touches
    function sliderClick(e) {
      // Add data
      data.rt = Math.round(e.timeStamp - startTime); // Same as used here: https://github.com/jspsych/jsPsych/blob/main/packages/jspsych/src/modules/plugin-api/KeyboardListenerAPI.ts
      data.response = slider.value; //record here so response must be made

      // display current value
      if (trial.display_value)
        sliderValueDisplay.textContent = trial.prepend_unit
          ? trial.unit_text + slider.value
          : slider.value + trial.unit_text;
      continueButton.disabled = false;
    }
    slider.addEventListener("input", sliderClick);

    // Setup initial keyboard event
    this.keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: updateSliderValue,
      valid_responses: [
        ...trial.minimum_keys,
        ...trial.maximum_keys,
        ...trial.decrease_keys,
        ...trial.increase_keys,
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "Enter",
        "-",
        ".",
      ],
      persist: true, // Needed for key buffer
      allow_held_key: true, // Good for step buttons
    });

    // END TRIAL CONDITIONS + FUNCTIONS ---------------------------------------------------------

    // Remove Stimulus after stimulus_duration
    if (trial.stimulus_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(function () {
        stimulus.hidden = true; //.style.display = 'none'
      }, trial.stimulus_duration);
    }

    // Remove trial after trial_duration
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(function () {
        endTrial();
      }, trial.trial_duration);
    }

    // End Trial function
    const endTrial = () => {
      //clear and cancel things
      clearKeybuffer();
      this.jsPsych.pluginAPI.cancelKeyboardResponse(this.keyboardListener);

      // if no response and trial_duration not set
      if (data.response === null && trial.trial_duration === null)
        data.response = data.slider_start; //set response to slider start

      // end trial
      this.jsPsych.finishTrial(data);
    };

    // End trial if continue button is clicked
    continueButton.addEventListener("click", endTrial);
  }
}

export default HtmlKeyboardSliderPlugin;
