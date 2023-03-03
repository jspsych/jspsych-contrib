import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "corsi-blocks",
  parameters: {
    sequence: {
      type: ParameterType.INT,
      default: undefined,
      array: true,
    },
    blocks: {
      type: ParameterType.COMPLEX,
      array: true,
      default: undefined,
      nested: {
        x: {
          type: ParameterType.INT,
          default: undefined,
        },
        y: {
          type: ParameterType.INT,
          default: undefined,
        },
      },
    },
    block_size: {
      type: ParameterType.INT,
      default: 35,
    },
    arena_width: {
      type: ParameterType.INT,
      default: 400,
    },
    arena_height: {
      type: ParameterType.INT,
      default: 400,
    },
    prompt: {
      type: ParameterType.STRING,
      default: null,
    },
    mode: {
      type: ParameterType.STRING,
      default: "display",
      options: ["display", "input"],
    },
    sequence_iti: {
      type: ParameterType.INT,
      default: 250,
    },
    sequence_duration: {
      type: ParameterType.INT,
      default: 1000,
    },
    pre_stim_duration: {
      type: ParameterType.INT,
      default: 500,
    },
    response_animation_duration: {
      type: ParameterType.INT,
      default: 500,
    },
    block_color: {
      type: ParameterType.STRING,
      default: "#555",
    },
    highlight_color: {
      type: ParameterType.STRING,
      default: "#ff0000",
    },
    correct_color: {
      type: ParameterType.STRING,
      default: "#00ff00",
    },
    incorrect_color: {
      type: ParameterType.STRING,
      default: "#ff0000",
    },
  },
};

type Info = typeof info;

/**
 * **corsi-blocks**
 *
 * Plugin to run the Corsi blocks task.
 *
 * @author Josh de Leeuw
 * @see {@link https://DOCUMENTATION_URL DOCUMENTATION LINK TEXT}
 */
class CorsiBlocksPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    let css = `<style id="jspsych-corsi-css">
      #jspsych-corsi-stimulus { 
        position: relative; 
        width:${trial.arena_width}px; 
        height:${trial.arena_height}px;
      }
      .jspsych-corsi-block { 
        background-color: ${trial.block_color}; 
        position: absolute; 
        width: ${trial.block_size}px; 
        height: ${trial.block_size}px;
      }
      #jspsych-corsi-prompt { 
        position: absolute; 
        text-align: center; 
        width: trial.arena_width px; 
        top: 100%; 
      }
      #jspsych-corsi-prompt p { 
        font-size: 18px; 
      }
      ${trial.mode == "input" ? ".jspsych-corsi-block { cursor: pointer; }" : ""}
    </style>`;

    let html = css;
    html += '<div id="jspsych-corsi-stimulus">';

    for (let i = 0; i < trial.blocks.length; i++) {
      html += `<div class="jspsych-corsi-block" data-id="${i}" style="top:calc(${
        trial.blocks[i].y
      }% - ${trial.block_size / 2}px); left:calc(${trial.blocks[i].x}% - ${
        trial.block_size / 2
      }px);"></div>`;
    }

    if (trial.prompt != null) {
      html += `<div id="jspsych-corsi-prompt"><p>${trial.prompt}</p></div>`;
    }
    html += "</div>";

    display_element.innerHTML = html;

    const trial_data = {
      sequence: trial.sequence,
      response: [],
      blocks: trial.blocks,
      correct: null,
    };

    const end_trial = () => {
      display_element.innerHTML = "";
      this.jsPsych.finishTrial(trial_data);
    };

    if (trial.mode == "display") {
      let sequence_location = 0;
      let display_phase = "pre-stim";

      const update_display = () => {
        if (display_phase == "pre-stim") {
          wait(update_display, trial.pre_stim_duration);
          display_phase = "sequence";
        } else if (display_phase == "sequence") {
          if (sequence_location < trial.sequence.length) {
            (
              document.querySelector(
                `.jspsych-corsi-block[data-id="${trial.sequence[sequence_location]}"]`
              ) as HTMLElement
            ).style.backgroundColor = trial.highlight_color;
            wait(update_display, trial.sequence_duration);
            display_phase = "iti";
          }
          if (sequence_location == trial.sequence.length) {
            end_trial();
          }
        } else if (display_phase == "iti") {
          (
            document.querySelector(
              `.jspsych-corsi-block[data-id="${trial.sequence[sequence_location]}"]`
            ) as HTMLElement
          ).style.backgroundColor = trial.block_color;
          sequence_location++;
          wait(update_display, trial.sequence_iti);
          display_phase = "sequence";
        }
      };

      const wait = function (fn, t) {
        const start = performance.now();

        const _wait_help = (fn, t, s) => {
          const duration = performance.now() - s;
          if (duration >= t) {
            fn();
          } else {
            window.requestAnimationFrame(() => _wait_help(fn, t, start));
          }
        };
        window.requestAnimationFrame(() => _wait_help(fn, t, start));
      };

      window.requestAnimationFrame(update_display);
    }

    if (trial.mode == "input") {
      const correct_animation = [
        { backgroundColor: trial.block_color },
        { backgroundColor: trial.correct_color, offset: 0.2 },
        { backgroundColor: trial.block_color },
      ];

      const incorrect_animation = [
        { backgroundColor: trial.block_color },
        { backgroundColor: trial.incorrect_color, offset: 0.2 },
        { backgroundColor: trial.block_color },
      ];

      const animation_timing = {
        duration: trial.response_animation_duration,
        iterations: 1,
      };

      const register_click = (id: string) => {
        if (trial_data.correct !== null) {
          return; // extra click during timeout, do nothing
        }
        trial_data.response.push(parseInt(id));
        const correct = parseInt(id) == trial.sequence[trial_data.response.length - 1];
        if (correct) {
          document
            .querySelector(`.jspsych-corsi-block[data-id="${id}"]`)
            .animate(correct_animation, animation_timing);
          if (trial_data.response.length == trial.sequence.length) {
            trial_data.correct = true;
            setTimeout(end_trial, trial.response_animation_duration); // allows animation to finish
          }
        } else {
          document
            .querySelector(`.jspsych-corsi-block[data-id="${id}"]`)
            .animate(incorrect_animation, animation_timing);
          trial_data.correct = false;
          setTimeout(end_trial, trial.response_animation_duration); // allows animation to finish
        }
      };

      var blocks = display_element.querySelectorAll(".jspsych-corsi-block");
      for (var i = 0; i < blocks.length; i++) {
        blocks[i].addEventListener("click", (e) => {
          register_click((e.target as HTMLElement).getAttribute("data-id"));
        });
      }
    }
  }
}

export default CorsiBlocksPlugin;
