import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "corsi-blocks",
  parameters: {
    /**
     * An array of block indexes that specify the order of the sequence to be displayed. For example,
     * [0, 1, 2, 3, 4] would display the first 5 blocks in the order they appear in the blocks parameter.
     */
    sequence: {
      type: ParameterType.INT,
      default: undefined,
      array: true,
    },
    /**
     * An array of objects that specify the x and y coordinates of each block. The coordinates represent the center
     * of the block. The coordinates are specified as percentages of the width and height of the display. For example,
     * {x: 50, y: 50} would place the block in the center of the display.
     *
     * The default value is an array of nine blocks that approximates the layout of the original Corsi blocks task.
     */
    blocks: {
      type: ParameterType.COMPLEX,
      array: true,
      default: [
        { y: 80, x: 45 },
        { y: 94, x: 80 },
        { y: 70, x: 20 },
        { y: 60, x: 70 },
        { y: 50, x: 35 },
        { y: 40, x: 6 },
        { y: 45, x: 94 },
        { y: 25, x: 60 },
        { y: 6, x: 47 },
      ],
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
    /**
     * The size of the blocks as a percentage of the overall display size.
     */
    block_size: {
      type: ParameterType.INT,
      default: 12,
    },
    /**
     * The width of the display, specified as a valid CSS measurement.
     */
    display_width: {
      type: ParameterType.STRING,
      default: "400px",
    },
    /**
     * The height of the display, specified as a valid CSS measurement.
     */
    display_height: {
      type: ParameterType.STRING,
      default: "400px",
    },
    /**
     * An optional text prompt that can be shown below the display area.
     */
    prompt: {
      type: ParameterType.STRING,
      default: null,
    },
    /**
     * The mode of the trial. If 'display', then the sequence is displayed and the trial ends after
     * the sequence is complete. If 'input', then the use must click on the blocks in the correct order.
     */
    mode: {
      type: ParameterType.STRING,
      default: "display",
      options: ["display", "input"],
    },
    /**
     * The duration, in milliseconds, between each block in the sequence.
     */
    sequence_gap_duration: {
      type: ParameterType.INT,
      default: 250,
    },
    /**
     * The duration, in milliseconds, that each block is displayed during the sequence.
     */
    sequence_block_duration: {
      type: ParameterType.INT,
      default: 1000,
    },
    /**
     * The duration, in milliseconds, to show the blocks before the sequence begins.
     */
    pre_stim_duration: {
      type: ParameterType.INT,
      default: 500,
    },
    /**
     * The duration, in milliseconds, to show the feedback response animation
     * during input mode.
     */
    response_animation_duration: {
      type: ParameterType.INT,
      default: 500,
    },
    /**
     * The color of unselected, unhighlighted blocks.
     */
    block_color: {
      type: ParameterType.STRING,
      default: "#555",
    },
    /**
     * The color of the highlighted block.
     */
    highlight_color: {
      type: ParameterType.STRING,
      default: "#ff0000",
    },
    /**
     * The color of correct feedback.
     */
    correct_color: {
      type: ParameterType.STRING,
      default: "#00ff00",
    },
    /**
     * The color of incorrect feedback.
     */
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
 * This plugin displays a sequence of blocks and then gets the
 * subject's response. The sequence can be displayed in either
 * 'display' mode or 'input' mode. In 'display' mode, the
 * sequence is displayed and the trial ends after the sequence
 * is complete. In 'input' mode, the subject must click on the
 * blocks in the correct order.
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
        width:${trial.display_width}; 
        height:${trial.display_height};
      }
      .jspsych-corsi-block { 
        background-color: ${trial.block_color}; 
        position: absolute; 
        width: ${trial.block_size}%; 
        height: ${trial.block_size}%;
        transform: translate(-50%, -50%);
      }
      #jspsych-corsi-prompt { 
        position: absolute; 
        text-align: center; 
        width: ${trial.display_width}; 
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
      html += `<div class="jspsych-corsi-block" data-id="${i}" style="top:${trial.blocks[i].y}%; left:${trial.blocks[i].x}%;"></div>`;
    }

    if (trial.prompt != null) {
      html += `<div id="jspsych-corsi-prompt"><p>${trial.prompt}</p></div>`;
    }
    html += "</div>";

    display_element.innerHTML = html;

    const start_time = performance.now();

    const trial_data = {
      sequence: trial.sequence,
      response: [],
      rt: [],
      blocks: trial.blocks,
      correct: null,
    };

    const end_trial = () => {
      display_element.innerHTML = "";
      this.jsPsych.finishTrial(trial_data);
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

    if (trial.mode == "display") {
      let sequence_location = 0;
      let display_phase = "pre-stim";

      const update_display = () => {
        if (display_phase == "pre-stim") {
          wait(update_display, trial.pre_stim_duration);
          display_phase = "sequence";
        } else if (display_phase == "sequence") {
          const block: HTMLElement = display_element.querySelector(
            `.jspsych-corsi-block[data-id="${trial.sequence[sequence_location]}"]`
          );
          if (sequence_location < trial.sequence.length) {
            block.style.backgroundColor = trial.highlight_color;
            wait(update_display, trial.sequence_block_duration);
            display_phase = "iti";
          }
          if (sequence_location == trial.sequence.length) {
            end_trial();
          }
        } else if (display_phase == "iti") {
          const block: HTMLElement = display_element.querySelector(
            `.jspsych-corsi-block[data-id="${trial.sequence[sequence_location]}"]`
          );
          block.style.backgroundColor = trial.block_color;
          sequence_location++;
          wait(update_display, trial.sequence_gap_duration);
          display_phase = "sequence";
        }
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
        const rt = Math.round(performance.now() - start_time);
        trial_data.response.push(parseInt(id));
        trial_data.rt.push(rt);
        const correct = parseInt(id) == trial.sequence[trial_data.response.length - 1];
        if (correct) {
          display_element
            .querySelector(`.jspsych-corsi-block[data-id="${id}"]`)
            .animate(correct_animation, animation_timing);
        } else {
          display_element
            .querySelector(`.jspsych-corsi-block[data-id="${id}"]`)
            .animate(incorrect_animation, animation_timing);
        }
        // Only end the trial when the response length matches the sequence length
        if (trial_data.response.length == trial.sequence.length) {
          trial_data.correct = JSON.stringify(trial_data.response) === JSON.stringify(trial.sequence);
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
