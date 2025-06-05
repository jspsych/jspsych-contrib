var jsPsychPluginSpatialNbackTask = (function (jspsych) {
  "use strict";

  const info = {
    name: "plugin-spatial-nback-task",
    version: "1.0.0",
    parameters: {
      /** Number of rows in the spatial grid */
      rows: {
        type: jspsych.ParameterType.INT,
        default: 3,
      },
      /** Number of columns in the spatial grid */
      cols: {
        type: jspsych.ParameterType.INT,
        default: 3,
      },
      /** Size of each cell in pixels */
      cell_size: {
        type: jspsych.ParameterType.INT,
        default: 100,
      },
      /** N-back level (how many trials back to compare) */
      n_back_level: {
        type: jspsych.ParameterType.INT,
        default: 2,
      },
      /** Total number of trials in the task */
      total_trials: {
        type: jspsych.ParameterType.INT,
        default: 20,
      },
      /** Percentage of trials that should be targets (0-100) */
      target_percentage: {
        type: jspsych.ParameterType.FLOAT,
        default: 30,
      },
      /** Duration each stimulus is displayed (ms) */
      stimulus_duration: {
        type: jspsych.ParameterType.INT,
        default: 500,
      },
      /** Inter-stimulus interval (ms) */
      isi_duration: {
        type: jspsych.ParameterType.INT,
        default: 2000,
      },
      /** Whether to show feedback after each response */
      show_feedback: {
        type: jspsych.ParameterType.BOOL,
        default: true,
      },
      /** Duration of feedback display (ms) */
      feedback_duration: {
        type: jspsych.ParameterType.INT,
        default: 500,
      },
      /** Whether to show progress indicator */
      show_progress: {
        type: jspsych.ParameterType.BOOL,
        default: true,
      },
      /** Text for the response button */
      button_text: {
        type: jspsych.ParameterType.STRING,
        default: "MATCH",
      },
      /** Color of the stimulus square */
      stimulus_color: {
        type: jspsych.ParameterType.STRING,
        default: "#0066cc",
      },
      /** Color of correct feedback border */
      correct_color: {
        type: jspsych.ParameterType.STRING,
        default: "#00cc00",
      },
      /** Color of incorrect feedback border */
      incorrect_color: {
        type: jspsych.ParameterType.STRING,
        default: "#cc0000",
      },
      /** Instructions to display above the grid */
      instructions: {
        type: jspsych.ParameterType.STRING,
        default: "Click MATCH when the current position matches the position from {n} trials ago.",
      },
    },
    data: {
      /** Array of all stimulus positions (row, col) for each trial */
      stimulus_positions: {
        type: jspsych.ParameterType.COMPLEX,
      },
      /** Array of whether each trial was a target */
      target_sequence: {
        type: jspsych.ParameterType.COMPLEX,
      },
      /** Array of participant responses for each trial */
      responses: {
        type: jspsych.ParameterType.COMPLEX,
      },
      /** Array of response times for each trial */
      response_times: {
        type: jspsych.ParameterType.COMPLEX,
      },
      /** Array of accuracy for each trial */
      accuracy: {
        type: jspsych.ParameterType.COMPLEX,
      },
      /** Overall accuracy percentage */
      overall_accuracy: {
        type: jspsych.ParameterType.FLOAT,
      },
      /** Hit rate (correct responses to targets) */
      hit_rate: {
        type: jspsych.ParameterType.FLOAT,
      },
      /** False alarm rate (incorrect responses to non-targets) */
      false_alarm_rate: {
        type: jspsych.ParameterType.FLOAT,
      },
      /** Total task duration in milliseconds */
      total_duration: {
        type: jspsych.ParameterType.INT,
      },
    },
  };

  /**
   * **plugin-spatial-nback-task**
   *
   * A spatial N-back working memory task plugin for jsPsych
   *
   * @author Your Name
   * @see {@link https://www.jspsych.org/plugins/plugin-spatial-nback-task}
   */
  class SpatialNbackTaskPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      // Initialize task variables
      let current_trial = 0;
      let stimulus_positions = [];
      let target_sequence = [];
      let responses = [];
      let response_times = [];
      let accuracy = [];
      let task_start_time = performance.now();
      let trial_start_time;
      let response_allowed = false;
      let stimulus_timeout;
      let isi_timeout;

      // Generate stimulus sequence
      generateSequence(trial);

      // Create HTML structure
      if (display_element) {
        createDisplay(trial);
      } else {
      if (trial && trial.total_trials && trial.rows && trial.cols) {
        startTrial();
      } else {
        console.error("Invalid trial parameters provided.");
        display_element.innerHTML = '<p style="color: red;">Error: Invalid trial parameters.</p>';
      }
      }

      // Start the task
      startTrial();

      // Generate stimulus sequence with targets
      function generateSequence(trial_params) {
        const total_positions = trial_params.rows * trial_params.cols;
        const n_targets = Math.round((trial_params.target_percentage / 100) * trial_params.total_trials);
        
        // Generate random positions for first n trials
        for (let i = 0; i < trial_params.n_back_level; i++) {
          stimulus_positions.push({
            row: Math.floor(Math.random() * trial_params.rows),
            col: Math.floor(Math.random() * trial_params.cols)
          });
          target_sequence.push(false);
        }

        // Generate remaining trials with targets
        let targets_placed = 0;
        for (let i = trial_params.n_back_level; i < trial_params.total_trials; i++) {
          let is_target = false;
          
          if (targets_placed < n_targets && Math.random() < 0.5) {
            // Make this a target trial
            stimulus_positions.push({
              row: stimulus_positions[i - trial_params.n_back_level].row,
              col: stimulus_positions[i - trial_params.n_back_level].col
            });
            is_target = true;
            targets_placed++;
          } else {
            // Generate non-target position
            let new_position;
            do {
              new_position = {
                row: Math.floor(Math.random() * trial_params.rows),
                col: Math.floor(Math.random() * trial_params.cols)
              };
            } while (
              new_position.row === stimulus_positions[i - trial_params.n_back_level].row &&
              new_position.col === stimulus_positions[i - trial_params.n_back_level].col
            );
            stimulus_positions.push(new_position);
          }
          
          target_sequence.push(is_target);
        }
      }

      function createDisplay(trial_params) {
        let html = '<div id="nback-container" style="text-align: center; font-family: Arial, sans-serif;">';
        
        // Instructions
        const instructions_text = trial_params.instructions.replace('{n}', trial_params.n_back_level);
        html += `<div id="nback-instructions" style="margin-bottom: 20px; font-size: 16px;">${instructions_text}</div>`;
        
        // Progress bar
        if (trial_params.show_progress) {
          html += '<div id="nback-progress-container" style="margin-bottom: 20px;">';
          html += '<div style="background-color: #e0e0e0; height: 10px; border-radius: 5px; overflow: hidden;">';
          html += '<div id="nback-progress-bar" style="background-color: #4CAF50; height: 100%; width: 0%; transition: width 0.3s;"></div>';
          html += '</div>';
          html += '<div id="nback-progress-text" style="font-size: 14px; margin-top: 5px;">Trial 0 of ' + trial_params.total_trials + '</div>';
          html += '</div>';
        }

        // Grid
        html += '<div id="nback-grid" style="display: inline-block; border: 2px solid #000; margin-bottom: 20px;">';
        for (let row = 0; row < trial_params.rows; row++) {
          html += '<div style="display: flex;">';
          for (let col = 0; col < trial_params.cols; col++) {
            html += `<div id="cell-${row}-${col}" style="width: ${trial_params.cell_size}px; height: ${trial_params.cell_size}px; border: 1px solid #ccc; background-color: white;"></div>`;
          }
          html += '</div>';
        }
        html += '</div>';

        // Response button
        html += `<div><button id="nback-response-btn" style="font-size: 18px; padding: 15px 30px; background-color: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 10px;" disabled>${trial_params.button_text}</button></div>`;
        
        // Feedback area
        html += '<div id="nback-feedback" style="height: 30px; font-size: 16px; font-weight: bold; margin-top: 10px;"></div>';
        
        html += '</div>';
        
        display_element.innerHTML = html;

        // Add button event listener
        document.getElementById('nback-response-btn').addEventListener('click', handleResponse);
      }

      function startTrial() {
        if (current_trial >= trial.total_trials) {
          endTask();
          return;
        }

        // Update progress
        if (trial.show_progress) {
          const progress = ((current_trial + 1) / trial.total_trials) * 100;
          document.getElementById('nback-progress-bar').style.width = progress + '%';
          document.getElementById('nback-progress-text').textContent = `Trial ${current_trial + 1} of ${trial.total_trials}`;
        }

        // Clear previous stimulus and feedback
        clearGrid();
        document.getElementById('nback-feedback').textContent = '';
        
        // Show stimulus
        const position = stimulus_positions[current_trial];
        const cell = document.getElementById(`cell-${position.row}-${position.col}`);
        cell.style.backgroundColor = trial.stimulus_color;

        // Enable response
        response_allowed = true;
        trial_start_time = performance.now();
        document.getElementById('nback-response-btn').disabled = false;

        // Set timeout to hide stimulus
        stimulus_timeout = setTimeout(() => {
          cell.style.backgroundColor = 'white';
          
          // Set timeout for ISI
          isi_timeout = setTimeout(() => {
            if (response_allowed) {
              handleNoResponse();
            }
          }, trial.isi_duration);
        }, trial.stimulus_duration);
      }

      function handleResponse() {
        if (!response_allowed) return;

        response_allowed = false;
        const response_time = performance.now() - trial_start_time;
        const is_target = target_sequence[current_trial];
        const is_correct = is_target;

        // Record response
        responses.push(true);
        response_times.push(response_time);
        accuracy.push(is_correct);

        // Clear timeouts
        clearTimeout(stimulus_timeout);
        clearTimeout(isi_timeout);

        // Show feedback
        if (trial.show_feedback) {
          showFeedback(is_correct, response_time);
        } else {
          nextTrial();
        }
      }

      function handleNoResponse() {
        if (!response_allowed) return;

        response_allowed = false;
        const is_target = target_sequence[current_trial];
        const is_correct = !is_target;

        // Record no response
        responses.push(false);
        response_times.push(null);
        accuracy.push(is_correct);

        // Show feedback
        if (trial.show_feedback) {
          showFeedback(is_correct, null);
        } else {
          nextTrial();
        }
      }

      function showFeedback(is_correct, response_time) {
        const grid = document.getElementById('nback-grid');
        const feedback_div = document.getElementById('nback-feedback');
        
        // Show border feedback
        grid.style.border = `4px solid ${is_correct ? trial.correct_color : trial.incorrect_color}`;
        
        // Show text feedback
        let feedback_text = is_correct ? 'Correct!' : 'Incorrect!';
        if (response_time !== null) {
          feedback_text += ` (${Math.round(response_time)}ms)`;
        }
        feedback_div.textContent = feedback_text;
        feedback_div.style.color = is_correct ? trial.correct_color : trial.incorrect_color;

        // Disable button during feedback
        document.getElementById('nback-response-btn').disabled = true;

        setTimeout(() => {
          grid.style.border = '2px solid #000';
          feedback_div.textContent = '';
          nextTrial();
        }, trial.feedback_duration);
      }

      function nextTrial() {
        current_trial++;
        setTimeout(startTrial, 200); // Small delay between trials
      }

      function clearGrid() {
        for (let row = 0; row < trial.rows; row++) {
          for (let col = 0; col < trial.cols; col++) {
            document.getElementById(`cell-${row}-${col}`).style.backgroundColor = 'white';
          }
        }
      }

      function endTask() {
        const total_duration = performance.now() - task_start_time;
        
        // Calculate performance metrics
        const hits = accuracy.filter((acc, i) => target_sequence[i] && acc).length;
        const false_alarms = accuracy.filter((acc, i) => !target_sequence[i] && !acc).length;
        const total_targets = target_sequence.filter(t => t).length;
        const total_non_targets = target_sequence.filter(t => !t).length;
        
        const hit_rate = total_targets > 0 ? hits / total_targets : 0;
        const false_alarm_rate = total_non_targets > 0 ? false_alarms / total_non_targets : 0;
        const overall_accuracy = accuracy.filter(a => a).length / accuracy.length;

        // Prepare trial data
        const trial_data = {
          stimulus_positions: stimulus_positions,
          target_sequence: target_sequence,
          responses: responses,
          response_times: response_times,
          accuracy: accuracy,
          overall_accuracy: overall_accuracy,
          hit_rate: hit_rate,
          false_alarm_rate: false_alarm_rate,
          total_duration: Math.round(total_duration)
        };

        // Clear display
        display_element.innerHTML = '';

        // End trial
        jsPsych.finishTrial(trial_data);
      }

      // Bind methods to preserve context
      generateSequence = generateSequence.bind(this);
      createDisplay = createDisplay.bind(this);
      startTrial = startTrial.bind(this);
      handleResponse = handleResponse.bind(this);
      handleNoResponse = handleNoResponse.bind(this);
      showFeedback = showFeedback.bind(this);
      nextTrial = nextTrial.bind(this);
      clearGrid = clearGrid.bind(this);
      endTask = endTask.bind(this);

      // Initialize the task
      generateSequence(trial);
      createDisplay(trial);
      startTrial();
    }
  }

  SpatialNbackTaskPlugin.info = info;
  return SpatialNbackTaskPlugin;

})(jsPsychModule);