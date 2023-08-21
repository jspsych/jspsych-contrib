import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "self-paced-reading",
  parameters: {
    sentence: {
      type: ParameterType.STRING,
      pretty_name: "Sentence",
      default: undefined,
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
    font_colour: {
      type: ParameterType.STRING,
      pretty_name: "Font colour",
      default: "black",
    },
    mask_type: {
      type: ParameterType.INT,
      pretty_name: "Mask type",
      default: 1,
    },
    mask_character: {
      type: ParameterType.STRING,
      pretty_name: "Mask character",
      default: "_",
    },
    mask_on_word: {
      type: ParameterType.BOOL,
      pretty_name: "Mask word",
      default: true,
    },
    mask_gap_character: {
      type: ParameterType.STRING,
      pretty_name: "Mask gap character.",
      default: " ",
    },
    mask_offset: {
      type: ParameterType.INT,
      pretty_name: "Mask offset",
      default: 0,
    },
    mask_weight: {
      type: ParameterType.STRING,
      pretty_name: "Mask weight",
      default: "normal",
    },
    mask_colour: {
      type: ParameterType.STRING,
      pretty_name: "Mask colour",
      default: "black",
    },
    line_height: {
      type: ParameterType.INT,
      pretty_name: "Line height",
      default: 80,
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
    canvas_border: {
      type: ParameterType.STRING,
      pretty_name: "Canvas border",
      default: "0px solid black",
    },
    canvas_clear_border: {
      type: ParameterType.BOOL,
      pretty_name: "Clear canvas border",
      default: false,
    },
    translate_origin: {
      type: ParameterType.BOOL,
      pretty_name: "Translate origin",
      default: true,
    },
    choices: {
      type: ParameterType.KEYS,
      pretty_name: "Keys",
      default: [" "],
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
    inter_word_interval: {
      type: ParameterType.INT,
      pretty_name: "inter-word-interval",
      default: 0,
    },
    save_sentence: {
      type: ParameterType.BOOL,
      pretty_name: "Save sentence",
      default: true,
    },
  },
};

function text_mask(txt: string, mask_character: string) {
  return mask_character.repeat(txt.length);
}

// deal with mask type 1 and 2
let mask_operator = {
  1: (a: number, b: number) => a !== b,
  2: (a: number, b: number) => a > b,
};

function display_word(mask_type: number) {
  return (words: string[], word_number: number) =>
    words
      .map((word, idx) =>
        mask_operator[mask_type](idx, word_number) ? text_mask(word, " ") : word
      )
      .join(" ");
}

function display_mask(
  mask_type: number,
  mask_on_word: boolean,
  mask_character: string,
  mask_gap_character: string
) {
  return (words: string[], word_number: number) =>
    words
      .map((word: string, idx: number) =>
        mask_operator[mask_type](idx, word_number)
          ? text_mask(word, mask_character)
          : text_mask(word, mask_on_word ? mask_character : " ")
      )
      .join(mask_gap_character);
}

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

type Info = typeof info;

/**
 * **self-paced-reading**
 *
 * jsPsych plugin for self paced reading paradigms.
 *
 * @author igmmgi
 * @see {@link https://www.jspsych.org/plugins/jspsych-self-paced-reading/ self-paced-reading plugin documentation on jspsych.org}
 */
class SelfPacedReadingPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    display_element.innerHTML =
      "<div>" +
      '<canvas id="canvas" width="' +
      trial.canvas_size[0] +
      '" height="' +
      trial.canvas_size[1] +
      '" style="border: ' +
      trial.canvas_border +
      ';"></canvas>' +
      "</div>";

    let canvas = document.getElementById("canvas") as HTMLCanvasElement;
    let ctx = canvas.getContext("2d");
    let canvas_rect = set_canvas(canvas, ctx, trial.canvas_colour, trial.translate_origin);

    // basic font style
    ctx.textAlign = trial.x_align as CanvasTextAlign;
    ctx.textBaseline = "middle";

    // text properties
    let words = [];
    let line_length = [];
    let sentence_length = 0;
    let word_number = -1;
    let word_number_line = -1;
    let line_number = 0;
    let sentence = trial.sentence.replace(/(\r\n|\n|\r)/gm, "");
    let sentence_split: string[];
    let words_concat = sentence.split(" ");
    let sentence_font = trial.font_weight + " " + trial.font_size + " " + trial.font_family;
    let mask_font = trial.mask_weight + " " + trial.font_size + " " + trial.font_family;

    let rts: number[] = [0];

    // if mask type = 3, repeat mask character x number of letters in first word
    let mask_character =
      trial.mask_type !== 3
        ? trial.mask_character
        : trial.mask_character.repeat(words_concat[0].length);

    // deal with potential multi-line sentences with user defined splits
    if (trial.mask_type !== 3) {
      sentence_split = trial.sentence.split("\n").map((s) => s.trim());
      for (let i = 0; i < sentence_split.length; i++) {
        words[i] = sentence_split[i].split(" ");
        sentence_length += words[i].length;
        line_length.push(words[i].length);
      }
      // center multi-line text on original y position
      if (words.length > 1 && trial.y_align === "center") {
        trial.xy_position[1] -= words.length * 0.5 * trial.line_height;
      }
    } else {
      words = trial.sentence.split(" ");
      sentence_length = words.length;
    }

    const word = display_word(trial.mask_type);
    const mask = display_mask(
      trial.mask_type,
      trial.mask_on_word,
      mask_character,
      trial.mask_gap_character
    );

    function clear_canvas() {
      ctx.fillStyle = trial.canvas_colour;
      ctx.font = trial.canvas_colour;
      ctx.fillRect(canvas_rect[0], canvas_rect[1], canvas_rect[2], canvas_rect[3]);
    }

    function draw_mask() {
      ctx.font = mask_font;
      ctx.fillStyle = trial.mask_colour;
      if (trial.mask_type !== 3) {
        for (let i = 0; i < words.length; i++) {
          let mw = i === line_number ? word_number_line : -1;
          ctx.fillText(
            mask(words[i], mw),
            trial.xy_position[0],
            trial.xy_position[1] + i * trial.line_height + trial.mask_offset
          );
        }
      } else if (trial.mask_type === 3 && word_number === -1) {
        ctx.fillText(
          mask_character,
          trial.xy_position[0],
          trial.xy_position[1] + trial.mask_offset
        );
      }
    }

    function draw_word() {
      ctx.font = sentence_font;
      ctx.fillStyle = trial.font_colour;
      if (trial.mask_type !== 3) {
        // previous lines in multi-line
        for (let i = 0; i < line_number; i++) {
          ctx.fillText(
            word(words[i], words[i].length),
            trial.xy_position[0],
            trial.xy_position[1] + i * trial.line_height
          );
        }

        // current line
        ctx.fillText(
          word(words[line_number], word_number_line),
          trial.xy_position[0],
          trial.xy_position[1] + line_number * trial.line_height
        );
      } else if (trial.mask_type === 3 && word_number > -1) {
        ctx.fillText(words[word_number], trial.xy_position[0], trial.xy_position[1]);
      }

      // set line/word numbers
      if (word_number_line + 1 < line_length[line_number]) {
        word_number_line++;
      } else if (line_number < words.length - 1) {
        line_number++;
        word_number_line = 0;
      }
    }

    // store response
    let trial_data = []; // array of response objects
    let response = {
      rt_sentence: null,
      rt_word: null,
      word: null,
      word_number: null,
      sentence: null,
    };

    // initial draw
    draw_mask();
    draw_word();

    // function to end trial when it is time
    const end_trial = () => {
      if (trial.canvas_clear_border) {
        display_element.innerHTML = " ";
      } else {
        ctx.fillStyle = trial.canvas_colour;
        ctx.fillRect(canvas_rect[0], canvas_rect[1], canvas_rect[2], canvas_rect[3]);
      }

      // kill any remaining setTimeout handlers + kill keyboard listeners
      this.jsPsych.pluginAPI.clearAllTimeouts();
      this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    const after_response = (info: { rt: any }) => {
      // gather/store data
      response.rt_sentence = info.rt;
      rts.push(info.rt);

      if (word_number === 0) {
        response.rt_word = rts[rts.length - 1] - rts[rts.length - 2];
      } else {
        response.rt_word = rts[rts.length - 1] - rts[rts.length - 2] - trial.inter_word_interval;
      }

      if (response.rt_word > 0) {
        // valid rts
        response.word = words_concat[word_number];
        response.word_number = word_number + 1;
        if (trial.save_sentence) {
          response.sentence = sentence;
        }
        if (word_number < sentence_length - 1) {
          trial_data.push(Object.assign({}, response));
        }
        // keep drawing until words in sentence complete
        word_number++;
        this.jsPsych.pluginAPI.setTimeout(function () {
          if (word_number < sentence_length) {
            clear_canvas();
            draw_mask();
            draw_word();
          } else {
            end_trial();
          }
        }, trial.inter_word_interval);
      } else {
        rts.pop(); // invalid rt possible when trial.inter_word_interval is > 0
      }
    };

    let keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: after_response,
      valid_responses: trial.choices,
      rt_method: "performance",
      persist: true,
      allow_held_key: false,
    });
  }
}

export default SelfPacedReadingPlugin;
