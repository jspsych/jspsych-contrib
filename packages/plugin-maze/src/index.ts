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
    canvas_border: {
      type: ParameterType.STRING,
      pretty_name: "Canvas border",
      default: "0px solid black",
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
  },
  data: {
    /** TODO: Provide a clear description of the data1 that could be used as documentation. We will eventually use these comments to automatically build documentation and produce metadata. */
    report: {
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
        style="border:${trial.canvas_border};"
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

    ctx.textAlign = trial.x_align as CanvasTextAlign;
    ctx.textBaseline = "middle";

    let word_on_the_left: Array<boolean>;
    let word_number: number;
    let last_display_time: number;

    let trial_data = {
      sentence: trial.sentence.map((x) => x[0]).join(" "),
      events: [],
    };

    let keyboardListener: { (e: KeyboardEvent): void; (e: KeyboardEvent): void };

    const clear_canvas = () => {
      ctx.font = trial.canvas_colour;
      ctx.fillStyle = trial.canvas_colour;
      ctx.fillRect(canvas_rect[0], canvas_rect[1], canvas_rect[2], canvas_rect[3]);
      ctx.beginPath();
    };

    const display_word = (left_word: string, right_word: string) => {
      clear_canvas();
      ctx.font = sentence_font;
      ctx.fillStyle = trial.font_colour;
      // TODO: debounce?
      ctx.fillText(left_word, position_left.x, position_left.y);
      ctx.fillText(right_word, position_right.x, position_right.y);
    };

    const display_message = (message: string) => {
      clear_canvas();
      ctx.font = sentence_font;
      ctx.fillStyle = trial.font_colour;
      ctx.fillText(message, canvas_center.x, canvas_center.y);
    };

    const after_response = (info: { rt: number; key: string }) => {
      if (undefined === last_display_time) {
        last_display_time = 0;
      }
      // FIXME: maybe we want to pre-allocate this stuff for more reactivity?
      if (word_number >= 0) {
        const correct = word_on_the_left[word_number]
          ? info.key == trial.keys.left
          : info.key == trial.keys.righ;
        const [word, foil] = trial.sentence[word_number];
        trial_data.events.push({
          correct: correct,
          foil: foil,
          rt: info.rt - last_display_time,
          side: word_on_the_left[word_number] ? "left" : "right",
          word: word,
          word_number: word_number,
        });
      }
      if (word_number < trial.sentence.length - 1) {
        word_number++;
        const [word, foil] = trial.sentence[word_number];
        const [left, right] = word_on_the_left[word_number] ? [word, foil] : [foil, word];
        display_word(left, right);
        last_display_time = info.rt;
      } else {
        end_trial();
      }
    };

    const start_trial = () => {
      word_number = -1;
      word_on_the_left = Array.from(
        { length: trial.sentence.length },
        (_value, _index) => Math.random() < 0.5
      );
      display_message(`Press ${trial.keys.left} or ${trial.keys.right} to start`);
      keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: [trial.keys.left, trial.keys.right],
        rt_method: "performance",
        persist: true,
        allow_held_key: false,
      });
    };

    const end_trial = () => {
      this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      this.jsPsych.finishTrial(trial_data);
    };

    start_trial();
  }
}

export default MazePlugin;
