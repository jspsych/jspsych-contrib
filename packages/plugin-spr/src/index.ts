import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "spr",
  version: version,
  parameters: {
    /**
     * This is the string of text that will be displayed to the participant during the trial. Without any
     * ^ characters, the text will be split up based on the space character. If the ^ character is used,
     * the text will be split up based on the space character.
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
    /** Records the results of the SPR experiment. */
    results: {
      type: ParameterType.COMPLEX,
      array: true,
      nested: {
        /** The response time in milliseconds from when the stimulus was displayed to when a valid key was pressed. */
        rt: {
          type: ParameterType.INT,
        },
        /** The stimulus that was displayed to the participant. */
        stimulus: {
          type: ParameterType.STRING,
        },
        /** The line number of the stimulus that was displayed. */
        line_number: {
          type: ParameterType.INT,
        },
        /** The key that was pressed by the participant. */
        key_pressed: {
          type: ParameterType.STRING,
        },
      },
    },
  },
};

type Info = typeof info;

/**
 * **spr**
 *
 * This is a package built to enable self-paced reading trials.
 *
 * @author Victor Zhang, jadeddelta
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-spr/README.md}}
 */
class SprPlugin implements JsPsychPlugin<Info> {
  static info = info;
  private index: number = 0;
  private innerIndex: number = -1; // mode 1-2: initialized so that not shown if has an innerIndex
  private currentDisplayString: string[] = []; // mode 1-2: use this to save iterations
  private readingString: string[] | string[][] = [];
  private mode: 1 | 2 | 3;
  private results = [];
  private startTime: number;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.initializeVariables(trial);
    // setup html logic
    var html = `<p id="jspsych-spr-content"></p>`;
    display_element.innerHTML = html;

    if (this.mode === 3) {
      const blank = this.generateBlank(this.readingString[this.index]);
      document.querySelector("#jspsych-spr-content").innerHTML = blank;
      this.addDataPoint(blank, this.index);
      this.index = -1; // this initializes mode in way that allows to start at 0, might not be best way to do it
    } else document.querySelector("#jspsych-spr-content").innerHTML = this.updateDisplayString(); // update this, passing null for TS
  }

  private endTrial() {
    var trial_data = {
      stimulus: this.readingString.flat(),
      mode: this.mode,
      results: this.results,
    };
    // end trial
    this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
    this.jsPsych.finishTrial(trial_data);
  }

  private initializeVariables(trial: TrialType<Info>) {
    if (trial.mode === 1 || trial.mode === 2 || trial.mode === 3) this.mode = trial.mode;
    else throw new Error("Mode declared incorrectly, must be between 1 and 3.");

    // todo: use mode to determine (not sure what this means @/victor)
    if (trial.structured_reading_string.length > 0) {
      if (trial.unstructured_reading_string.length > 0)
        console.warn(
          "Both structured and unstructured reading strings are defined. Using structured reading string."
        );

      this.readingString = trial.structured_reading_string;
    } else {
      this.readingString = this.createReadingString(
        trial.unstructured_reading_string,
        trial.chunk_size,
        trial.line_size
      );
    }

    this.jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: (info) => this.onValidKeyPress(info),
      valid_responses: trial.choices,
      rt_method: "performance",
      persist: true,
      allow_held_key: false,
    });

    this.startTime = performance.now();
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

  private onValidKeyPress(info?: any) {
    var newHtml = "";

    // handles logic on whether to display blank or show text using boolean/index
    if (this.mode === 1 || this.mode === 2) {
      const curr_length = this.readingString[this.index].length;
      this.innerIndex++;

      if (this.innerIndex >= curr_length) {
        // resets the index and moves onto the next
        this.innerIndex = -1; // ensures will be empty
        this.index++;

        if (this.index >= this.readingString.length) {
          this.endTrial();
          return;
        }
      }

      newHtml = `<p>${this.updateDisplayString(info)}</p>`;
    } else if (this.mode === 3) {
      // might want to include incrementation here for consistency
      this.index++;

      if (this.index >= this.readingString.length) {
        this.endTrial();
        return;
      }

      newHtml = this.updateDisplayString(info);
    }
    // need to handle a keyboard press element where records how long until press a key

    document.querySelector("#jspsych-spr-content").innerHTML = newHtml;
  }

  // This helper method assists with mode 1 and 2 to keep efficency when updating indicies and the scren
  private updateDisplayString(info: any = {}): string {
    if (this.mode === 1 || this.mode === 2) {
      if (this.innerIndex === -1) {
        // need to update new display string
        const new_display_string: string[] = [];
        const curr_segment = this.readingString[this.index];

        for (var i = 0; i < curr_segment.length; i++) {
          new_display_string.push(
            "<span class='text-before-current-region'>" +
              this.generateBlank(curr_segment[i]) +
              "</span>"
          );
        }

        this.currentDisplayString = new_display_string;
        this.addDataPoint(this.currentDisplayString.join(" "), this.index, info.key);
      } else {
        if (this.mode === 1 && this.innerIndex > 0) {
          this.currentDisplayString[this.innerIndex - 1] =
            "<span class='text-after-current-region'>" +
            this.generateBlank(this.readingString[this.index][this.innerIndex - 1]) +
            "</span>";
        } else if (this.mode === 2 && this.innerIndex > 0) {
          // changes classifier
          this.currentDisplayString[this.innerIndex - 1] =
            "<span class='text-after-current-region'>" +
            this.readingString[this.index][this.innerIndex - 1] +
            "</span>";
        }

        // shows next display
        this.currentDisplayString[this.innerIndex] =
          "<span class='text-current-region'>" +
          this.readingString[this.index][this.innerIndex] +
          "</span>";

        this.addDataPoint(this.currentDisplayString.join(" "), this.index, info.key);
      }
    } else if (this.mode == 3) {
      var stimulus = "";

      // accounts for bad user input (not necessary) and could move it up to input
      if (typeof this.readingString[this.index] === "string")
        stimulus = this.readingString[this.index] as string;
      else {
        for (const c of this.readingString[this.index]) {
          stimulus += c + " ";
        }
      }

      var newHtml = "<p class='text-current-region'>" + stimulus + "</p>";

      this.addDataPoint(stimulus, this.index, info.key);
      return newHtml;
    }

    var displayString = "";
    for (const s of this.currentDisplayString) {
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

  private getTimeElapsed() {
    const prev = this.startTime;
    const now = performance.now();
    this.startTime = now;
    return Math.round(now - prev);
  }

  private addDataPoint(stimulus: string, line_number: number, key?: string) {
    const res = {
      rt: this.getTimeElapsed(),
      stimulus: stimulus,
      line_number: line_number,
    };

    // Add key_pressed if key exists
    if (key) {
      res["key_pressed"] = key;
    } else {
      res["key_pressed"] = null;
    }

    this.results.push(res);
  }
}

export default SprPlugin;
