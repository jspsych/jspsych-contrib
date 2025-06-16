import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

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
    font_family: {
      type: ParameterType.STRING,
      pretty_name: "Font family",
      default: "monospace",
    },
    font_size: {
      type: ParameterType.STRING,
      pretty_name: "Font size",
      default: "24px",
    },
    font_weight: {
      type: ParameterType.STRING,
      pretty_name: "Font weight",
      default: "normal",
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
) {
  let canvas_rect: number[];
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

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    display_element.innerHTML = `<div>
      <canvas
        id="canvas"
        width="${trial.canvas_size[0]}"
        height="${trial.canvas_size[1]}"
        style="${trial.canvas_style}"
      ></canvas>
      </div>`;

    const sentence_font = `${trial.font_weight} ${trial.font_size} ${trial.font_family}`;

    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    const canvas_rect = set_canvas(canvas, ctx, trial.canvas_colour, trial.translate_origin);
    const canvas_center = {
      x: canvas_rect[0] + canvas_rect[2] / 2,
      y: canvas_rect[1] + canvas_rect[3] / 2,
    };

    const position_left = {
      x:
        trial.position_left.x !== null
          ? trial.position_left.x
          : canvas_rect[0] + canvas_rect[2] / 3,
      y: trial.position_left.y !== null ? trial.position_left.y : canvas_center.y,
    };
    const position_right = {
      x:
        trial.position_right.x !== null
          ? trial.position_right.x
          : canvas_rect[0] + (2 * canvas_rect[2]) / 3,
      y: trial.position_right.y !== null ? trial.position_right.y : canvas_center.y,
    };
    const position_text = { x: canvas_center.x, y: (canvas_center.y + canvas_rect[1]) / 2 };

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let word_on_the_left: Array<boolean>;
    let word_number: number;
    let last_display_time: number;

    let trial_data = {
      sentence: trial.sentence.map((x) => x[0]).join(" "),
      events: [],
      question: null,
    };

    let keyboardListener: { (e: KeyboardEvent): void; (e: KeyboardEvent): void };

    const clear_canvas = () => {
      ctx.font = trial.canvas_font;
      ctx.fillStyle = trial.canvas_colour;
      ctx.fillRect(canvas_rect[0], canvas_rect[1], canvas_rect[2], canvas_rect[3]);
      ctx.beginPath();
    };

    const display_words = (left_word: string, right_word: string, text: string = null) => {
      clear_canvas();
      ctx.font = sentence_font;
      ctx.fillStyle = trial.font_colour;
      ctx.fillText(left_word, position_left.x, position_left.y);
      ctx.fillText(right_word, position_right.x, position_right.y);
      if (null !== text) {
        ctx.fillText(text, position_text.x, position_text.y);
      }
    };

    const display_message = (message: string) => {
      clear_canvas();
      ctx.font = sentence_font;
      ctx.fillStyle = trial.font_colour;
      ctx.fillText(message, canvas_center.x, canvas_center.y);
    };

    const ask_question = () => {
      this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      const correct_on_the_left = Math.random() < 0.5;
      const [left, right] = correct_on_the_left
        ? [trial.question.correct, trial.question.wrong]
        : [trial.question.wrong, trial.question.correct];
      display_words(left, right, trial.question.text);
      keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: (info: { rt: number; key: string }) => {
          trial_data.question = {
            question: trial.question,
            correct: correct_on_the_left
              ? info.key == trial.keys.left
              : info.key == trial.keys.right,
            rt: info.rt,
          };
          end_trial();
        },
        valid_responses: [trial.keys.left, trial.keys.right],
        rt_method: "performance",
        persist: true,
        allow_held_key: false,
      });
    };

    const step_display = (n) => {
      const [word, foil] = trial.sentence[n];
      const [left, right] = word_on_the_left[n] ? [word, foil] : [foil, word];
      display_words(left, right);
    };

    const after_response = (info: { rt: number; key: string }) => {
      const rt = info.rt - last_display_time;
      const correct = word_on_the_left[word_number]
        ? info.key == trial.keys.left
        : info.key == trial.keys.righ;
      const [word, foil] = trial.sentence[word_number];
      // FIXME: maybe we want to pre-allocate trial_data.events for more reactivity?
      trial_data.events.push({
        correct: correct,
        foil: foil,
        rt: rt,
        side: word_on_the_left[word_number] ? "left" : "right",
        word: word,
        word_number: word_number,
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
      last_display_time = info.rt;
      keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: [trial.keys.left, trial.keys.right],
        rt_method: "performance",
        persist: true,
        allow_held_key: false,
        minimum_valid_rt: trial.waiting_time,
      });
    };

    const end_trial = () => {
      this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      this.jsPsych.finishTrial(trial_data);
    };

    const setup = () => {
      word_number = 0;
      word_on_the_left = Array.from(
        { length: trial.sentence.length },
        (_value, _index) => Math.random() < 0.5
      );
      display_message(`Press ${trial.keys.left} or ${trial.keys.right} to start`);
      keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: start_trial,
        valid_responses: [trial.keys.left, trial.keys.right],
        persist: false,
        allow_held_key: false,
      });
    };

    setup();
  }
}

export default MazePlugin;
