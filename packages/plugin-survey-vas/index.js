var jsPsychSurveyVas = (function (jspsych) {
  "use strict";

  const info = {
    name: "survey-vas",
    version: "1.0.0",
    parameters: {
      /** Questions that will be displayed to the participant. */
      questions: {
        type: jspsych.ParameterType.COMPLEX,
        array: true,
        pretty_name: "Questions",
        default: undefined,
        nested: {
          /** The HTML string to be displayed */
          prompt: {
            type: jspsych.ParameterType.STRING,
            pretty_name: "Prompt",
            default: undefined,
            description: "Question prompt",
          },
          /** Labels to appear below VAS */
          labels: {
            type: jspsych.ParameterType.STRING,
            pretty_name: "Labels",
            default: [],
            array: true,
            description: "Labels of the VAS.",
          },
          /** Name of question */
          name: {
            type: jspsych.ParameterType.STRING,
            pretty_name: "Question Name",
            default: null,
            description: "Controls the name of data values associated with this question",
          },
          /** Whether a response is required */
          required: {
            type: jspsych.ParameterType.BOOL,
            pretty_name: "Response required",
            default: false,
            description: "If true, the question must be answered before moving to the next trial",
          }
        }
      },
      randomize_question_order: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Randomize Question Order",
        default: false,
        description: "If true, the order of the questions will be randomized",
      },
      preamble: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Preamble",
        default: null,
        description: "String to display at top of the page.",
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
      /* Marker type. Options are "vline" (vertical line, default), "cross" (X shape), "circle", and "square". */
      marker_type: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Marker type",
        default: 'vline'
      },
      /** Allows the user to drag the response markers */
      marker_draggable: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Marker draggable",
        default: true,
      },
      /* Size of marker in pixels */
      marker_size: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Marker size",
        default: 30,
      },
      /** The width of the clickable region around the VAS in pixels.
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
      /** The width of the horizontal line as a percentage of the width of the clickable region (capped at 100).
       * Setting this to less than 100 makes it easier for the user to select the extreme ends of the scale. */
      hline_pct: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Horizontal line width percentage",
        default: 100,
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
      /** Additional attributes of the response marker SVG. Changing this can further customize the marker's appearance. */
      marker_svg_attrs: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Marker attributes",
        default: 'stroke="black" stroke-width="2" stroke-opacity="0.5"',
      },
      /** The colour of the tick marks on the scale. Anything that would make a valid CSS `background` property can be used here. */
      tick_colour: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "tick colour",
        default: "black",
      },
      /** The text of the button that will submit the response. */
      button_label: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Button label",
        default: "Continue",
      }
    },
    data: {
      /** The response time in milliseconds for the participant to make a response.
       * The time is measured from when the stimulus first appears on the screen until the participant's response. */
      rt: {
        type: jspsych.ParameterType.INT,
      },
      /** A JSON string representing the responses given to each question. */
      response: {
        type: jspsych.ParameterType.STRING,
      },
      /** The order in which the questions were presented. */
      question_order: {
        type: jspsych.ParameterType.STRING,
      }
    },
    citations: {
      apa: "Kinley, I. (2022). A jsPsych plugin for visual analogue scales. PsyArXiv. https://doi.org/10.31234/osf.io/avj92 ",
      bibtex:
        "@article{Kinley2022jsPsych, 	author = {Kinley, Isaac}, 	journal = {PsyArXiv}, 	doi = {10.31234/osf.io/avj92}, 	issn = {2331-8422}, 	year = {2022}, 	month = {mar 7}, 	title = {A {jsPsych} plugin for visual analogue scales}, 	url = {https://osf.io/preprints/psyarxiv/avj92}, 	howpublished = {https://osf.io/preprints/psyarxiv/avj92}, }  ",
    },
  };

  /**
   * **survey-vas**
   *
   * jsPsych plugin for a visual analogue scale (VAS) response.
   * @author Isaac Kinley
   */
  class jsPsychsSurveyVas {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {
      // constrain hline_pct to < 100
      if (trial.hline_pct > 100) {
        console.log('hline_pct is greater than 100! This makes no sense. Setting to 100.');
        trial.hline_pct = 100;
      }

      // Function to move marker---we'll refer back to this later
      function update_vas(e, i) {
        // e is the event
        // i is the index of the VAS
        var clickTime = performance.now() - startTime;
        var hline = document.getElementById("jspsych-survey-vas-hline-" + i);
        var hline_rect = hline.getBoundingClientRect();
        // What's the x coord of the interaction? Depends on whether e is a click or touch
        var interaction_x = e.clientX ?? e.touches[e.touches.length - 1].clientX;
        // Compute click location as a proportion of VAS horizontal line
        var ppn_tick = (interaction_x - hline_rect.left) / hline_rect.width; // Marker location as a proportion from 0 - 1
        ppn_tick = Math.max(Math.min(ppn_tick, 1), 0); // Constrain to 0 - 1
        // Round to nearest increment, if needed
        if (trial.n_scale_points) {
          ppn_tick =
            Math.round(ppn_tick * (trial.n_scale_points - 1)) / (trial.n_scale_points - 1);
        }
        var marker = document.getElementById("jspsych-survey-vas-marker-" + i);
        marker.style.left = (ppn_tick * hline_rect.width - trial.marker_size/2) + "px";
        marker.style.visibility = "visible"; // idempotent
        var continue_button = document.getElementById("jspsych-survey-vas-next");
        // Record in data associated with this hline
        hline.dataset['markerpos'] = ppn_tick;
        // Enable continue button if all required questions are answered
        check_if_required_questions_answered();
      };

      // To get an update function for a specific VAS:
      function get_vas_update_fn(i) {
        // i is defined within the enclosing scope of update_fn
        var update_fn = function(e) {
          update_vas(e, i)
        }
        return update_fn;
      }

      // Function to enable the continue button only if the required questions are answered
      function check_if_required_questions_answered() {
        var all_answered = true;
        var i;
        for (i = 0; i < trial.questions.length; i++) {
          var elem = document.getElementById('jspsych-survey-vas-hline-' + i);
          if (elem.dataset['required'] == 'true') {
            if (elem.dataset['markerpos'] == 'null') {
              all_answered = false;
              break;
            }
          }
        }
        if (all_answered) {
          // enable continue button
          var continue_button = document.getElementById('jspsych-survey-vas-next');
          continue_button.disabled = false;
        }
      }
      
      // wrapper for all questions
      var html = '<div id="jspsych-survey-vas-wrapper" style="margin: 100px 0px;">';
      
      html +=
        '<div class="jspsych-survey-vas-container" style="position:relative; margin: 0 auto 3em auto; ';
      if (trial.scale_width !== null) {
        html += "width:" + trial.scale_width + "px;";
      } else {
        html += "width:auto;";
      }
      html += '">';
      
      // show preamble text
      if (trial.preamble !== null) {
        html +=
          '<div style="position: relative; width:100%" id="jspsych-survey-vas-preamble" class="jspsych-survey-vas-preamble">' +
          trial.preamble +
          "</div><br>";
      }

      // add VAS questions //
      var any_questions_required = false;
      // generate question order. this is randomized here as opposed to randomizing the order of trial.questions
      // so that the data are always associated with the same question regardless of order
      var question_order = [];
      for (var i = 0; i < trial.questions.length; i++) {
        question_order.push(i);
      }
      if (trial.randomize_question_order) {
        // const shuffle = () => {
        //   question_order = this.jsPsych.randomization.shuffle(question_order);
        // }
        question_order = this.jsPsych.randomization.shuffle(question_order);
      }

      // Add questions
      var i;
      for (i = 0; i < trial.questions.length; i++) {
        var question = trial.questions[question_order[i]];
        any_questions_required = any_questions_required || question.required; // idempotent
        // Add prompt
        html += '<div>' + question.prompt + "</div>";
        // Create clickable container for VAS
        html +=
          '<div id="jspsych-survey-vas-clickable-' + i + '" style="position: relative; left: 0px; top: 0px; ' + 
          'height: ' + trial.scale_height + 'px; ' +
          'width: 100%; ' +
          'margin-bottom: 80px; ' +
          "cursor: " + trial.scale_cursor + ';' + 
          '">';
        // Draw horizontal line in clickable VAS container
        html +=
          '<div id="jspsych-survey-vas-hline-' + i + '" ' +
          'data-markerpos="null" ' +
          'data-qname="' + (question.name ?? ('Q' + question_order[i])) + '" ' +
          'data-required="' + question.required + '" ' +
          'style="position: relative; ' +
          'background: ' + trial.scale_colour + "; " +
          'width: ' + trial.hline_pct + '%; ' +
          'left: ' + (100 - trial.hline_pct)/2 + '%; ' + // Keep the horizontal line centred within clickable region
          'height: 2px; ' +
          'top: ' + (trial.scale_height / 2 - 1) + 'px; ' +
          '">';
        // Draw response marker, but hide it at first
        var svg = '<svg width="' + trial.marker_size + '" height="' + trial.marker_size + '" ' + 
          'id="jspsych-survey-vas-marker-' + i + '" style="visibility: hidden; position: absolute; left: 0px; top: ' + -(trial.marker_size/2 - 1) + 'px; ' +
          'xmlns="http://www.w3.org/2000/svg">';
        if (trial.marker_type == 'vline') {
          svg += '<line x1="' + (trial.marker_size/2) + '" x2="' + (trial.marker_size/2) + '" y1="0" y2="' + trial.marker_size + '" ' + trial.marker_svg_attrs + '/>';
        } else if (trial.marker_type == 'cross') {
          svg += '<line x1="1" y1="1" x2="' + (trial.marker_size - 1) + '" y2="' + (trial.marker_size - 1) + '" ' + trial.marker_svg_attrs + '/>' +
            '<line x1="1" y1="' + (trial.marker_size - 1) + '" x2="' + (trial.marker_size - 1) + '" y2="1" ' + trial.marker_svg_attrs + '/>';
        } else if (trial.marker_type == 'circle') {
          svg += '<circle cx="' + (trial.marker_size/2) + '" cy="' + (trial.marker_size/2) + '" r="' + (trial.marker_size/2 - 2) + '" fill="none" ' + trial.marker_svg_attrs + '/>';
        } else if (trial.marker_type == 'square') {
          svg += '<rect width="' + (trial.marker_size - 2) + '" height="' + (trial.marker_size - 2) + '" x="1" y="1" fill="none" ' + trial.marker_svg_attrs + '/>'
        }
        html += svg + '</svg>';
        // Add minor ticks

        if (trial.ticks) {
          var j;
          for (j = 0; j < question.labels.length; j++) {
            var pct_of_range = j * (100 / (question.labels.length - 1));
            html += '<div style="display: inline-block; position: absolute; ' + 
            'left: ' + pct_of_range + '%; ' +
            '">'
            html += '<div style="' +
              'position: absolute; ' +
              'height: ' + trial.scale_height / 2 + "px; " +
              'width: 2px; ' +
              'top: ' + -(trial.scale_height/4 - 1) + "px; " +
              'background: ' + trial.tick_colour + '; ' + 
              'left: -1px; ' +
              '"></div>';
            html += "</div>";
          }
        }

        html += "</div>"; // horizontal line

        // Add labels
        html += '<div style="position: relative; ' + // div to align label centers with appropriate points on horizontal line
          'width: ' + trial.hline_pct + '%; ' +
          'left: ' + (100 - trial.hline_pct)/2 + '%; ' +
          'top: ' + '100%; ' +
           '">';
        for (var j = 0; j < question.labels.length; j++) {
          var percent_of_range = j * (100 / (question.labels.length - 1));
          html += '<div style="display: inline-block; position: absolute; ' + 
          'left: ' + percent_of_range + '%; ' +
          '">'
          // html += '<span style="text-align: center; font-size: 80%">' + trial.labels[j] + "</span>";
          html += '<span style="font-size: 80%; position: relative; left: -50%;">' + question.labels[j] + "</span>";
          html += "</div>";
        }
        html += "</div>"; // special alignment div
        
        html += "</div>"; // clickable region
      }

      html += "</div>"; // response container
      html += "</div>"; // response wrapper

      // Submit button
      html +=
        '<button id="jspsych-survey-vas-next" class="jspsych-btn" ' +
        (any_questions_required ? "disabled" : "") +
        ">" +
        trial.button_label +
        "</button>";

      display_element.innerHTML = html;

      // Dragging makes an ugly "operation forbidden" cursor appear---easiest to just prevent any dragging
      document.addEventListener("dragstart", function(e) {e.preventDefault()});


      if (trial.marker_draggable) {
        // Track mouse state---whether to respond to mouse position depends on mouse position
        var mouse_state = "up"; // or "down"
        document.addEventListener("mousedown", function() {mouse_state = 'down'});
        // document.addEventListener("dblclick", function() {mouse_state = 'down'});
        document.addEventListener("mouseup", function() {mouse_state = 'up'});
        document.addEventListener("dragend", function() {mouse_state = 'up'});
      }
      // Function to make a single VAS responsive
      function make_vas_responsive(i) {
        var clickable = document.getElementById("jspsych-survey-vas-clickable-" + i);
        var update_fn = get_vas_update_fn(i);
        // Default interaction listeners
        clickable.addEventListener("mousedown", update_fn);
        clickable.addEventListener("touchstart", update_fn);
        // Logic is more complex for dragging
        if (trial.marker_draggable) {
          function drag_update(e, test_mouse_state) {
            var do_update = true;
            test_mouse_state = test_mouse_state ?? true; // test by default
            if (test_mouse_state) {
              if (mouse_state == 'up') {
                do_update = false
              }
            }
            if (do_update) {
              update_fn(e);
            }
          }
          clickable.addEventListener("mousemove", drag_update);
          clickable.addEventListener("drag", drag_update);
          clickable.addEventListener("touchmove", function(e) {
            e.preventDefault(); // So that whole screen doesn't move in MS Edge
            drag_update(e, false) // Don't test whether mouse is down
          });
        }
      }

      // Make all the VASs responsive
      var i;
      for (i = 0; i < trial.questions.length; i++) {
        make_vas_responsive(i);
      }

      function end_trial() {
        // gather data from questions
        var response = {};
        var i;
        for (i = 0; i < trial.questions.length; i++) {
          var hline = document.getElementById('jspsych-survey-vas-hline-' + question_order[i]);
          response[hline.dataset.qname] = hline.dataset.markerpos;
        }
        // save data
        var trialdata = {
          rt: Math.round(endTime - startTime),
          response: JSON.stringify(response),
          question_order: JSON.stringify(question_order)
        };

        // next trial
        jsPsych.finishTrial(trialdata);
      }

      var continue_button = document.getElementById("jspsych-survey-vas-next");
      continue_button.onclick = function () {
        // measure response time
        endTime = performance.now();
        // end trial
        end_trial();
      };

      var endTime;
      var startTime = performance.now();
    }
  }
  jsPsychsSurveyVas.info = info;

  return jsPsychsSurveyVas;
})(jsPsychModule);
