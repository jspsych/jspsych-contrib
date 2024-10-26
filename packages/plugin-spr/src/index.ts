import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "spr",
  version: version,
  parameters: {
    /**
     * This is the string of text that will be displayed to the participant during the trial. Without any
     * ^ characters, the text will be split up based on the space character. If the ^ character is used,
     * the text will be split up based on the ^ character.
     */
    unstructured_reading_string: {
      type: ParameterType.STRING,
      default: "",
    },
    /**
     * This string acts as a structured version of the `unstructured_reading_string`, where the text is
     * instead split using different elements of an array. The ^ character is not used as a delimiter
     * in this string.
     */
    structured_reading_string: {
      type: ParameterType.STRING,
      array: true,
      default: [],
    },
    /**
     * Mode between 1-3 that indicate the different built-in modes for how stimulus will be displayed.
     *
     * - 1: The text will be displayed blank initially, with each new chunk revealed causing the previous
     * chunk to be blanked out.
     *
     * - 2: The text will be displayed blank initially, with each new chunk revealed staying revealed.
     *
     * - 3: The text will be displayed chunk-by-chunk, with each new chunk replacing the previous chunk.
     */
    mode: {
      type: ParameterType.INT,
      default: 1,
    },
    /**
     * Indicates how many words will be included with each chunk when splitting the
     * `unstructured_reading_string`.
     */
    chunk_size: {
      type: ParameterType.INT,
      default: 1,
    },
    /**
     * Indicates how many chunks will be included with each chunk when splitting the
     * `unstructured_reading_string`.
     *
     * !! Unknown if we'll need this !!
     */
    line_size: {
      type: ParameterType.INT,
      default: 1,
    },
    /**
     * This array contains the key(s) that the participant is allowed to press in order to advance
     * to the next chunk. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values this page}
     * and
     * {@link https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/ this page (event.key column)}
     * for more examples. Any key presses that are not listed in the
     * array will be ignored. The value of `"ALL_KEYS"` means that all keys will be accepted as valid responses.
     */
    choices: {
      type: ParameterType.KEYS,
      default: [" "],
    },
  },
  data: {
    /* The representation of the `structured_reading_string` that was used. Combined with the mode, this 
    tells what exactly was displayed on the screen during each click. */
    stimulus: {
      type: ParameterType.STRING,
      array: true,
    },
    /** Indicates the mode that the SPR experiment was ran using. */
    mode: {
      type: ParameterType.INT,
    },
    // TODO: redocument this -> might need to change to a more structured format
    /** Records the results of the SPR experiment. */
    results: {
      type: ParameterType.COMPLEX,
      array: true,
    },
  },
};

type Info = typeof info;

/**
 * **spr**
 *
 * This is a package built to enable self-paced reading trials.
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
  private mode: 1 | 2 | 3;
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
    else document.querySelector("p")!.innerHTML = this.updateDisplayString(null); // update this, passing null for TS
  }

  private endTrial() {
    // TODO: figure out data saving -> will need to add times and how long to make it
    var trial_data = {
      stimulus: this.structured_reading_string,
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
    if (trial.structured_reading_string.length > 0) {
      this.structured_reading_string = trial.structured_reading_string;
    } else {
      this.structured_reading_string = this.createReadingString(
        trial.unstructured_reading_string,
        trial.chunk_size,
        trial.line_size
      );
    }

    this.jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: (info) => this.onSpacebarPress(info),
      valid_responses: trial.choices,
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
    const split_text = unstructured_reading_string.includes("^")
      ? unstructured_reading_string.split("^")
      : unstructured_reading_string.split(" ");
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

      newHtml = `<p>${this.updateDisplayString(info)}</p>`;
    } else if (this.mode === 3) {
      // might want to include incrementation here for consistency
      newHtml = this.updateDisplayString(info);
    }
    // need to handle a keyboard press element where records how long until press a key

    // Add any action you want to happen on spacebar press
    // e.g., changing the displayed text, ending the trial, etc.
    document.querySelector("p")!.innerHTML = newHtml;
  }

  // This helper method assists with mode 1 and 2 to keep efficency when updating indicies and the scren
  private updateDisplayString(info?: any): string {
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
          this.getElapsed(),
          info.key
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

        this.results.push([this.getElapsed(), newHtml, info.key]); // pushes new list with time passed (time looking at blank)
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

        this.results[this.results.length - 1].push(this.getElapsed(), info.key); // pushes second time spent looking at word
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

  // TODO: turn this into performance.now() for more accurate results
  // TODO: also, will need to subtract the time from the previous time for data
  private getElapsed() {
    return Date.now() - this.startTime;
  }
}

export default SprPlugin;
