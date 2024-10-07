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
  private displayed = false;
  private structured_reading_string: string[] = []; // | string[][] -> need to rethink this?

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    console.log(trial.structured_reading_string, trial.structured_reading_string.length);
    // creates inital reading string
    if (trial.structured_reading_string.length > 0)
      this.structured_reading_string = trial.structured_reading_string;
    else this.structured_reading_string = this.createReadingString(trial.reading_string);

    // const displayContainer = this.jsPsych.getDisplayContainerElement();

    // setup html logic

    var html = `<p>${this.generateBlank(this.structured_reading_string[this.index])}</p>`;
    display_element.innerHTML = html;

    // dynamic logic
    const spacebarHandler = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        this.onSpacebarPress(); // Call the onSpacebarPress method
      }
    };
    // Attach the event listener
    document.addEventListener("keydown", spacebarHandler);

    // Remove the event listener when the trial is finished to prevent memory leaks
    // this.jsPsych.finishTrialCallback(() => {
    //   document.removeEventListener("keydown", spacebarHandler);
    // });

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

    // Add any action you want to happen on spacebar press
    // e.g., changing the displayed text, ending the trial, etc.
    document.querySelector("p")!.innerHTML = newHtml;
  }

  private generateBlank(text: string): string {
    const length = text.length;
    // will need to account for the spaces and will need split? -> not sure how will handle that
    return "_".repeat(length);
  }
}

export default SprPlugin;
