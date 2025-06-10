import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "@jspsych-contrib/plugin-spatial-nback",
  version: version,
  parameters: {
      /** Number of rows in the spatial grid */
      rows: {
        type: ParameterType.INT,
        default: 3,
      },
      /** Number of columns in the spatial grid */
      cols: {
        type: ParameterType.INT,
        default: 3,
      },
      /** Size of each cell in pixels, this will affect size of whole grid also */
      cell_size: {
        type: ParameterType.INT,
        default: 125,
      },
      /** Row position of the stimulus (0-indexed) */
      stimulus_row: {
        type: ParameterType.INT,
        default: 0,
      },
      /** Column position of the stimulus (0-indexed) */
      stimulus_col: {
        type: ParameterType.INT,
        default: 0,
      },
      /** Whether this trial is a target trial */
      is_target: {
        type: ParameterType.BOOL,
        default: false,
      },
      /** Duration the stimulus is displayed (ms) */
      stimulus_duration: {
        type: ParameterType.INT,
        default: 750,
      },
      /** Inter-stimulus interval (ms) */
      // I recommend using feedback_duration as ISI if you have any type of feedback showing
      isi_duration: {
        type: ParameterType.INT,
        default: 1000,
      },
      /** Duration of feedback display (ms) */
      feedback_duration: {
        type: ParameterType.INT,
        default: 500,
      },
      /** Whether to show feedback "Incorrect! (231ms)" after response */
      show_feedback_time: {
        type: ParameterType.BOOL,
        default: true,
      },
      /** Whether to show feedback border around the grid */
      show_feedback_border: {
        type: ParameterType.BOOL,
        default: true,
      },
      /** Whether to show feedback when there is no response */
      showFeedbackNoResponse: {
        type: ParameterType.BOOL,
        default: true,
      },
      /** Whether to wait for feedback duration before ending trial when no response */
      /** if using feedback_duration as interstimulus response, keep this true */
      feedbackWaitNoResponse: {
        type: ParameterType.BOOL,
        default: true,
      },
      /** Text for the response button */
      button_text: {
        type: ParameterType.STRING,
        default: "MATCH",
      },
      /** Color of the stimulus square */
      stimulus_color: {
        type: ParameterType.STRING,
        default: "#0066cc",
      },
      /** Color of correct feedback border */
      correct_color: {
        type: ParameterType.STRING,
        default: "#00cc00",
      },
      /** Color of incorrect feedback border */
      incorrect_color: {
        type: ParameterType.STRING,
        default: "#cc0000",
      },
      /** Instructions to display above the grid */
      instructions: {
        type: ParameterType.STRING,
        default: "Click MATCH",
      },
    },
    data: {
      /** Row position of the stimulus */
      stimulus_row: {
        type: ParameterType.INT,
      },
      /** Column position of the stimulus */
      stimulus_col: {
        type: ParameterType.INT,
      },
      /** Whether this trial was a target */
      is_target: {
        type: ParameterType.BOOL,
      },
      /** Whether participant responded */
      response: {
        type: ParameterType.BOOL,
      },
      /** Response time in milliseconds */
      response_time: {
        type: ParameterType.INT,
      },
      /** Whether the response was correct */
      correct: {
        type: ParameterType.BOOL,
      },
    },
  citations: '__CITATIONS__',
};

type Info = typeof info;

/**
 * **plugin-spatial-nback**
 *
 * Single trial spatial grid stimulus with response collection
 *
 * @author A. Hunter Farhat
 * @version 1.0.0
 * @see {@link https://github.com/farhat60/jspsych-contrib/packages/plugin-spatial-nback}
 */
class SpatialNbackPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    let trial_start_time: number;
    let response_allowed = false;
    let response_given = false;
    let stimulus_timeout: number;
    let isi_timeout: number;
    let stimulus_hidden = false; // Track if stimulus has been hidden

    // Generate random position if not specified
    const stimulus_row = trial.stimulus_row ?? Math.floor(Math.random() * trial.rows);
    const stimulus_col = trial.stimulus_col ?? Math.floor(Math.random() * trial.cols);

    const createDisplay = (): void => {
      let html = `
        <div id="nback-container" style="
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-family: Arial, sans-serif;
          box-sizing: border-box;
          padding: 20px;
        ">`;
      
      // Instructions
      html += `<div id="nback-instructions" style="
        position: absolute;
        top: 15vh;
        left: 50%;
        transform: translateX(-50%);
        width: 80%;
        max-width: 520px;
        text-align: center;
        font-size: clamp(14px, 2vmin, 18px);
        z-index: 10;
      ">${trial.instructions}</div>`;

      // Calculate grid size to fit screen
      const grid_size = Math.min(50, 80 / Math.max(trial.rows, trial.cols));
      const cell_size = `${grid_size / Math.max(trial.rows, trial.cols)}vmin`;

      // Grid - centered and responsive
      html += `<div id="nback-grid" style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border: 2px solid #000;
        box-sizing: border-box;
        display: inline-block;
        z-index: 5;
      ">`;
      
      for (let row = 0; row < trial.rows; row++) {
        html += '<div style="display: flex;">';
        for (let col = 0; col < trial.cols; col++) {
          html += `<div id="cell-${row}-${col}" style="
            width: ${cell_size};
            height: ${cell_size};
            border: 1px solid #ccc;
            background-color: white;
            box-sizing: border-box;
            min-width: ${Math.max(40, trial.cell_size * 0.5)}px;
            min-height: ${Math.max(40, trial.cell_size * 0.5)}px;
          "></div>`;
        }
        html += '</div>';
      }
      html += '</div>';

      // Response button
      html += `<div id="nback-button-container" style="
        position: absolute;
        bottom: 15vh;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10;
      ">`;
      html += `<button id="nback-response-btn" style="
        font-size: clamp(18px, 3vmin, 26px);
        padding: clamp(18px, 2.5vmin, 30px) clamp(35px, 5vmin, 60px);
        background-color: #2196F3;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        transition: all 0.2s;
      " disabled>${trial.button_text}</button>`;
      html += '</div>';
      
      // Feedback area
      html += `<div id="nback-feedback" style="
        position: absolute;
        bottom: 8vh;
        left: 50%;
        transform: translateX(-50%);
        height: 40px;
        font-size: clamp(14px, 2vmin, 20px);
        font-weight: bold;
        text-align: center;
        z-index: 10;
        width: 80%;
      "></div>`;
      
      html += '</div>';
      
      display_element.innerHTML = html;

      // Add button hover effects and event listener
      const button = document.getElementById('nback-response-btn') as HTMLButtonElement;
      button.addEventListener('mouseenter', () => {
        if (!button.disabled) {
          button.style.backgroundColor = '#1976D2';
          button.style.transform = 'translateY(-2px)';
        }
      });
      button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = '#2196F3';
        button.style.transform = 'translateY(0)';
      });
      button.addEventListener('click', handleResponse);
    };

    const startTrial = (): void => {
      // Show stimulus
      const cell = document.getElementById(`cell-${stimulus_row}-${stimulus_col}`) as HTMLElement;
      cell.style.backgroundColor = trial.stimulus_color;

      // Enable response
      response_allowed = true;
      trial_start_time = performance.now();
      stimulus_hidden = false;
      
      const responseButton = document.getElementById('nback-response-btn') as HTMLButtonElement;
      responseButton.disabled = false;

      // Set timeout to hide stimulus
      stimulus_timeout = window.setTimeout(() => {
        cell.style.backgroundColor = 'white';
        stimulus_hidden = true;
        
        // Set timeout for ISI
        isi_timeout = window.setTimeout(() => {
          if (response_allowed && !response_given) {
            handleNoResponse();
          }
        }, trial.isi_duration);
      }, trial.stimulus_duration);
    };

    const handleResponse = (): void => {
      if (!response_allowed || response_given) return;

      response_allowed = false;
      response_given = true;
      const response_time = performance.now() - trial_start_time;
      const is_correct = trial.is_target;

      // Clear timeouts
      clearTimeout(stimulus_timeout);
      clearTimeout(isi_timeout);

      // Show feedback with appropriate timing
      showFeedback(is_correct, response_time, true);
    };

    const handleNoResponse = (): void => {
      if (!response_allowed || response_given) return;

      response_allowed = false;
      response_given = true;
      const is_correct = !trial.is_target;

      showFeedback(is_correct, null, false);
    };

    const showFeedback = (is_correct: boolean, response_time: number | null, made_response: boolean): void => {
      // If no feedback is shown, handle timing appropriately
      if (!trial.show_feedback_time && !trial.show_feedback_border) {
        if (made_response && !stimulus_hidden) {
          // Response during stimulus - wait for stimulus + feedback duration, then ISI
          const elapsed_time = performance.now() - trial_start_time;
          const remaining_stimulus_time = Math.max(0, trial.stimulus_duration - elapsed_time);
          const feedback_wait_time = remaining_stimulus_time + trial.feedback_duration;
          
          setTimeout(() => {
            // Hide stimulus after the combined time
            const cell = document.getElementById(`cell-${stimulus_row}-${stimulus_col}`) as HTMLElement;
            cell.style.backgroundColor = 'white';
            
            // Wait for ISI duration before ending trial
            setTimeout(() => {
              endTrial(is_correct, response_time, made_response);
            }, trial.isi_duration);
          }, feedback_wait_time);
        } else {
          // Response during ISI or no response - end immediately
          endTrial(is_correct, response_time, made_response);
        }
        return;
      }

      // Disable the button during feedback
      const button = document.getElementById('nback-response-btn') as HTMLButtonElement;
      button.disabled = true;
      button.style.opacity = '0.6';

      // Calculate total feedback duration based on when response occurred
      let total_feedback_duration: number;
      
      if (made_response && !stimulus_hidden) {
        // Response during stimulus - show feedback for stimulus + feedback duration
        const elapsed_time = performance.now() - trial_start_time;
        const remaining_stimulus_time = Math.max(0, trial.stimulus_duration - elapsed_time);
        total_feedback_duration = remaining_stimulus_time + trial.feedback_duration;
      } else if (made_response && stimulus_hidden) {
        // Response during ISI - show feedback for remaining ISI + feedback duration
        const elapsed_time = performance.now() - trial_start_time;
        const isi_start_time = trial.stimulus_duration;
        const elapsed_isi_time = elapsed_time - isi_start_time;
        const remaining_isi_time = Math.max(0, trial.isi_duration - elapsed_isi_time);
        total_feedback_duration = remaining_isi_time + trial.feedback_duration;
      } else {
        // No response - use standard feedback duration if configured
        if (trial.feedbackWaitNoResponse) {
          total_feedback_duration = trial.feedback_duration;
        } else {
          endTrial(is_correct, response_time, made_response);
          return;
        }
      }

      // If there is no response and feedback must not be shown for no response
      if (response_time === null && !trial.showFeedbackNoResponse) {
        if (trial.feedbackWaitNoResponse) {
          setTimeout(() => {
            endTrial(is_correct, response_time, made_response);
          }, total_feedback_duration);
        } else {
          endTrial(is_correct, response_time, made_response);
        }
        return;
      }
      
      // Initialize feedback elements
      const grid = document.getElementById('nback-grid') as HTMLElement;
      const feedback_div = document.getElementById('nback-feedback') as HTMLElement;
      const stimulus_cell = document.getElementById(`cell-${stimulus_row}-${stimulus_col}`) as HTMLElement;

      // Show border feedback immediately on the grid
      if (trial.show_feedback_border) {
        grid.style.border = `6px solid ${is_correct ? trial.correct_color : trial.incorrect_color}`;
      }

      // Show text feedback
      if (trial.show_feedback_time) {
        let feedback_text = is_correct ? 'Correct!' : 'Incorrect!';
        if (response_time !== null) {
          feedback_text += ` (${Math.round(response_time)}ms)`;
        }
        feedback_div.textContent = feedback_text;
        feedback_div.style.color = is_correct ? trial.correct_color : trial.incorrect_color;
      }

      // Handle timing based on when response occurred
      if (made_response && !stimulus_hidden) {
        // Response during stimulus - keep border and stimulus until stimulus duration ends
        const elapsed_time = performance.now() - trial_start_time;
        const remaining_stimulus_time = Math.max(0, trial.stimulus_duration - elapsed_time);
        
        // Wait for remaining stimulus time, then hide stimulus but keep border
        setTimeout(() => {
          // Hide stimulus but keep the feedback border
          stimulus_cell.style.backgroundColor = 'white';
          
          // Wait for feedback duration + ISI duration before ending trial
          setTimeout(() => {
            endTrial(is_correct, response_time, made_response);
          }, trial.feedback_duration + trial.isi_duration);
        }, remaining_stimulus_time);
        
      } else if (made_response && stimulus_hidden) {
        // Response during ISI - stimulus already hidden, just wait for remaining time
        const elapsed_time = performance.now() - trial_start_time;
        const isi_start_time = trial.stimulus_duration;
        const elapsed_isi_time = elapsed_time - isi_start_time;
        const remaining_isi_time = Math.max(0, trial.isi_duration - elapsed_isi_time);
        
        setTimeout(() => {
          endTrial(is_correct, response_time, made_response);
        }, remaining_isi_time + trial.feedback_duration);
        
      } else {
        // No response - just wait for feedback duration
        setTimeout(() => {
          endTrial(is_correct, response_time, made_response);
        }, total_feedback_duration);
      }
    };

    const endTrial = (is_correct: boolean, response_time: number | null, made_response: boolean): void => {
      // Prepare trial data
      const trial_data = {
        stimulus_row: stimulus_row,
        stimulus_col: stimulus_col,
        is_target: trial.is_target,
        response: made_response,
        response_time: response_time,
        correct: is_correct
      };

      // Clear display
      display_element.innerHTML = '';

      // End trial
      this.jsPsych.finishTrial(trial_data);
    };

    // Initialize the trial
    createDisplay();
    startTrial();
  }
}

export default SpatialNbackPlugin;