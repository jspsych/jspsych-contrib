var jsPsychHtmlVasResponse = (function (jspsych) {
  "use strict";

  const info = {
    name: "html-vas-response",
    version: "2.0.0",
    parameters: {
      /** The string to be displayed. */
      stimulus: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Stimulus",
        default: undefined,
      },
      /** Specifies the labels to be displayed, equally spaced along the scale, as in jspsych-html-slider-response. */
      labels: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Labels",
        default: [],
        array: true,
      },
      /** A function called when the participant clicks on the scale.
       * The current location of the participant's response (between 0 and 1) is provided as an input. */
      resp_fcn: {
        type: jspsych.ParameterType.FUNCTION,
        pretty_name: "Response function",
        default: null,
      },
      /** Specifies whether smaller vertical tick marks should accompany the labels. */
      ticks: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Ticks",
        default: true,
      },
      /** If the scale should have some set of discrete clickable points (such that the tick mark will be rounded to the nearest such point),
       * this parameter can be used specify the number of such points. If not, set this to `0`. */
      n_scale_points: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Number of scale points",
        default: null,
      },
      /** The width of the VAS in pixels.
       * If left `null`, then the width will be equal to the widest element in the display. */
      scale_width: {
        type: jspsych.ParameterType.INT,
        pretty_name: "VAS width",
        default: null,
      },
      /** The height of the clickable region around the VAS in pixels. */
      scale_height: {
        type: jspsych.ParameterType.INT,
        pretty_name: "VAS height",
        default: 40,
      },
      /** The colour of the scale (the horizontal line). Anything that would make a valid CSS `background` property can be used here. */
      scale_colour: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Scale colour",
        default: "black",
      },
      /** The style of the cursor when the clickable part of the scale is hovered over. */
      scale_cursor: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Scale cursor",
        default: "pointer",
      },
      /** The colour of the participant's response marker. Anything that would make a valid CSS `background` property can be used here. */
      marker_colour: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Marker colour",
        default: "rgba(0, 0, 0, 0.5)",
      },
      /** The colour of the tick marks on the scale. Anything that would make a valid CSS `background` property can be used here. */
      tick_colour: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "tick colour",
        default: "black",
      },
      /** The content to be displayed below the stimulus. */
      prompt: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Prompt",
        default: null,
      },
      /** The text of the button that will submit the response. */
      button_label: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Button label",
        default: "Continue",
      },
      /** If `true`, the participant must select a response on the VAS before the trial can advance. */
      required: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Response required",
        default: false,
      },
      /** The duration, in milliseconds, for which the stimulus is visible.
       * If `null`, the stimulus is visible for the duration of the trial. */
      stimulus_duration: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Stimulus duration",
        default: null,
      },
      /**
       * The duration of the trial, in milliseconds.
       * Once this time elapses, the trial ends and any response is recorded.
       * If `null`, the trial continues indefinitely.
       */
      trial_duration: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Trial duration",
        default: null,
      },
      /**
       * If `false`, the participant's clicking the continue button does not end the trial (but does prevent any changes to the VAS response),
       * and the trial ends when `trial_duration` has elapsed.
       */
      response_ends_trial: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Response ends trial",
        default: true,
      },
    },
    data: {
      /** The response time in milliseconds for the participant to make a response.
       * The time is measured from when the stimulus first appears on the screen until the participant's response. */
      rt: {
        type: jspsych.ParameterType.INT,
      },
      /** The value selected, between 0 and 1. 0 is the leftmost point on the scale,
       * 1 is the rightmost point, and 0.5 is exactly in the middle. */
      response: {
        type: jspsych.ParameterType.FLOAT,
      },
      /** The stimulus displayed during the trial. */
      stimulus: {
        type: jspsych.ParameterType.STRING,
      },
      /**
       * A record of the participant's clicks on the scale. Each element in the array is an object
       * with properties `time` and `location`.
       */
      clicks: {
        type: jspsych.ParameterType.COMPLEX,
        array: true,
        nested: {
          /** The time of the click, in milliseconds since the trial began. */
          time: {
            type: jspsych.ParameterType.INT,
          },
          /** The location of the click on the VAS, from 0 to 1. */
          location: {
            type: jspsych.ParameterType.FLOAT,
          },
        },
      },
    },
    citations: {
      apa: "Kinley, I. (2022). A jsPsych plugin for visual analogue scales. PsyArXiv. https://doi.org/10.31234/osf.io/avj92 ",
      bibtex:
        "@article{Kinley2022jsPsych, 	author = {Kinley, Isaac}, 	journal = {PsyArXiv}, 	doi = {10.31234/osf.io/avj92}, 	issn = {2331-8422}, 	year = {2022}, 	month = {mar 7}, 	title = {A {jsPsych} plugin for visual analogue scales}, 	url = {https://osf.io/preprints/psyarxiv/avj92}, 	howpublished = {https://osf.io/preprints/psyarxiv/avj92}, }  ",
    },
  };

  /**
   * **html-vas-response**
   *
   * jsPsych plugin for a visual analogue scale (VAS) response.
   * @author Isaac Kinley
   */
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
      html +=
        '<div id="jspsych-html-vas-response-vas" style="position: relative; left: 0px; top: 0px; height: ' +
        trial.scale_height +
        "px; width: 100%; " +
        "cursor: " +
        trial.scale_cursor +
        ';">';
      // Draw horizontal line in VAS container
      html +=
        '<div style="position: relative; background: ' +
        trial.scale_colour +
        "; width: 100%; height: 2px; top: " +
        (trial.scale_height / 2 - 1) +
        'px"></div>';
      // Draw vertical line, but hide it at first
      html +=
        '<div id="jspsych-html-vas-response-vline" style="visibility: hidden; position: absolute; left: 0px; background-color: ' +
        trial.marker_colour +
        "; height: " +
        trial.scale_height +
        'px; width: 2px; top: 0px"></div>';
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

      var vas = document.getElementById("jspsych-html-vas-response-vas");
      // Add minor ticks
      if (trial.ticks) {
        for (var j = 0; j < trial.labels.length; j++) {
          var label_width_pct = 100 / (trial.labels.length - 1);
          var pct_of_range = j * (100 / (trial.labels.length - 1));
          var mtick = document.createElement("div");
          mtick.style.position = "absolute";
          mtick.style.height = trial.scale_height / 2 + "px";
          mtick.style.width = "2px";
          mtick.style.top = trial.scale_height / 4 + "px";
          mtick.style.background = trial.tick_colour;
          mtick.style.left = (pct_of_range / 100) * vas.clientWidth - 1 + "px";
          vas.appendChild(mtick);
        }
      }

      // Function to move vertical tick
      var pct_tick = null;
      var vas_enabled = true;
      var clicks = [];
      vas.onclick = function (e) {
        var clickTime = performance.now() - startTime;
        if (!vas_enabled) {
          return;
        }
        var vas = document.getElementById("jspsych-html-vas-response-vas");
        var vas_rect = vas.getBoundingClientRect();
        if (e.clientX <= vas_rect.right && e.clientX >= vas_rect.left) {
          // Compute click location as a proportion of VAS line
          pct_tick = (e.clientX - vas_rect.left) / vas_rect.width;
          // Round to nearest increment, if needed
          if (trial.n_scale_points) {
            pct_tick =
              Math.round(pct_tick * (trial.n_scale_points - 1)) / (trial.n_scale_points - 1);
          }
          var vline = document.getElementById("jspsych-html-vas-response-vline");
          vline.style.left = pct_tick * vas_rect.width - 1 + "px";
          vline.style.visibility = "visible";
          // vas.appendChild(vline);
          var continue_button = document.getElementById("jspsych-html-vas-response-next");
          continue_button.disabled = false;
          // record time series of clicks
          clicks.push({ time: clickTime, location: pct_tick });
          // call
          if (trial.resp_fcn) {
            trial.resp_fcn(pct_tick);
          }
        }
      };

      var response = {
        rt: null,
        response: null,
      };

      function end_trial() {
        // save data
        var trialdata = {
          rt: response.rt,
          stimulus: trial.stimulus,
          response: response.response,
          clicks: clicks,
        };

        // next trial
        jsPsych.finishTrial(trialdata);
      }

      var continue_button = document.getElementById("jspsych-html-vas-response-next");
      continue_button.onclick = function () {
        // measure response time
        var endTime = performance.now();
        response.rt = Math.round(endTime - startTime);
        response.response = pct_tick;
        if (trial.response_ends_trial) {
          end_trial();
        } else {
          vas_enabled = false;
        }
      };

      // hide stimulus if stimulus_duration is set
      if (trial.stimulus_duration !== null) {
        jspsych.pluginAPI.setTimeout(function () {
          var stim = document.getElementById("jspsych-html-vas-response-stimulus");
          stim.style.visibility = "hidden";
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
