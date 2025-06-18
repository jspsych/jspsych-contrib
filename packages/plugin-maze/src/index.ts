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
    /** Object with key "text", "correct", "wrong". Can't give a schema or it gets non-nullable. **/
    question: {
      type: ParameterType.COMPLEX,
      default: null,
    },
    canvas_style: {
      type: ParameterType.STRING,
      pretty_name: "Extra canvas style",
      default: "border: 0px solid black;",
    },
    canvas_colour: {
      type: ParameterType.STRING,
      pretty_name: "Canvas colour",
      default: "white",
    },
    canvas_size: {
      type: ParameterType.INT,
      array: true,
      pretty_name: "Canvas size",
      default: [1280, 960],
    },
    font_colour: {
      type: ParameterType.STRING,
      pretty_name: "Font colour",
      default: "black",
    },
    font_style: {
      type: ParameterType.STRING,
      pretty_name: "Font size",
      default: "normal 24px monospace",
    },
    /** Whether to stop the trial on the first error and go directly to the question (if any) or
     * exit. */
    halt_on_error: {
      type: ParameterType.BOOL,
      pretty_name: "Halt on error",
      default: false,
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
    position_left: {
      type: ParameterType.COMPLEX,
      pretty_name: "Position of the left element.",
      default: { x: null, y: null },
      nested: {
        x: {
          type: ParameterType.FLOAT,
          pretty_name: "Horizontal position",
        },
      },
      y: {
        type: ParameterType.FLOAT,
        pretty_name: "Vertical position",
      },
    },
    position_right: {
      type: ParameterType.COMPLEX,
      pretty_name: "Position of the right element ",
      default: { x: null, y: null },
      nested: {
        x: {
          type: ParameterType.FLOAT,
          pretty_name: "Horizontal position",
        },
      },
      y: {
        type: ParameterType.FLOAT,
        pretty_name: "Vertical position",
      },
    },
    translate_origin: {
      type: ParameterType.BOOL,
      pretty_name: "Translate origin",
      default: true,
    },
    /** How long to wait after showing a word and before registering keypresses (in ms) */
    waiting_time: {
      type: ParameterType.INT,
      pretty_name: "Waiting time",
      default: 0,
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
      question: {
        type: ParameterType.COMPLEX,
      },
    },
  },
  // prettier-ignore
  citations: '__CITATIONS__',
};

type Info = typeof info;

function set_canvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  colour: string | CanvasGradient | CanvasPattern,
  translate_origin: Boolean
): [number, number, number, number] {
  let canvas_rect: [number, number, number, number];
  if (translate_origin) {
    ctx.translate(canvas.width / 2, canvas.height / 2); // make center (0, 0)
    canvas_rect = [-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height];
  } else {
    canvas_rect = [0, 0, canvas.width, canvas.height];
  }
  ctx.fillStyle = colour;
  ctx.fillRect(canvas_rect[0], canvas_rect[1], canvas_rect[2], canvas_rect[3]);
  ctx.beginPath();
  return canvas_rect;
}

interface Position {
  x: number;
  y: number;
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
  canvas: HTMLCanvasElement;
  canvas_colour: string;
  canvas_rect: [number, number, number, number];
  canvas_center: Position;
  ctx: CanvasRenderingContext2D;
  font_colour: string;
  keyboard_listener: KeyboardListener;
  keys: { left: string; right: string };
  position_left: Position;
  position_right: Position;
  position_text: Position;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.display_element = display_element;
    this.display_element.innerHTML = `<div>
      <canvas
        id="canvas"
        width="${trial.canvas_size[0]}"
        height="${trial.canvas_size[1]}"
        style="${trial.canvas_style}"
      ></canvas>
      </div>`;

    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.canvas_colour = trial.canvas_colour;

    this.ctx = this.canvas.getContext("2d");
    this.ctx.font = trial.font_style;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    this.canvas_rect = set_canvas(
      this.canvas,
      this.ctx,
      this.canvas_colour,
      trial.translate_origin
    );
    this.canvas_center = {
      x: this.canvas_rect[0] + this.canvas_rect[2] / 2,
      y: this.canvas_rect[1] + this.canvas_rect[3] / 2,
    };

    this.font_colour = trial.font_colour;
    this.keys = trial.keys;

    this.position_left = {
      x:
        trial.position_left.x !== null
          ? trial.position_left.x
          : this.canvas_rect[0] + this.canvas_rect[2] / 3,
      y: trial.position_left.y !== null ? trial.position_left.y : this.canvas_center.y,
    };
    this.position_right = {
      x:
        trial.position_right.x !== null
          ? trial.position_right.x
          : this.canvas_rect[0] + (2 * this.canvas_rect[2]) / 3,
      y: trial.position_right.y !== null ? trial.position_right.y : this.canvas_center.y,
    };
    this.position_text = {
      x: this.canvas_center.x,
      y: (this.canvas_center.y + this.canvas_rect[1]) / 2,
    };

    const results: {
      sentence: string;
      events: Array<{
        correct: boolean;
        foil: string;
        rt: number;
        side: "left" | "right";
        word: string;
      }>;
      question: {
        question: { text: string; correct: string; wrong: string };
        correct: boolean;
        rt: number;
      } | null;
    } = {
      sentence: trial.sentence.map((x) => x[0]).join(" "),
      events: [],
      question: null,
    };

    let last_display_time: number;
    let word_number = 0;
    const word_on_the_left = Array.from(
      { length: trial.sentence.length },
      (_value, _index) => Math.random() < 0.5
    );

    const ask_question = () => {
      this.jsPsych.pluginAPI.cancelKeyboardResponse(this.keyboard_listener);
      const correct_on_the_left = Math.random() < 0.5;
      const [left, right] = correct_on_the_left
        ? [trial.question.correct, trial.question.wrong]
        : [trial.question.wrong, trial.question.correct];
      this.display_words(left, right, trial.question.text);
      this.keyboard_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: (info: { rt: number; key: string }) => {
          results.question = {
            question: trial.question,
            correct: correct_on_the_left ? info.key == this.keys.left : info.key == this.keys.right,
            rt: info.rt,
          };
          end_trial();
        },
        valid_responses: [this.keys.left, this.keys.right],
        rt_method: "performance",
        persist: true,
        allow_held_key: false,
      });
    };

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
      });
      if (word_number < trial.sentence.length - 1 && (correct || !trial.halt_on_error)) {
        word_number++;
        step_display(word_number);
        last_display_time = info.rt;
      } else {
        if (undefined !== trial.question) {
          ask_question();
        } else {
          end_trial();
        }
      }
    };

    const start_trial = (info: { rt: number; key: string }) => {
      step_display(0);
      last_display_time = 0;
      this.keyboard_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: [this.keys.left, this.keys.right],
        rt_method: "performance",
        persist: true,
        allow_held_key: false,
        minimum_valid_rt: trial.waiting_time,
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

  clear_canvas() {
    this.ctx.fillStyle = this.canvas_colour;
    this.ctx.fillRect(...this.canvas_rect);
    this.ctx.beginPath();
  }

  display_words(left_word: string, right_word: string, text: string = null) {
    this.clear_canvas();
    this.ctx.fillStyle = this.font_colour;
    this.ctx.fillText(left_word, this.position_left.x, this.position_left.y);
    this.ctx.fillText(right_word, this.position_right.x, this.position_right.y);
    if (null !== text) {
      this.ctx.fillText(text, this.position_text.x, this.position_text.y);
    }
  }

  display_message(message: string) {
    this.clear_canvas();
    this.ctx.fillStyle = this.font_colour;
    this.ctx.fillText(message, this.canvas_center.x, this.canvas_center.y);
  }
}

export default MazePlugin;
