var htmlWrittenRecall = (function (jspsych) {
  "use strict";

  const info = {
    name: "html-written-recall",
    parameters: {
      stimulus: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Stimulus",
        default: undefined,
      },
      prompt: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Prompt",
        default: null,
      },
      stimulus_duration: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Stimulus duration",
        default: null, // might add a stimulus or prompt repeat where it only shows for first word in a block and then disappears
      },
      trial_duration: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Trial duration",
        default: null,
      },
      next_word_key: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "key for next word",
        default: " ",
      },
      button_string: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Button HTML",
        default: null,
      },
      button_delay: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Button delay",
        default: 0,
      },
      block_time_start: {
        type: jspsych.ParameterType.INT,
        pretty_name: "The time the recall block began",
        default: null,
      },
      total_block_duration: {
        type: jspsych.ParameterType.INT,
        pretty_name: "The total duration of the recall block",
        default: null,
      },
    },
  };

  class HtmlFreeRecallPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      var new_html =
        '<div id="jspsych-html-keyboard-response-stimulus">' + trial.stimulus + "</div>";

      // Add a textbox for input
      new_html +=
        '<div><input type="text" id="jspsych-html-keyboard-response-textbox" autocomplete="off" /></div>'; // need to make sure autocomplete is off

      if (trial.prompt !== null) {
        new_html += trial.prompt;
      }

      if (trial.button_string !== null) {
        new_html +=
          '<div><button id="jspsych-html-keyboard-response-button" style="display: none; justify-content:center">' +
          trial.button_string +
          "</button></div>";
      }

      display_element.innerHTML = new_html;

      // Focus the textbox to enable typing immediately
      var textbox = display_element.querySelector("#jspsych-html-keyboard-response-textbox");
      textbox.focus();
      var response = {
        rt: null,
        button: null,
      };
      // Add an event listener to the button, if it exists, and show it after a delay
      if (trial.button_string !== null) {
        var button = display_element.querySelector("#jspsych-html-keyboard-response-button");
        button.addEventListener("click", () => {
          response.button = "pressed"; // Set button to "pressed" when clicked
          end_trial();
        });
        var buttonDisplayTime;
        if (trial.block_time_start !== null) {
          // Dynamic button delay calculation
          var currentTime = performance.now();
          var elapsedTime = currentTime - trial.block_time_start;
          buttonDisplayTime = Math.max(trial.total_block_duration - elapsedTime, 0);
        } else {
          // Static button delay
          buttonDisplayTime = trial.button_delay;
        }
        this.jsPsych.pluginAPI.setTimeout(() => {
          button.style.display = "initial"; // Show the button after the delay
        }, buttonDisplayTime);
      }
      const end_trial = () => {
        this.jsPsych.pluginAPI.clearAllTimeouts();

        textbox.removeEventListener("keydown", checkForNextWordKey); // Remove the event listener

        var trial_data = {
          rt: response.rt,
          stimulus: trial.stimulus,
          response: textbox.value, // Get the value of the textbox
          button: response.button,
        };

        display_element.innerHTML = "";

        this.jsPsych.finishTrial(trial_data);
      };
      // if the next_word_key is "Spacebar" convert it to " " for comparison
      if (trial.next_word_key.toLowerCase() === "spacebar") {
        trial.next_word_key = " ";
      }
      // Function to check for space key press in the textbox
      const checkForNextWordKey = (event) => {
        if (textbox.value.trim() !== "" && event.key === trial.next_word_key) {
          response.rt = performance.now() - start_time;
          end_trial();
        }
      };

      // Add event listener to the textbox for "keydown" event
      textbox.addEventListener("keydown", checkForNextWordKey);

      if (trial.stimulus_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          display_element.querySelector(
            "#jspsych-html-keyboard-response-stimulus",
          ).style.visibility = "hidden";
        }, trial.stimulus_duration);
      }

      if (trial.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
      }
      var start_time = performance.now();
    }
  }
  HtmlFreeRecallPlugin.info = info;

  return HtmlFreeRecallPlugin;
})(jsPsychModule);
