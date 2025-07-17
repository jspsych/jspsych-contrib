import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "spatial-nback",
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
      /** Row position of the stimulus (0-indexed). If null, no stimulus is shown. */
      stimulus_row: {
        type: ParameterType.INT,
        default: null,
      },
      /** Column position of the stimulus (0-indexed). If null, no stimulus is shown. */
      stimulus_col: {
        type: ParameterType.INT,
        default: null,
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
      isi_duration: {
        type: ParameterType.INT,
        default: 500,
      },
      /** Duration of feedback display (ms) */
      feedback_duration: {
        type: ParameterType.INT,
        default: 0,
      },
      /** Whether to show feedback "Incorrect! (231ms)" after response */
      show_feedback_text: {
        type: ParameterType.BOOL,
        default: true,
      },
      /** Whether to show feedback border around the grid */
      show_feedback_border: {
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

    // Validate grid dimensions
    if (trial.rows <= 1 && trial.cols <= 1) {
      throw new Error("Grid must have more than one cell. Both rows and cols cannot be 1 or less.");
    }
    
    // Additional validations
    if (trial.rows <= 0 || trial.cols <= 0) {
      throw new Error("Grid dimensions must be positive integers. Rows and cols must be greater than 0.");
    }
    
    // Only validate stimulus position if both row and col are not null
    if (trial.stimulus_row !== null && trial.stimulus_col !== null) {
      if (trial.stimulus_row >= trial.rows || trial.stimulus_col >= trial.cols) {
        throw new Error(`Stimulus position (${trial.stimulus_row}, ${trial.stimulus_col}) is outside grid bounds (${trial.rows}x${trial.cols}).`);
      }
    }

    let trial_start_time: number;
    let response_allowed = false;
    let response_given = false;
    let stimulus_hidden = false; // Track if stimulus has been hidden

    // Determine if stimulus should be shown
    const show_stimulus = trial.stimulus_row !== null && trial.stimulus_col !== null;
    
    // Use specified positions or null if not showing stimulus
    const stimulus_row = show_stimulus ? trial.stimulus_row : null;
    const stimulus_col = show_stimulus ? trial.stimulus_col : null;

    const createDisplay = (): void => {
      
      
      let html = `<div id="nback-container" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        padding: 20px;
        max-width: 90vw;
        margin: 0 auto;
      ">`;
      
      // Instructions at top
      html += `<div id="nback-instructions">${trial.instructions}</div>`;

      // Grid container - centered within content
      html += `<div id="nback-grid-container" style="
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 20px 0;
      ">`;
      
      // Calculate grid dimensions based on cell_size parameter
      const cell_size_px = trial.cell_size;
      const grid_width = trial.cols * cell_size_px;
      const grid_height = trial.rows * cell_size_px;
      
      // Check if grid fits in available space (more conservative sizing)
      const max_width = Math.min(window.innerWidth * 0.8, 600); // Cap at 600px for better UX
      const max_height = Math.min(window.innerHeight * 0.5, 400); // Cap at 400px for better UX
      
      let final_cell_size: number;
      if (grid_width <= max_width && grid_height <= max_height) {
        // Grid fits, use specified cell size
        final_cell_size = cell_size_px;
      } else {
        // Scale down to fit available space
        const scale_for_width = max_width / grid_width;
        const scale_for_height = max_height / grid_height;
        const scale = Math.min(scale_for_width, scale_for_height);
        final_cell_size = Math.floor(cell_size_px * scale);
      }

      html += `<div id="nback-grid" style="
        border: 3px solid #000;
        box-sizing: border-box;
        display: inline-block;
      ">`;
      
      for (let row = 0; row < trial.rows; row++) {
        html += '<div style="display: flex;">';
        for (let col = 0; col < trial.cols; col++) {
          html += `<div id="cell-${row}-${col}" style="
            width: ${final_cell_size}px;
            height: ${final_cell_size}px;
            border: 1px solid #ccc;
            box-sizing: border-box;
          "></div>`;
        }
        html += '</div>';
      }
      html += '</div></div>'; // Close grid and grid-container

      // Button and feedback section
      html += `<div id="nback-feedback-section" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
        margin-top: 20px;
      ">`;
      
      // Feedback text first (directly under grid) - uses dummy text with visibility hidden to prevent layout displacement
      html += `<div id="nback-feedback" style="visibility: hidden;">Correct! (999ms)</div>`;
      
      // Button second (under feedback text) - uses standard jsPsych button styling
      html += `<button id="nback-response-btn" class="jspsych-btn nback-response-btn" disabled>${trial.button_text}</button>`;
      
      html += '</div></div>'; // Close feedback section and main container
      
      display_element.innerHTML = html;

      // Add button event listener
      const button = document.getElementById('nback-response-btn') as HTMLButtonElement;
      button.addEventListener('click', handleResponse);
    };

    const startTrial = (): void => {
      // PHASE 1: STIMULUS DISPLAY
      // Show stimulus only if positions are defined (null positions = empty grid)
      if (show_stimulus) {
        const cell = document.getElementById(`cell-${stimulus_row}-${stimulus_col}`) as HTMLElement;
        cell.style.backgroundColor = trial.stimulus_color;
      }

      // TRIAL INITIALIZATION:
      // Enable response collection and record trial start time
      response_allowed = true;
      trial_start_time = performance.now();
      stimulus_hidden = false;
      
      // Enable response button for user interaction
      const responseButton = document.getElementById('nback-response-btn') as HTMLButtonElement;
      responseButton.disabled = false;

      // PHASE 1 TIMEOUT: Hide stimulus after stimulus_duration
      // This starts the ISI (Inter-Stimulus Interval) phase
      this.jsPsych.pluginAPI.setTimeout(() => {
        if (show_stimulus) {
          const cell = document.getElementById(`cell-${stimulus_row}-${stimulus_col}`) as HTMLElement;
          cell.style.backgroundColor = '';
        }
        // Signify end of stimulus phase
        stimulus_hidden = true;
        
        // PHASE 2: ISI (Inter-Stimulus Interval) 
        // After ISI duration, handle cases where no response was given
        this.jsPsych.pluginAPI.setTimeout(() => {
          handleNoResponse(); // Let handleNoResponse() do its own validation
        }, trial.isi_duration);
      }, trial.stimulus_duration);
    };

    const handleResponse = (): void => {
      // RESPONSE VALIDATION:
      // Only process if response is allowed and hasn't been given yet
      if (!response_allowed || response_given) return;

      // RESPONSE PROCESSING:
      // Disable further responses and record response time
      response_allowed = false;
      response_given = true;
      const response_time = performance.now() - trial_start_time;
      
      // CORRECTNESS LOGIC:
      // If stimulus positions are null (empty grid), responding is always incorrect
      // If stimulus is shown, correctness depends on is_target parameter
      const is_correct = show_stimulus ? trial.is_target : false;

      // TIMING CLEANUP:
      // Clear any pending timeouts since user responded
      // Now, remaining timeouts will be handled in showFeedback()
      this.jsPsych.pluginAPI.clearAllTimeouts();

      // PHASE 3: FEEDBACK
      // Show feedback with appropriate timing (made_response = true)
      showFeedback(is_correct, response_time, true);
    };

    const handleNoResponse = (): void => {
      // NO RESPONSE VALIDATION:
      // Only process if response was allowed and hasn't been given yet
      if (!response_allowed || response_given) return;

      // NO RESPONSE PROCESSING:
      // Mark that trial is complete without response
      response_allowed = false;
      response_given = true;
      
      // CORRECTNESS LOGIC:
      // If stimulus positions are null (empty grid), not responding is always correct
      // If stimulus is shown, correctness is opposite of is_target (correct to not respond to non-targets)
      const is_correct = show_stimulus ? !trial.is_target : true;

      // PHASE 3: FEEDBACK
      // Show feedback with appropriate timing (made_response = false)
      showFeedback(is_correct, null, false);
    };

    const showFeedback = (is_correct: boolean, response_time: number | null, made_response: boolean): void => {
      // TIMING CALCULATION:
      // Calculate how much time has elapsed since trial start to determine remaining time
      const elapsed_time = performance.now() - trial_start_time;
      
      // TOTAL TRIAL DURATION:
      // Each trial has 3 phases: stimulus display + ISI + feedback
      // Total time = stimulus_duration + isi_duration + feedback_duration
      const total_trial_time = trial.stimulus_duration + trial.isi_duration + trial.feedback_duration;
      
      // REMAINING TIME:
      // Calculate how much time is left until trial should end
      // This ensures consistent trial timing regardless of when response occurs
      const remaining_time = Math.max(0, total_trial_time - elapsed_time);

      // BUTTON DISABLING:
      // Always disable button after any response to prevent further clicks
      // OR during feedback duration to show user can't respond during feedback
      if (made_response || trial.feedback_duration > 0) {
        const button = document.getElementById('nback-response-btn') as HTMLButtonElement;
        if (button) {
          button.disabled = true;
        }
      }

      // NO FEEDBACK CASE:
      // If neither feedback text nor border is enabled, skip feedback display
      if (!trial.show_feedback_text && !trial.show_feedback_border) {
        
        // STIMULUS HIDING:
        // Handle remaining stimulus duration if still showing (user responded within stimulus_duration)
        if (show_stimulus && !stimulus_hidden) {
          const stimulus_end_time = trial.stimulus_duration - elapsed_time;
          if (stimulus_end_time > 0) {
            this.jsPsych.pluginAPI.setTimeout(() => {
              const cell = document.getElementById(`cell-${stimulus_row}-${stimulus_col}`) as HTMLElement;
              cell.style.backgroundColor = '';
            }, stimulus_end_time);
          }
        }
        
        // TRIAL ENDING:
        // Always wait for the full trial duration (rest of ISI + feedback duration)
        this.jsPsych.pluginAPI.setTimeout(() => {
          endTrial(is_correct, response_time, made_response);
        }, remaining_time);
        return;
      }

      // FEEDBACK FLASH PREVENTION:
      // If feedback_duration is 0 and no response was made, don't show feedback
      // This prevents a brief flash of feedback when feedback_duration is 0
      if (trial.feedback_duration === 0 && !made_response) {
        // STIMULUS HIDING:
        // Hide stimulus at the right time if still showing
        if (show_stimulus && !stimulus_hidden) {
          const stimulus_end_time = trial.stimulus_duration - elapsed_time;
          if (stimulus_end_time > 0) {
            this.jsPsych.pluginAPI.setTimeout(() => {
              const cell = document.getElementById(`cell-${stimulus_row}-${stimulus_col}`) as HTMLElement;
              cell.style.backgroundColor = '';
            }, stimulus_end_time);
          }
        }
        
        // TRIAL ENDING:
        // End trial after remaining time without showing feedback
        this.jsPsych.pluginAPI.setTimeout(() => {
          endTrial(is_correct, response_time, made_response);
        }, remaining_time);
        return;
      }

      // FEEDBACK DISPLAY:
      // Show feedback when feedback_duration > 0 OR when response was made
      
      // Initialize feedback elements
      const grid = document.getElementById('nback-grid') as HTMLElement;
      const feedback_div = document.getElementById('nback-feedback') as HTMLElement;
      const stimulus_cell = show_stimulus ? document.getElementById(`cell-${stimulus_row}-${stimulus_col}`) as HTMLElement : null;

      // BORDER FEEDBACK:
      // Show colored border around grid immediately
      if (trial.show_feedback_border) {
        grid.style.border = `3px solid ${is_correct ? trial.correct_color : trial.incorrect_color}`;
      }

      // TEXT FEEDBACK:
      // Show feedback text with response time if available
      if (trial.show_feedback_text) {
        let feedback_text = is_correct ? 'Correct!' : 'Incorrect!';
        if (response_time !== null) {
          feedback_text += ` (${Math.round(response_time)}ms)`;
        }
        feedback_div.textContent = feedback_text;
        feedback_div.style.color = is_correct ? trial.correct_color : trial.incorrect_color;
        feedback_div.style.visibility = 'visible';
      }

      // STIMULUS HIDING:
      // Hide stimulus at the right time if still showing
      if (show_stimulus && !stimulus_hidden) {
        const stimulus_end_time = trial.stimulus_duration - elapsed_time;
        if (stimulus_end_time > 0) {
          this.jsPsych.pluginAPI.setTimeout(() => {
            if (stimulus_cell) {
              stimulus_cell.style.backgroundColor = 'white';
            }
          }, stimulus_end_time);
        }
      }

      // TRIAL ENDING:
      // End trial after remaining time, ensuring consistent total trial duration
      this.jsPsych.pluginAPI.setTimeout(() => {
        endTrial(is_correct, response_time, made_response);
      }, remaining_time);
    };

    const endTrial = (is_correct: boolean, response_time: number | null, made_response: boolean): void => {
      // CLEANUP: Clear any remaining timeouts
      this.jsPsych.pluginAPI.clearAllTimeouts();

      // Prepare trial data
      const trial_data = {
        stimulus_row: stimulus_row,
        stimulus_col: stimulus_col,
        is_target: trial.is_target,
        response: made_response,
        response_time: response_time,
        correct: is_correct
      };

      // End trial
      this.jsPsych.finishTrial(trial_data);
    };

    // Initialize the trial
    createDisplay();
    startTrial();
  }
}

export default SpatialNbackPlugin;