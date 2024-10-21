import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "spr",
  version: version,
  parameters: {
    /* String input of the displayed text which will be split to create a structured_reading_string. */
    unstructured_reading_string: {
      type: ParameterType.STRING,
      default: "",
    },
    /* String input that explictly defines how the chunks and lines will be displayed during the SPR trial.*/
    structured_reading_string: {
      type: ParameterType.STRING,
      array: true,
      default: [],
    },
    /* Mode between 1-3 that indicate the different built-in modes for how stimulus will be displayed. */
    mode: {
      type: ParameterType.INT,
      default: 1,
    },
    /* Indicates how many words will be included with each chunk when splitting the unstructured_reading_string. */
    chunk_size: {
      type: ParameterType.INT,
      default: 1,
    },
    /* Indicates how many chunks will be included with each chunk when splitting the unstructured_reading_string. */
    line_size: {
      type: ParameterType.INT,
      default: 1,
    },
  },
  data: {
    /* The representation of the structured_reading_string that was used. Combined with the mode this 
    tells what exactly was displayed on the screen during each click. */
    stimulus: {
      type: ParameterType.STRING,
      Array: true,
    },
    /** Indicates the mode that the SPR experiment was ran using. */
    mode: {
      type: ParameterType.INT,
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
  private inner_index: number = -1; // mode 1-2: initialized so that not shown if has an inner_index
  private current_display_string: string[] = []; // mode 1-2: use this to save iterations
  private displayed = false; // mode 3
  private structured_reading_string: string[] | string[][] = [];
  private mode;
  private results = [];
  private startTime;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.initializeVariables(trial);
    // setup html logic
    var html = `<p></p>`;
    display_element.innerHTML = html;

    if (this.mode === 3)
      document.querySelector("p")!.innerHTML = this.generateBlank(
        this.structured_reading_string[this.index]
      );
    else document.querySelector("p")!.innerHTML = this.updateDisplayString();
  }

  private endTrial() {
    // TODO: figure out data saving -> will need to add times and how long to make it
    var trial_data = {
      // data1: 99, // Make sure this type and name matches the information for data1 in the data object contained within the info const.
      stimlulus: this.structured_reading_string, // Make sure this type and name matches the information for data2 in the data object contained within the info const.
      mode: this.mode,
      results: this.results,
    };
    // end trial
    this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
    this.jsPsych.finishTrial(trial_data);
  }

  private initializeVariables(trial: TrialType<Info>) {
    if (trial.mode === 1 || trial.mode === 2 || trial.mode === 3) this.mode = trial.mode;
    else throw console.error("Mode declared incorrectly, must be between 1 and 3.");

    // creates inital reading string -> TODO: should instead use mode to determine
    if (trial.structured_reading_string.length > 0)
      this.structured_reading_string = trial.structured_reading_string;
    else
      this.structured_reading_string = this.createReadingString(
        trial.unstructured_reading_string,
        trial.chunk_size,
        trial.line_size
      );

    this.jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: (info) => this.onSpacebarPress(info),
      valid_responses: [" "],
      rt_method: "performance",
      persist: true,
      allow_held_key: false,
    });

    this.startTime = Date.now();
  }

  // TODO: create a method that takes an entire string and uses a list of parameters to generate a "structured reading string"
  private createReadingString(
    unstructured_reading_string: string,
    chunk_size: number,
    line_size: number
  ): string[] {
    const split_text = unstructured_reading_string.split(" ");
    const res = [];

    var current_chunk = [];
    var current_line = [];

    for (var i = 0; i < split_text.length; i++) {
      const word = split_text[i];
      current_chunk.push(word);

      if (current_chunk.length >= chunk_size) {
        current_line.push(current_chunk.join(" "));
        current_chunk = [];

        if (current_line.length >= line_size) {
          res.push(current_line);
          current_line = [];
        }
      }
    }

    if (current_chunk.length > 0) current_line.push(current_chunk);
    if (current_line.length > 0) res.push(current_line);

    return res;
  }

  private onSpacebarPress(info?: any) {
    var newHtml = "";

    // handles logic on whether to display blank or show text using boolean/index
    if (this.mode === 1 || this.mode === 2) {
      const curr_length = this.structured_reading_string[this.index].length;
      this.inner_index++;

      if (this.inner_index >= curr_length) {
        // resets the index and moves onto the next
        this.inner_index = -1; // ensures will be empty
        this.index++;

        if (this.index >= this.structured_reading_string.length) {
          this.endTrial();
          return;
        }
      }

      newHtml = `<p>${this.updateDisplayString()}</p>`;
    } else if (this.mode === 3) {
      // might want to include incrementation here for consistency
      newHtml = this.updateDisplayString();
    }
    // need to handle a keyboard press element where records how long until press a key

    // Add any action you want to happen on spacebar press
    // e.g., changing the displayed text, ending the trial, etc.
    document.querySelector("p")!.innerHTML = newHtml;
  }

  // This helper method assists with mode 1 and 2 to keep efficency when updating indicies and the scren
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
        this.results.push([this.getElapsed()]);
      } else {
        if (this.mode === 1 && this.inner_index > 0) {
          this.current_display_string[this.inner_index - 1] =
            "<span class='text-after-current-region'>" +
            this.generateBlank(this.structured_reading_string[this.index][this.inner_index - 1]) +
            "</span>";
        } else if (this.mode === 2 && this.inner_index > 0) {
          console.log("enters modifier", this.current_display_string);
          // changes classifier
          this.current_display_string[this.inner_index - 1] =
            "<span class='text-after-current-region'>" +
            this.structured_reading_string[this.index][this.inner_index - 1] +
            "</span>";
        }

        // shows next display
        this.current_display_string[this.inner_index] =
          "<span class='text-current-region'>" +
          this.structured_reading_string[this.index][this.inner_index] +
          "</span>";

        this.results[this.results.length - 1].push(
          this.structured_reading_string[this.index][this.inner_index],
          this.getElapsed()
        );
        // this.results[this.results.length-1].push([this.getElapsed(), this.structured_reading_string[this.index][this.inner_index]]);
      }
    } else if (this.mode == 3) {
      var newHtml = "";

      if (!this.displayed) {
        // accounts for bad user input (not necessary) and could move it up to input
        if (typeof this.structured_reading_string[this.index] === "string")
          newHtml = this.structured_reading_string[this.index] as string;
        else {
          for (const c of this.structured_reading_string[this.index]) {
            newHtml += c + " ";
          }
        }

        newHtml = "<p class='text-current-region'>" + newHtml + "</p>";
        this.displayed = true;

        this.results.push([this.getElapsed(), newHtml]); // pushes new list with time passed (time looking at blank)
      } else {
        this.index++;
        this.displayed = false;

        if (this.index >= this.structured_reading_string.length) {
          this.endTrial();
        } else {
          newHtml =
            "<p class='text-before-current-region'>" +
            this.generateBlank(this.structured_reading_string[this.index]) +
            "</p>";
        }

        this.results[this.results.length - 1].push(this.getElapsed()); // pushes second time spent looking at word
      }
      return newHtml;
    }

    var displayString = "";
    for (const s of this.current_display_string) {
      displayString += s + " "; // include another element
    }

    return displayString;
  }

  private generateBlank(text: string | string[]): string {
    const length = text.length;
    var res = "";

    // type of string (in context of plugin: chunk)
    if (typeof text === "string") {
      const split = text.split(" "); // checks for spaces to break up underscores

      if (split.length > 1) {
        for (var i = 0; i < split.length; i++) {
          res += "_".repeat(split[i].length) + " ";
        }
      } else res = "_".repeat(length);
    }
    // type of array (in context of plugin: line)
    else {
      // var res = "";
      for (var i = 0; i < length; i++) {
        res += this.generateBlank(text[i]) + " ";
      }
    }

    return res;
  }

  private getElapsed() {
    return Date.now() - this.startTime;
  }
}

export default SprPlugin;
