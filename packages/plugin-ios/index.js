var jsPsychIos = (function (jspsych) {
  "use strict";

  const info = {
    name: "ios",
    parameters: {
      prompt: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Prompt",
        default: undefined,
      },
      movable_circle: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Movable circle",
        default: 'right',
      },
      both_move: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Both circles move?",
        default: 'one',
      },
      front_circle: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Front circle",
        default: 'right',
      },
      left_label: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Left circle label",
        default: '[left_label]',
      },
      right_label: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Right circle label",
        default: '[right_label]',
      },
      left_diam: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Left circle diameter",
        default: 200,
      },
      right_diam: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Right circle diameter",
        default: 200,
      },
      max_sep: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Maximum separation",
        default: 0,
      },
      left_border_width: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Left circle border width",
        default: 2,
      },
      left_border_style: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Left circle border style",
        default: 'solid',
      },
      left_border_col: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Left circle border colour",
        default: 'black',
      },
      left_style: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Left circle style",
        default: '',
      },
      right_border_width: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Right circle border width",
        default: 2,
      },
      right_border_style: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Right circle border style",
        default: 'solid',
      },
      right_border_col: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Right circle border colour",
        default: 'black',
      },
      right_style: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Right circle style",
        default: '',
      },
      arrows: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Arrows",
        default: false,
      },
      cursor: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Cursor when circles clickable",
        default: "crosshair",
      },
      button_label: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Buton label",
        default: "Continue",
      },
      required: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Response required",
        default: false,
      },
      hide_initially: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Hide initially",
        default: false,
      }
    },
  };
  class jsPsychHtmlVasResponsePlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {
      // Useful variables:
      var side_opposites = {'left': 'right', 'right': 'left'};
      var nom_diam = { // Nominal diameters
        'left': trial.left_diam,
        'right': trial.right_diam
      }
      var full_diam = { // Full diameters, accounting for border widths
        'left': trial.left_diam + 2*trial.left_border_width,
        'right': trial.right_diam + 2*trial.right_border_width
      }
      // Create HTML
      var prompt = '<div id="jspsych-ios-prompt" style="margin-bottom: 10px;">' + trial.prompt + "</div>";
      var both_circles_container = '<div id="jspsych-ios-circles-container"' +
        'style="position: relative; margin: auto;' +
        'width: '  + (full_diam.left/2 + full_diam.right/2 + trial.max_sep) + 'px;' +
        'height: ' + Math.max(full_diam.left, full_diam.right) + 'px;' +
        '">';
      // Create both circles
      var both_circles = {'left': null, 'right': null};
      var side;
      for (side in both_circles) {
        var full_border_cmd =
          trial[side + '_border_width'] + 'px ' +
          trial[side + '_border_style'] + ' ' + 
          trial[side + '_border_col'];
        // Create a "surface" on which the circle can "slide"
        var slide_surface = '<div id="jspsych-ios-' + side + '-circle-slide-surface" ' +
          'style= ' +
          '"position: absolute;' +
          'height: ' + Math.max(full_diam.left, full_diam.right) + 'px;' +
          'width: ' + (full_diam.left/2 + full_diam.right/2 + trial.max_sep)*(trial.both_move? 0.5 : 1) + 'px;' +
          'top: 0px;' +
          side + ': 0px;' +
          '">'
        // Create a container for both the circle and label
        var single_circle_container = '<div id="jspsych-ios-' + side + '-circle-container"' +
          'style="position: absolute;' +
          'width: '  + full_diam[side] + 'px;' +
          'height: ' + full_diam[side] + 'px;' + 
          'top: '    + 0.5*(Math.max(full_diam.left, full_diam.right) - full_diam[side]) + 'px;' + // Vertical centering
          side + ': ' + (-full_diam[side]/2) + 'px;' +
          '">'; // They should be pushed to the edges of the parent container
        // Create the label and possibly arrow
        var label_sep = Math.abs(full_diam[side] - full_diam[side_opposites[side]])/2 + 10;
        var arrow;
        if (trial.arrows) {
          arrow =
            '<div style="' + 
              'position: absolute; height: 2px;' + 
              'border-top: 2px solid black;' +
              'width: ' + label_sep + 'px;' +
              side + ': 100%;' +
              'top: ' + (full_diam[side]/2 - trial[side + '_border_width']/2) + 'px;' +
              '">'+
            '</div>';
        } else {
          arrow = '';
        }
        var label = '<div id="jspsych-ios-' + side + '-circle-label"' + 'style="' + 
          'position: absolute;' + 
          'user-select: none;' +
          'height:' + full_diam[side] + 'px;' +
          'line-height:' + full_diam[side] + 'px;' +
          'margin-' + side_opposites[side] + ': ' + label_sep + 'px;' +
          side_opposites[side] + ': 100%">' + // Should be pushed to the edges of the parent container
            trial[side + '_label'] +
            arrow +
          '</div>';
        // Create the circle
        var circle = '<div id="jspsych-ios-' + side + '-circle"' +
          'style="position: absolute; border-radius: 50%;' +
          'height: ' + nom_diam[side] + 'px;' +
          'width: ' +  nom_diam[side] + 'px;' +
          'border: ' + full_border_cmd + ';' +
          trial[side + '_style'] +
          '"></div>';
        // Store it all
        both_circles[side] = 
          slide_surface +
            single_circle_container +
              label + circle +
            '</div>' +
          '</div>';
      }
      // Create a clickable area the doesn't include the circle labels
      var clickable_area = '<div id="jspsych-ios-clickable"' +
        'style="position: absolute;' +
        'height: ' + Math.max(full_diam.left, full_diam.right) + 'px;' +
        'width: ' + ((full_diam.left/2 + full_diam.right/2 + trial.max_sep)*(trial.both_move? 0.5 : 1) + full_diam[trial.movable_circle]) + 'px;' +
        trial.movable_circle + ': ' + (-full_diam[trial.movable_circle]/2) + 'px;' +
        'cursor: ' + trial.cursor + ';' + 
        '"></div>';
      // Submit button
      var submit_button = '<button id="jspsych-ios-next" class="jspsych-btn" ' +
        'style="margin-top: 10px" ' +
        (trial.required ? "disabled" : "") + ">" +
        trial.button_label +
        "</button>";
      // Put it all together
      display_element.innerHTML = 
        prompt +
          both_circles_container +
            // Order correctly
            both_circles[side_opposites[trial.front_circle]] +
            both_circles[trial.front_circle] +
            clickable_area +
          '</div>' +
        '</div>' +
        submit_button;

      // Interactivity
      var ppn_overlap;
      function update_circles(x) {
        // Compute the click x proportional to available space
        var ppn_x;
        var slide_surface = document.getElementById('jspsych-ios-' + trial.movable_circle + '-circle-slide-surface');
        var rect = slide_surface.getBoundingClientRect();
        if (trial.movable_circle == 'left') {
          ppn_x = (x - rect.left) / rect.width;
        } else if (trial.movable_circle == 'right') {
          ppn_x = (rect.right - x) / rect.width;
        }
        if (ppn_x < 0) ppn_x = 0;
        if (ppn_x > 1) ppn_x = 1;
        // Move circles based on click
        move_circle(trial.movable_circle, ppn_x);
        if (trial.both_move) {
          move_circle(side_opposites[trial.movable_circle], ppn_x);
        }
        // Compute proportion overlap, such that max. overlap = 1, 0 overlap = 0, and everything else is negative on the same scale
        var min_score = -trial.max_sep/(0.5*(full_diam.left + full_diam.right))
        var max_score = 1;
        ppn_overlap = min_score + ppn_x*(max_score - min_score);
      }

      function move_circle(side, ppn) {
        var circle = document.getElementById('jspsych-ios-' + side + '-circle-container');
        var slide_surface = document.getElementById('jspsych-ios-' + side + '-circle-slide-surface');
        var rect = slide_surface.getBoundingClientRect();
        if (ppn == 1) {
          circle.style[side] = '';
          circle.style[side_opposites[side]] = -full_diam[side]/2 + 'px';
        } else {
          circle.style[side_opposites[side]] = '';
          circle.style[side] = (ppn*rect.width - full_diam[side]/2) + 'px';
        }
      }

      var clickable_area = document.getElementById('jspsych-ios-clickable');
      var circles_movable = false;
      if (true) {
        circles_movable = true;
        // Hide both
        var side, container;
        for (side in both_circles) {
          container = document.getElementById('jspsych-ios-' + side + '-circle-container');
          container.style.visibility = 'hidden';
        }
        clickable_area.onmouseenter = function(e) {
          for (side in both_circles) {
            container = document.getElementById('jspsych-ios-' + side + '-circle-container');
            container.style.visibility = 'visible';
          }
          update_circles(e.clientX);
          continue_button.disabled = false;
          clickable_area.onmouseenter = undefined;
        }
      }
      // Handle mouse events
      clickable_area.onmousedown = function(e) {
        circles_movable = true;
        update_circles(e.clientX);
        var continue_button = document.getElementById("jspsych-ios-next");
        continue_button.disabled = false;
      }
      clickable_area.onmouseup = function(e) {circles_movable = false}
      clickable_area.onmouseout = function(e) {circles_movable = false}
      clickable_area.onmousemove = function(e) {if (circles_movable) {update_circles(e.clientX)}}    
      // Handle touch events
      clickable_area.ontouchstart = function(e) {
        circles_movable = true;
        update_circles(e.changedTouches[e.changedTouches.length - 1].clientX);
        var continue_button = document.getElementById("jspsych-ios-next");
        continue_button.disabled = false;
      }
      clickable_area.ontouchend = function(e) {circles_movable = false}
      clickable_area.ontouchleave = function(e) {circles_movable = false}
      clickable_area.ontouchmove = function(e) {if (circles_movable) {update_circles(e.changedTouches[e.changedTouches.length - 1].clientX)}}

      // Data storage
      var response = {
        rt: null,
        response: null
      }
      var continue_button = document.getElementById("jspsych-ios-next");
      continue_button.onclick = function() {
        // measure response time
        var endTime = performance.now();
        response.rt = endTime - startTime;
        response.response = ppn_overlap;
        end_trial();
      };
      function end_trial() {
        var trialdata = {
          rt: response.rt,
          prompt: trial.prompt,
          response: response.response
        };
        display_element.innerHTML = "";
        // next trial
        jsPsych.finishTrial(trialdata);
      }
      // Start the RT clock
      var startTime = performance.now();
    }
  }
  jsPsychHtmlVasResponsePlugin.info = info;

  return jsPsychHtmlVasResponsePlugin;
})(jsPsychModule);
