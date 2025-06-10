var jsPsychPluginSpatialNbackTask = (function (jspsych) {
  "use strict";

  const info = {
    name: "plugin-spatial-nback-task",
    version: "1.0.0",
    parameters: {
      /** Number of rows in the grid */
      rows: {
        type: jspsych.ParameterType.INT,
        default: 3,
      },
      /** Number of columns in the grid */
      cols: {
        type: jspsych.ParameterType.INT,
        default: 3,
      },
      /** Size of each grid cell in pixels */
      cell_size: {
        type: jspsych.ParameterType.INT,
        default: 100,
      },
      /** Position of the active cell (0-indexed) */
      active_position: {
        type: jspsych.ParameterType.INT,
        default: null,
      },
      /** N-back level (how many trials back to compare) */
      n_back_level: {
        type: jspsych.ParameterType.INT,
        default: 1,
      },
      /** Duration to show the stimulus in milliseconds */
      stimulus_duration: {
        type: jspsych.ParameterType.INT,
        default: 1500,
      },
      /** Label for the response button */
      button_label: {
        type: jspsych.ParameterType.STRING,
        default: "RESPOND",
      },
      /** Whether this is a target trial (n-back match) */
      is_target: {
        type: jspsych.ParameterType.BOOL,
        default: false,
      },
      /** Show visual feedback on response */
      show_feedback: {
        type: jspsych.ParameterType.BOOL,
        default: true,
      },
      /** Show trial progress information */
      show_progress: {
        type: jspsych.ParameterType.BOOL,
        default: false,
      },
      /** Current trial number for progress display */
      trial_number: {
        type: jspsych.ParameterType.INT,
        default: null,
      },
      /** Total number of trials for progress display */
      total_trials: {
        type: jspsych.ParameterType.INT,
        default: null,
      },
      /** Whether this is a practice trial */
      is_practice: {
        type: jspsych.ParameterType.BOOL,
        default: false,
      },
      /** Color of the active cell */
      active_color: {
        type: jspsych.ParameterType.STRING,
        default: "#ff0000",
      },
      /** Color of inactive cells */
      inactive_color: {
        type: jspsych.ParameterType.STRING,
        default: "#000000",
      },
      /** Border color for correct feedback */
      correct_color: {
        type: jspsych.ParameterType.STRING,
        default: "#28a745",
      },
      /** Border color for incorrect feedback */
      incorrect_color: {
        type: jspsych.ParameterType.STRING,
        default: "#dc3545",
      },
      /** Whether responses end the trial early */
      response_ends_trial: {
        type: jspsych.ParameterType.BOOL,
        default: false,
      },
    },
    data: {
      /** The position of the active cell */
      position: {
        type: jspsych.ParameterType.INT,
      },
      /** Whether participant responded */
      responded: {
        type: jspsych.ParameterType.BOOL,
      },
      /** Whether the response was correct */
      correct: {
        type: jspsych.ParameterType.BOOL,
      },
      /** Response time */
      rt: {
        type: jspsych.ParameterType.INT,
      },
      /** Whether this was a target trial */
      is_target: {
        type: jspsych.ParameterType.BOOL,
      },
      /** Trial number */
      trial_number: {
        type: jspsych.ParameterType.INT,
      },
      /** N-back level */
      n_back_level: {
        type: jspsych.ParameterType.INT,
      },
      /** Whether this was a practice trial */
      is_practice: {
        type: jspsych.ParameterType.BOOL,
      },
      /** Hit (target trial with response) */
      hit: {
        type: jspsych.ParameterType.BOOL,
      },
      /** Miss (target trial without response) */
      miss: {
        type: jspsych.ParameterType.BOOL,
      },
      /** False alarm (non-target trial with response) */
      false_alarm: {
        type: jspsych.ParameterType.BOOL,
      },
      /** Correct rejection (non-target trial without response) */
      correct_rejection: {
        type: jspsych.ParameterType.BOOL,
      },
    },
  };

  /**
   * **plugin-spatial-nback-task**
   *
   * Creates a spatial n-back task with a grid display and button response.
   * Participants must indicate when the current stimulus position matches
   * the position from n trials back.
   *
   * @author A. Hunter Farhat
   */
  class SpatialNbackTaskPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      // Create the grid HTML
      const grid_html = this.createGrid(trial);

      // Display the grid
      display_element.innerHTML = grid_html;

      // Track response
      let response = {
        button: null,
        rt: null,
      };

      // Start time
      const start_time = performance.now();

      // Response function
      const after_response = (choice) => {
        // Record response time
        const end_time = performance.now();
        const rt = Math.round(end_time - start_time);

        // Only record first response
        if (response.button === null) {
          response = {
            button: choice,
            rt: rt,
          };

          // Show feedback if enabled
          if (trial.show_feedback) {
            this.showFeedback(display_element, trial.is_target, true);
          }

          // End trial if response_ends_trial is true
          if (trial.response_ends_trial) {
            end_trial();
          }
        }
      };

      // Set up button click listener
      const button = display_element.querySelector(".spatial-nback-button");
      if (button) {
        button.addEventListener("click", () => {
          after_response(0); // Button choice index
        });
      }

      // End trial function
      const end_trial = () => {
        // Calculate results
        const responded = response.button !== null;
        const correct = (trial.is_target && responded) || (!trial.is_target && !responded);

        // Gather trial data
        const trial_data = {
          position: trial.active_position,
          responded: responded,
          correct: correct,
          rt: response.rt,
          is_target: trial.is_target,
          trial_number: trial.trial_number,
          n_back_level: trial.n_back_level,
          is_practice: trial.is_practice,
          hit: trial.is_target && responded,
          miss: trial.is_target && !responded,
          false_alarm: !trial.is_target && responded,
          correct_rejection: !trial.is_target && !responded,
        };

        // Clear display
        display_element.innerHTML = "";

        // End trial
        this.jsPsych.finishTrial(trial_data);
      };

      // Set trial duration
      this.jsPsych.pluginAPI.setTimeout(end_trial, trial.stimulus_duration);
    }

    createGrid(trial) {
      let html = `
        <style>
          .spatial-nback-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            padding: 20px 0;
            position: relative;
          }
          .spatial-nback-grid {
            display: grid;
            grid-template-rows: repeat(${trial.rows}, ${trial.cell_size}px);
            grid-template-columns: repeat(${trial.cols}, ${trial.cell_size}px);
            gap: 5px;
            margin: 20px;
            transition: all 0.2s ease-in-out;
            position: relative;
          }
          .spatial-nback-cell {
            border: 2px solid #333;
            background-color: ${trial.inactive_color};
          }
          .spatial-nback-cell.active {
            background-color: ${trial.active_color};
          }
          .spatial-nback-button {
            margin: 20px auto;
            padding: 20px 40px;
            font-size: 20px;
            background-color: #007bff;
            border: 3px solid #0056b3;
            border-radius: 12px;
            color: white;
            cursor: pointer;
            display: block;
            width: 200px;
            transition: all 0.15s ease-in-out;
          }
          .spatial-nback-button:hover {
            background-color: #0056b3;
            transform: translateY(-2px);
          }
          .spatial-nback-button:active {
            background-color: #004085;
            transform: translateY(0px) scale(0.98);
          }
          .spatial-nback-progress {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 16px;
            text-align: center;
          }
          .feedback-correct::before {
            content: "";
            position: absolute;
            top: -10px;
            left: -10px;
            right: -10px;
            bottom: -10px;
            border: 5px solid ${trial.correct_color};
            box-shadow: 0 0 20px ${trial.correct_color}80;
            border-radius: 8px;
            pointer-events: none;
            z-index: -1;
          }
          .feedback-incorrect::before {
            content: "";
            position: absolute;
            top: -10px;
            left: -10px;
            right: -10px;
            bottom: -10px;
            border: 5px solid ${trial.incorrect_color};
            box-shadow: 0 0 20px ${trial.incorrect_color}80;
            border-radius: 8px;
            pointer-events: none;
            z-index: -1;
          }
        </style>
      `;

      html += '<div class="spatial-nback-container">';
      html += '<div class="spatial-nback-grid" id="spatial-grid">';

      // Create grid cells
      const totalCells = trial.rows * trial.cols;
      for (let i = 0; i < totalCells; i++) {
        const isActive = trial.active_position === i ? "active" : "";
        html += `<div class="spatial-nback-cell ${isActive}"></div>`;
      }

      html += "</div>";

      // Add response button
      html += `<button class="spatial-nback-button">${trial.button_label}</button>`;

      // Add progress information if enabled
      if (trial.show_progress && trial.trial_number !== null && trial.total_trials !== null) {
        const phase = trial.is_practice ? "Practice" : "Main Task";
        html += `<div class="spatial-nback-progress">${phase} - Trial ${trial.trial_number} of ${trial.total_trials}</div>`;
      }

      html += "</div>";

      return html;
    }

    showFeedback(display_element, isTarget, responded) {
      const grid = display_element.querySelector("#spatial-grid");
      if (grid) {
        const isCorrect = (isTarget && responded) || (!isTarget && !responded);

        if (isCorrect) {
          grid.classList.add("feedback-correct");
        } else {
          grid.classList.add("feedback-incorrect");
        }

        // Remove feedback after 300ms
        setTimeout(() => {
          grid.classList.remove("feedback-correct", "feedback-incorrect");
        }, 300);
      }
    }
  }

  SpatialNbackTaskPlugin.info = info;

  return SpatialNbackTaskPlugin;
})(jsPsychModule);
