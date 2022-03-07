var jsPsychHtmlVasResponse = (function (jspsych) {
  "use strict";

  const info = {
    name: "html-vas-response",
    parameters: {
      stimulus: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Stimulus",
        default: undefined,
      },
      labels: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Labels",
        default: [],
        array: true,
      },
      ticks: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Ticks",
        default: true,
      },
      scale_width: {
        type: jspsych.ParameterType.INT,
        pretty_name: "VAS width",
        default: null
      },
      scale_height: {
        type: jspsych.ParameterType.INT,
        pretty_name: "VAS height",
        default: 40
      },
      scale_colour: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Scale colour",
        default: 'black'
      },
      scale_cursor: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Scale cursor",
        default: 'pointer'
      },
      marker_colour: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Marker colour",
        default: 'rgba(0, 0, 0, 0.5)'
      },
      tick_colour: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "tick colour",
        default: 'black'
      },
      prompt: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Prompt",
        default: null
      },
      button_label: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Buton label",
        default: 'Continue'
      },
      required: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Response required",
        default: false
      },
      stimulus_duration: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Stimulus duration",
        default: null
      },
      trial_duration: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Trial duration",
        default: null
      },
      response_ends_trial: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Response ends trial",
        default: true
      },
    },
  };
  class jsPsychHtmlVasResponsePlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {
      // half of the thumb width value from jspsych.css, used to adjust the label positions
      var half_thumb_width = 7.5;
      var html = '<div id="jspsych-html-vas-response-wrapper" style="margin: 100px 0px;">';
      html += '<div id="jspsych-html-vas-response-stimulus">' + trial.stimulus + "</div>";
      html +=
        '<div class="jspsych-html-vas-response-container" style="position:relative; margin: 0 auto 3em auto; ';
      if (trial.scale_width !== null) {
        html += "width:" + trial.scale_width + "px;";
      } else {
        html += "width:auto;";
      }
      html += '">';
      // Create clickable container for VAS
      html += '<div id="jspsych-html-vas-response-vas" style="position: relative; left: 0px; top: 0px; height: ' + trial.scale_height + 'px; width: 100%; ' +
        'cursor: ' + trial.scale_cursor + ';">';
      // Draw horizontal line in VAS container
      html += '<div style="position: relative; background: ' + trial.scale_colour + '; width: 100%; height: 2px; top: ' + (trial.scale_height/2 - 1) + 'px"></div>'
      // Draw vertical line, but hide it at first
      html += '<div id="jspsych-html-vas-response-vline" style="visibility: hidden; position: absolute; left: 0px; background-color: ' + trial.marker_colour + '; height: ' + trial.scale_height + 'px; width: 2px; top: 0px"></div>'
      html += "</div>";
      html += "<div>";
      for (var j = 0; j < trial.labels.length; j++) {
        var label_width_perc = 100 / (trial.labels.length - 1);
        var percent_of_range = j * (100 / (trial.labels.length - 1));
        var percent_dist_from_center = ((percent_of_range - 50) / 50) * 100;
        var offset = (percent_dist_from_center * half_thumb_width) / 100;
        html +=
          '<div style="border: 1px solid transparent; display: inline-block; position: absolute; ' +
          "left:calc(" +
          percent_of_range +
          "% - (" +
          label_width_perc +
          "% / 2) - " +
          offset +
          "px); text-align: center; width: " +
          label_width_perc +
          '%;">';
        html += '<span style="text-align: center; font-size: 80%;">' + trial.labels[j] + "</span>";
        html += "</div>";
      }
      html += "</div>";
      html += "</div>";
      html += "</div>";

      if (trial.prompt !== null) {
        html += trial.prompt;
      }

      // Submit button
      html +=
        '<button id="jspsych-html-vas-response-next" class="jspsych-btn" ' +
        (trial.required ? "disabled" : "") +
        ">" +
        trial.button_label +
        "</button>";

      display_element.innerHTML = html;

      var vas = document.getElementById('jspsych-html-vas-response-vas');
      // Add minor ticks
      for (var j = 0; j < trial.labels.length; j++) {
        var label_width_pct = 100 / (trial.labels.length - 1);
        var pct_of_range = j * (100 / (trial.labels.length - 1));
        var mtick = document.createElement('div');
        mtick.style.position = 'absolute';
        mtick.style.height = (trial.scale_height/2) + 'px';
        mtick.style.width = '2px';
        mtick.style.top = (trial.scale_height/4) + 'px';
        mtick.style.background = trial.tick_colour;
        mtick.style.left = (pct_of_range/100 * vas.clientWidth - 1) + 'px';
        vas.appendChild(mtick);
      }

      // Function to move vertical tick
      var pct_tick = null;
      var vas_enabled = true;
      vas.onclick = function(e) {
        if (!vas_enabled) {
          return;
        }
        var vas = document.getElementById('jspsych-html-vas-response-vas');
        var vas_rect = vas.getBoundingClientRect();
        if (e.clientX <= vas_rect.right && e.clientX >= vas_rect.left) {
          var element = vas;
          var vline = document.getElementById('jspsych-html-vas-response-vline');
          var cx = Math.round(e.clientX);
          vline.style.left = (e.clientX - vas_rect.left - 1) + 'px';
          vline.style.visibility = 'visible';
          console.log(pct_tick);
          pct_tick = (e.clientX - vas_rect.left) / vas_rect.width;
          console.log(pct_tick);
          vas.appendChild(vline);
          var continue_button = document.getElementById('jspsych-html-vas-response-next');
          continue_button.disabled = false;
        }
      }
      
      var response = {
        rt: null,
        response: null,
      };

      function end_trial() {
        jsPsych.pluginAPI.clearAllTimeouts();

        // save data
        var trialdata = {
          rt: response.rt,
          stimulus: trial.stimulus,
          response: response.response,
        };

        display_element.innerHTML = "";

        // next trial
        jsPsych.finishTrial(trialdata);
      };

      var continue_button = document.getElementById('jspsych-html-vas-response-next');
      continue_button.onclick = function() {
        // measure response time
        var endTime = performance.now();
        response.rt = Math.round(endTime - startTime);
        response.response = pct_tick;
        if (trial.response_ends_trial) {
          end_trial();
        } else {
          vas_enabled = false;
        }
      }

      // hide stimulus if stimulus_duration is set
      if (trial.stimulus_duration !== null) {
        jspsych.pluginAPI.setTimeout(function() {
          var stim = document.getElementById('jspsych-html-vas-response-stimulus');
          stim.style.visibility = 'hidden';
        }, trial.stimulus_duration);
      }

      // end trial if trial_duration is set
      if (trial.trial_duration !== null) {
        jspsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
      }

      var startTime = performance.now();
    }
  }
  jsPsychHtmlVasResponsePlugin.info = info;

  return jsPsychHtmlVasResponsePlugin;
})(jsPsychModule);