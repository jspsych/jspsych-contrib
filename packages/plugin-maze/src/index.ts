import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
import { KeyboardListener } from "jspsych/dist/modules/plugin-api/KeyboardListenerAPI";

import { version } from "../package.json";

const info = <const>{
  name: "maze",
  version: version,
  parameters: {
    /** Array of [word, foil] couples */
    sentence: {
      type: ParameterType.COMPLEX,
      array: true,
    },
    canvas_size: {
      type: ParameterType.STRING,
      array: true,
      pretty_name: "Canvas size",
      default: ["1280px", "960px"],
    },

    /** Whether to stop the trial on the first error.*/
    halt_on_error: {
      type: ParameterType.BOOL,
      pretty_name: "Halt on error",
      default: false,
    },
    /** How long to wait on a blank screen before displaying the next word. */
    inter_word_interval: {
      type: ParameterType.INT,
      pretty_name: "Inter-words interval",
      default: 0,
    },
    keys: {
      type: ParameterType.COMPLEX,
      pretty_name: "Validation keys",
      default: { left: "f", right: "j" },
      nested: {
        left: {
          type: ParameterType.STRING,
          pretty_name: "Left key",
        },
        right: {
          type: ParameterType.STRING,
          pretty_name: "Right key",
        },
      },
    },
    /** The minimum time (in ms) before the subject is allowed to chose a word. */
    pre_answer_interval: {
      type: ParameterType.INT,
      pretty_name: "Waiting time",
      default: 0,
    },
    translate_origin: {
      type: ParameterType.BOOL,
      pretty_name: "Translate origin",
      default: true,
    },
  },
  data: {
    sentence: {
      type: ParameterType.STRING,
    },
    events: {
      type: ParameterType.COMPLEX,
      array: true,
      nested: {
        correct: { type: ParameterType.BOOL },
        foil: { type: ParameterType.STRING },
        rt: { type: ParameterType.INT },
        side: { type: ParameterType.STRING },
        word: { type: ParameterType.STRING },
        word_number: { type: ParameterType.INT },
      },
    },
  },
  // prettier-ignore
  citations: '__CITATIONS__',
};

type Info = typeof info;

interface Response {
  correct: boolean;
  foil: string;
  rt: number;
  side: "left" | "right";
  word: string;
}

/**
 * **maze**
 *
 * A jsPsych plugin for running Maze experiments
 *
 * @author Morgan Grobol
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-maze/README.md}}
 */
class MazePlugin implements JsPsychPlugin<Info> {
  static info = info;
  display_element: HTMLElement;
  canvas_colour: string;
  center_display: HTMLElement;
  font_colour: string;
  keyboard_listener: KeyboardListener;
  keys: { left: string; right: string };
  left_display: HTMLElement;
  right_display: HTMLElement;
  style: HTMLElement;
  text_display: HTMLElement;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.display_element = display_element;
    this.display_element.innerHTML = `
      <div id="jspsych-maze-display_parent">
        <div id="jspsych-maze-center_display" class="jspsych-maze-display"></div>
        <div id="jspsych-maze-text_display" class="jspsych-maze-display"></div>
        <div id="jspsych-maze-left_display" class="jspsych-maze-display jspsy-maze-answer"></div>
        <div id="jspsych-maze-right_display" class="jspsych-maze-display jspsy-maze-answer"></div>
      </div>`;
    this.style = document.createElement("style");
    this.style.innerHTML = `
      #jspsych-maze-display_parent {
        position: relative;
        width: ${trial.canvas_size[0]};
        height: ${trial.canvas_size[1]};
      }
      .jspsych-maze-display{
        position: absolute;
      }
      .jspsych-maze-answer{
        width: max-content;
      }
      #jspsych-maze-center_display {
        top: 50%;
        transform: translateY(-50%);
        width: 100%;
      }
      #jspsych-maze-text_display {
        top: 50%;
        transform: translateY(-50%) translateY(-5em);
        width: 100%;
      }
      #jspsych-maze-left_display {
        left: calc(100% / 3);
        top: 50%;
        transform: translate(-50%, -50%);
      }
      #jspsych-maze-right_display {
        left: calc(2 * (100% / 3));
        top: 50%;
        transform: translate(-50%, -50%);
      }
      `;
    document.head.appendChild(this.style);
    this.center_display = document.getElementById("jspsych-maze-center_display");
    this.left_display = document.getElementById("jspsych-maze-left_display");
    this.right_display = document.getElementById("jspsych-maze-right_display");
    this.text_display = document.getElementById("jspsych-maze-text_display");

    this.font_colour = trial.font_colour;
    this.keys = trial.keys;

    const results: {
      sentence: string;
      events: Array<Response>;
    } = {
      sentence: trial.sentence.map((x) => x[0]).join(" "),
      events: [],
    };

    let last_display_time: number;
    let word_number = 0;
    const word_on_the_left = Array.from(
      { length: trial.sentence.length },
      (_value, _index) => Math.random() < 0.5
    );

    const step_display = (n: number) => {
      const [word, foil] = trial.sentence[n];
      const [left, right] = word_on_the_left[n] ? [word, foil] : [foil, word];
      this.display_words(left, right);
    };

    const after_response = (info: { rt: number; key: string }) => {
      const rt = info.rt - last_display_time;
      const correct = word_on_the_left[word_number]
        ? info.key == this.keys.left
        : info.key == this.keys.right;
      const [word, foil] = trial.sentence[word_number];
      // FIXME: maybe we want to pre-allocate trial_data.events for more reactivity?
      results.events.push({
        correct: correct,
        foil: foil,
        rt: rt,
        side: word_on_the_left[word_number] ? "left" : "right",
        word: word,
      } as Response);
      if (word_number < trial.sentence.length - 1 && (correct || !trial.halt_on_error)) {
        word_number++;
        this.clear_display();
        this.jsPsych.pluginAPI.setTimeout(
          () => step_display(word_number),
          trial.inter_word_interval
        );
        last_display_time = info.rt + trial.inter_word_interval;
      } else {
        end_trial();
      }
    };

    const start_trial = (info: { rt: number; key: string }) => {
      step_display(0);
      last_display_time = 0;
      // TODO: there's trickery here: by enforcing at least inter_word_interval beteween keypresses,
      // we ensure that keypresses before display will be ignored (since the display happens at
      // inter_word_interval).
      this.keyboard_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: [this.keys.left, this.keys.right],
        rt_method: "performance",
        persist: true,
        allow_held_key: false,
        minimum_valid_rt: trial.inter_word_interval + trial.pre_answer_interval,
      });
    };

    const end_trial = () => {
      this.jsPsych.pluginAPI.cancelKeyboardResponse(this.keyboard_listener);
      this.jsPsych.finishTrial(results);
    };

    const setup = () => {
      this.display_message(`Press ${this.keys.left} or ${this.keys.right} to start`);
      this.keyboard_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: start_trial,
        valid_responses: [this.keys.left, this.keys.right],
        persist: false,
        allow_held_key: false,
      });
    };

    setup();
  }

  clear_display() {
    this.center_display.innerHTML = "";
    this.left_display.innerHTML = "";
    this.right_display.innerHTML = "";
    this.text_display.innerHTML = "";
  }

  display_words(left_word: string, right_word: string, text: string | null = null) {
    this.clear_display();

    this.left_display.innerHTML = left_word;
    this.right_display.innerHTML = right_word;

    if (null !== text) {
      this.text_display.innerHTML = text;
    }
  }

  display_message(message: string) {
    this.clear_display();
    this.center_display.innerHTML = message;
  }
}

export default MazePlugin;
