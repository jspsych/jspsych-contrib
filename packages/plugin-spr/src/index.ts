import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

// TODO: need to restructure to use the CSS styling proposed by Titus
const info = <const>{
  name: "spr",
  version: version,
  parameters: {
    /** Provide a clear description of the parameter_name that could be used as documentation. We will eventually use these comments to automatically build documentation and produce metadata. */
    reading_string: {
      type: ParameterType.STRING, // BOOL, STRING, INT, FLOAT, FUNCTION, KEY, KEYS, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
      default: "",
    },
    structured_reading_string: {
      type: ParameterType.STRING,
      array: true,
      default: [],
    },
    mode: {
      type: ParameterType.INT,
      default: 1,
    },
  },
  data: {
    /** Provide a clear description of the data1 that could be used as documentation. We will eventually use these comments to automatically build documentation and produce metadata. */
    data1: {
      type: ParameterType.INT,
    },
    /** Provide a clear description of the data2 that could be used as documentation. We will eventually use these comments to automatically build documentation and produce metadata. */
    data2: {
      type: ParameterType.STRING,
    },
  },
};

type Info = typeof info;

/**
 * **spr**
 *
 * This is a package built to enable self   paced reading
 *
 * @author Victor Zhang
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-spr/README.md}}
 */
class SprPlugin implements JsPsychPlugin<Info> {
  static info = info;
  private index: number = 0;
  private inner_index: number = -1; // initialized so that not shown if has an inner_index
  private displayed = false;
  private current_display_string: string[] = []; // use this to save iterations
  private structured_reading_string: string[] | string[][] = [];
  private mode;
  // | string[][] -> each method that takes in string will need to account for list of strings
  // would need another inner_index?

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.initializeVariables(trial);
    this.updateDisplayString();
    // setup html logic
    var html = `<p>${this.generateBlank(this.structured_reading_string[this.index])}</p>`;
    display_element.innerHTML = html;

    this.jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: (info) => this.onSpacebarPress(info),
      valid_responses: [" "],
      rt_method: "performance",
      persist: true,
      allow_held_key: false,
    });

    // TODO: figure out data saving -> will need to add times and how long to make it
    var trial_data = {
      data1: 99, // Make sure this type and name matches the information for data1 in the data object contained within the info const.
      data2: "hello world!", // Make sure this type and name matches the information for data2 in the data object contained within the info const.
    };
    // end trial
    // this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
    // this.jsPsych.finishTrial(trial_data);
  }

  private initializeVariables(trial: TrialType<Info>) {
    if (trial.mode === 1 || trial.mode === 2 || trial.mode === 3) this.mode = trial.mode;
    else throw console.error("Mode declared incorrectly, must be between 1 and 3.");

    console.log(trial.structured_reading_string, trial.structured_reading_string.length);
    // creates inital reading string -> TODO: should instead use mode to determine
    if (trial.structured_reading_string.length > 0)
      this.structured_reading_string = trial.structured_reading_string;
    else this.structured_reading_string = this.createReadingString(trial.reading_string);
  }

  // TODO: create a method that takes an entire string and uses a list of parameters to generate a "structured reading string"
  private createReadingString(reading_string: string): string[] {
    // pass in parameters to split it
    //  -> depends on the spaces and the typing

    return [reading_string];
  }

  private onSpacebarPress(info?: any) {
    var newHtml = `<p>Spacebar pressed!</p>`;

    // handles logic on whether to display blank or show text using boolean/index
    if (this.mode === 1 || this.mode === 2) {
      const curr_length = this.structured_reading_string[this.index].length;
      this.inner_index++;

      if (this.inner_index >= curr_length) {
        // resets the index and moves onto the next
        this.inner_index = -1; // ensures will be empty
        this.index++;
      }

      newHtml = `<p>${this.updateDisplayString()}</p>`;
    } else if (this.mode === 3) {
      if (!this.displayed) {
        if (typeof this.structured_reading_string === "string")
          newHtml = this.structured_reading_string[this.index];
        else newHtml = "weird formatting"; // should build out a method that uses the inner index but makes it iterate better

        this.displayed = true;
      } else {
        this.index++;
        this.displayed = false;

        if (this.index >= this.structured_reading_string.length) {
          // this is when we want to end trial
        } else {
          newHtml = this.generateBlank(this.structured_reading_string[this.index]);
        }
      }
    }
    // need to handle a keyboard press element where records how long until press a key

    // Add any action you want to happen on spacebar press
    // e.g., changing the displayed text, ending the trial, etc.
    document.querySelector("p")!.innerHTML = newHtml;
  }

  // this is called whenever previousMethod upates the indicies
  // this will let us create more advanced logic for how to handle the displays
  private updateDisplayString(): string {
    if (this.mode === 1 || this.mode === 2) {
      if (this.inner_index === -1) {
        // need to update new display string
        const new_display_string: string[] = [];

        const curr_segment = this.structured_reading_string[this.index];

        for (var i = 0; i < curr_segment.length; i++) {
          new_display_string.push(
            "<span class='text-before-current-region'>" +
              this.generateBlank(curr_segment[i]) +
              "</span>"
          );
        }

        this.current_display_string = new_display_string;
      } else if (this.mode === 1) {
        // if not need to reupdate then we can do new logic
        if (this.inner_index > 0)
          // sets previous to blank if exists
          this.current_display_string[this.inner_index - 1] =
            "<span class='text-before-current-region'>" +
            this.generateBlank(this.structured_reading_string[this.index][this.inner_index - 1]) +
            "</span>";
        this.current_display_string[this.inner_index] =
          "<span class='text-current-region'>" +
          this.structured_reading_string[this.index][this.inner_index] +
          "</span>";
      } else if (this.mode === 2) {
        this.current_display_string[this.inner_index] =
          "<span class='text-current-region'>" +
          this.structured_reading_string[this.index][this.inner_index] +
          "</span>";
      }
    } else if (this.mode === 3) {
      /// where we implement number 3
    }

    console.log("update display string res:", this.current_display_string);
    var displayString = "";
    for (const s of this.current_display_string) {
      displayString += s + " "; // include another element
    }

    return displayString;
  }

  private generateBlank(text: string | string[]): string {
    const length = text.length;

    if (typeof text === "string") {
      return "_".repeat(length);
    } else {
      // type of array
      var res = "";
      for (var i = 0; i < length; i++) {
        const word_length = text[i].length;
        res += "_".repeat(word_length) + " ";
      }
      return res;
    }
  }
}

export default SprPlugin;
