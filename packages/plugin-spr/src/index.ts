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
    // setup styles and trial parameters
    var css = this.initializeVariables(trial);

    // setup html logic
    var html = `<p id="jspsych-spr-content">${this.generateDisplayString()}</p>`;
    display_element.innerHTML = css + html;

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

  /** error checking, generate reading string, and returns CSS for the trial. */
  private initializeVariables(trial: TrialType<Info>): string {
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

    var css = `<style>
    .jspsych-spr-before-region {
      ${this.mode !== 2 ? "color: white; border-bottom: 1px solid black; user-select: none;" : ""}
    }
    .jspsych-spr-after-region {
      color: white;
      border-bottom: 1px solid black;
      user-select: none;
    }
    </style>`;

    return css;
  }

  /** given the mode, current index, and mask array, generate html string to be displayed */
  private generateDisplayString(): string {
    if (this.mode !== 3) {
      if (this.index !== -1) {
        return this.readingString
          .map((text, i) => {
            if (i < this.index) {
              return text
                .split(" ")
                .map((word) => "<span class='jspsych-spr-before-region'>" + word + "</span>")
                .join(" ");
            } else if (i === this.index) {
              return text
                .split(" ")
                .map((word) => "<span class='jspsych-spr-current-region'>" + word + "</span>")
                .join(" ");
            } else {
              return text
                .split(" ")
                .map((word) => "<span class='jspsych-spr-after-region'>" + word + "</span>")
                .join(" ");
            }
          })
          .join(" ");
      } else {
        return this.readingString
          .map((text) =>
            text
              .split(" ")
              .map((word) => "<span class='jspsych-spr-after-region'>" + word + "</span>")
              .join(" ")
          )
          .join(" ");
      }
    } else {
      if (this.index !== -1) {
        return (
          "<span class='jspsych-spr-current-region'>" + this.readingString[this.index] + "</span>"
        );
      } else {
        return (
          "<span class='jspsych-spr-after-region'>" +
          this.generateBlank(this.readingString[0]) +
          "</span>"
        );
      }
    }
  }

  /** updates sentence, mask array, and index before regenerating display string */
  private onValidKeyPress(info?: any) {
    if (this.index === -1) this.addDataPoint(this.generateBlank(this.readingString[0]), info.key);
    else this.addDataPoint(this.readingString[this.index], info.key);

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

  // helper function to generate a blank string of input length for data
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
