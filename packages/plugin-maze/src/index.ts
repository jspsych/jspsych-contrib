import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "maze",
  version: version,
  parameters: {
    /** TODO: Provide a clear description of the parameter_name that could be used as documentation. We will eventually use these comments to automatically build documentation and produce metadata. */
    sent: {
      type: ParameterType.COMPLEX,
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
    translate_origin: {
      type: ParameterType.BOOL,
      pretty_name: "Translate origin",
      default: true,
    },
    xy_position: {
      type: ParameterType.INT,
      array: true,
      pretty_name: "XY position",
      default: [0, 0],
    },
    x_align: {
      type: ParameterType.STRING,
      pretty_name: "X alignment",
      default: "center",
    },
    y_align: {
      type: ParameterType.STRING,
      pretty_name: "Y alignment",
      default: "top",
    },
  },
  data: {
    /** Provide a clear description of the data1 that could be used as documentation. We will eventually use these comments to automatically build documentation and produce metadata. */
    report: {
      type: ParameterType.COMPLEX,
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

    ctx.textAlign = trial.x_align as CanvasTextAlign;
    ctx.textBaseline = "middle";

    let word_number: number;
    let last_display_time: number;

    let trial_data = {
      sentence: "",
      events: [],
    };

    let keyboardListener: { (e: KeyboardEvent): void; (e: KeyboardEvent): void };

    const clear_canvas = () => {
      ctx.font = trial.canvas_colour;
      ctx.fillStyle = trial.canvas_colour;
      ctx.fillRect(canvas_rect[0], canvas_rect[1], canvas_rect[2], canvas_rect[3]);
    };

    const display_word = (word: string) => {
      clear_canvas();
      ctx.font = sentence_font;
      ctx.fillStyle = trial.font_colour;
      // TODO: debounce?
      ctx.fillText(word, trial.xy_position[0], trial.xy_position[1]);
    };

    const after_response = (info: { rt: any }) => {
      if (undefined === last_display_time) {
        last_display_time = 0;
      }
      if (word_number > 0) {
        trial_data.events.push({
          foil: "foil",
          rt: info.rt - last_display_time,
          side: "left",
          word: trial.sent[word_number],
          word_number: word_number,
        });
      }
      if (word_number < trial.sent.length - 1) {
        word_number++;
        display_word(trial.sent[word_number]);
        last_display_time = info.rt;
      } else {
        end_trial();
      }
    };

    const start_trial = () => {
      word_number = -1;
      display_word("Press SPACE to start");
      keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: [" "],
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
