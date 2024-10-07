import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

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
  private inner_index: number = -1;
  private displayed = false;
  private structured_reading_string: string[] = [];
  private mode;
  // | string[][] -> each method that takes in string will need to account for list of strings
  // would need another inner_index?

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.mode = trial.mode;
    console.log(trial.structured_reading_string, trial.structured_reading_string.length);
    // creates inital reading string -> should instead use mode
    if (trial.structured_reading_string.length > 0)
      this.structured_reading_string = trial.structured_reading_string;
    else this.structured_reading_string = this.createReadingString(trial.reading_string);

    // setup html logic
    var html = `<p>${this.generateBlank(this.structured_reading_string[this.index])}</p>`;
    display_element.innerHTML = html;

    // dynamic logic
    // TODO: need to restructure to use JsPsych keyboard API and remove it
    const spacebarHandler = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        this.onSpacebarPress(); // Call the onSpacebarPress method
      }
    };
    // Attach the event listener
    document.addEventListener("keydown", spacebarHandler);

    // data saving
    var trial_data = {
      data1: 99, // Make sure this type and name matches the information for data1 in the data object contained within the info const.
      data2: "hello world!", // Make sure this type and name matches the information for data2 in the data object contained within the info const.
    };
    // end trial
    // this.jsPsych.finishTrial(trial_data);
  }

  private createReadingString(reading_string: string): string[] {
    // pass in parameters to split it
    //  -> depends on the spaces and the typing

    return [reading_string];
  }

  private onSpacebarPress() {
    console.log("Spacebar was pressed!");
    var newHtml = `<p>Spacebar pressed!</p>`;

    // handles logic on whether to display blank or show text using boolean/index
    if (this.mode === 1) {
      if (!this.displayed) {
        newHtml = this.structured_reading_string[this.index];
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
    } else {
      // mode 2 and 3
      const curr_length = this.structured_reading_string[this.index].length;
      this.inner_index++;

      if (this.inner_index >= curr_length) {
        // resets the index and moves onto the next
        this.inner_index = 0;
        this.index++;
      }

      const curr_segment = this.structured_reading_string[this.index];
      var string_to_display = "";

      for (var i = 0; i < curr_segment.length; i++) {
        if (this.inner_index === i) {
          string_to_display += " " + curr_segment[i];
        } else {
          string_to_display += " " + this.generateBlank(curr_segment[i]);
        }
      }

      newHtml = `<p>${string_to_display}</p>`;
    }

    // Add any action you want to happen on spacebar press
    // e.g., changing the displayed text, ending the trial, etc.
    document.querySelector("p")!.innerHTML = newHtml;
  }

  private generateBlank(text: string | string[]): string {
    const length = text.length;
    // will need to account for the spaces and will need split? -> not sure how will handle that
    if (typeof text === "string") {
      return "_".repeat(length);
    } else {
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
