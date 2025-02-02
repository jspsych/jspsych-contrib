import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "spr",
  version: version,
  parameters: {
    /**
     * This is the string of text that will be displayed to the participant during the trial. The text
     * will be split up into segments based on either the space bar or the `delimiter` character if
     * it is present.
     */
    sentence: {
      type: ParameterType.STRING,
      default: undefined,
    },
    /**
     * If this character is present in the `sentence` parameter, the text will be split up based on the
     * `delimiter` character. If the `delimiter` character is not present, the text will be split up based
     * on the space character.
     */
    delimiter: {
      type: ParameterType.STRING,
      default: "^",
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
     * Indicates how many segments will be revealed upon a key press.
     */
    segments_per_key_press: {
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
    /** The individual segments that are displayed per key press. */
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
        /** The segment that was displayed to the participant. */
        segment: {
          type: ParameterType.STRING,
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
  /** the sentence, divided into segments. */
  private readingString: string[];
  /** stores which indicies of the `readingString` are visible (unmasked). */
  private isVisible: boolean[];
  /** the current index the user is on. */
  private index: number;
  // --- parameter fields ---
  private mode: 1 | 2 | 3;
  // --- data fields ---
  private results = [];
  private startTime: number;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.initializeVariables(trial);
    // setup styles
    var css = `<style id="jspsych-spr-mask>`;

    // setup html logic
    var html = `<p id="jspsych-spr-content">${this.generateDisplayString()}</p>`;
    display_element.innerHTML = html;

    // start timer
    this.startTime = performance.now();
  }

  private endTrial() {
    var trial_data = {
      stimulus: this.readingString,
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

    // split text based on delimiter or space
    const splitText = trial.sentence.includes(trial.delimiter)
      ? trial.sentence.split(trial.delimiter)
      : trial.sentence.split(" ");

    this.readingString = [];
    var currentSegment: string[] = [];

    for (var i = 0; i < splitText.length; i++) {
      const word = splitText[i];
      currentSegment.push(word);

      if (currentSegment.length >= trial.segments_per_key_press) {
        this.readingString.push(currentSegment.join(" "));
        currentSegment = [];
      }
    }

    if (currentSegment.length > 0) this.readingString.push(currentSegment.join(" "));

    this.isVisible = new Array(this.readingString.length).fill(false);
    this.index = -1;

    this.jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: (info) => this.onValidKeyPress(info),
      valid_responses: trial.choices,
      rt_method: "performance",
      persist: true,
      allow_held_key: false,
    });
  }

  /** given the mode, current index, and mask array, generate html string to be displayed */
  private generateDisplayString(): string {
    if (this.mode !== 3) {
      if (this.index !== -1) {
        return this.getDisplayArray()
          .map((text, i) => {
            if (i < this.index) {
              return "<span class='jspsych-spr-before-text'>" + text + "</span>";
            } else if (i === this.index) {
              return "<span class='jspsych-spr-current-text'>" + text + "</span>";
            } else {
              return "<span class='jspsych-spr-after-text'>" + text + "</span>";
            }
          })
          .join(" ");
      } else {
        return (
          "<span class='jspsych-spr-before-text'>" +
          this.readingString.map((text) => this.generateBlank(text)).join(" ") +
          "</span>"
        );
      }
    } else {
      if (this.index !== -1) {
        return (
          "<span class='jspsych-spr-before-text'>" + this.readingString[this.index] + "</span>"
        );
      } else {
        return (
          "<span class='jspsych-spr-current-text'>" +
          this.generateBlank(this.readingString[0]) +
          "</span>"
        );
      }
    }
  }

  /** returns `readingString` as a processed string array based on visibility */
  private getDisplayArray(): string[] {
    return this.readingString.map((text, i) => {
      if (i < this.index) {
        return this.isVisible[i] ? text : this.generateBlank(text);
      } else if (i === this.index) {
        return text;
      } else {
        return this.generateBlank(text);
      }
    });
  }

  /** updates sentence, mask array, and index before regenerating display string */
  private onValidKeyPress(info?: any) {
    if (this.mode === 3) {
      if (this.index === -1) this.addDataPoint(this.generateBlank(this.readingString[0]), info.key);
      else this.addDataPoint(this.readingString[this.index], info.key);
    } else this.addDataPoint(this.getDisplayArray().join(" "), info.key);

    this.index++;
    if (this.index >= this.readingString.length) {
      this.endTrial();
    } else {
      if (this.index !== 0) {
        // keep visible if mode 2
        this.isVisible[this.index - 1] = this.mode === 2;
      }
      this.isVisible[this.index] = true;
      document.querySelector("#jspsych-spr-content").innerHTML = this.generateDisplayString();
    }
  }

  private generateBlank(text: string): string {
    const split = text.split(" ");
    if (split.length > 1) return split.map((word) => "_".repeat(word.length)).join(" ");
    else return "_".repeat(text.length);
  }

  private getTimeElapsed() {
    const prev = this.startTime;
    const now = performance.now();
    this.startTime = now;
    return Math.round(now - prev);
  }

  private addDataPoint(stimulus: string, key: string) {
    this.results.push({
      rt: this.getTimeElapsed(),
      segment: stimulus,
      key_pressed: key,
    });
  }
}

export default SprPlugin;
