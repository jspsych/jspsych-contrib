import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "survey-grid",
  parameters: {
    /** Array containing one or more objects with parameters for the question(s) that should be shown on the page. */
    questions: {
      type: ParameterType.COMPLEX,
      array: true,
      pretty_name: "Questions",
      nested: {
        /** HTML-formatted question prompt. */
        prompt: {
          type: ParameterType.HTML_STRING,
          pretty_name: "Prompt",
          default: undefined,
        },
        /** Whether or not a response to this question should be reverse-scored. */
        reverse: {
          type: ParameterType.BOOL,
          pretty_name: "Reverse",
          default: false,
        },
        /** Whether or not a response to this question must be given in order to continue. */
        required: {
          type: ParameterType.BOOL,
          pretty_name: "Required",
          default: true,
        },
        /** Name of the question in the trial data. If no name is given, the questions are named Q1, Q2, etc. */
        name: {
          type: ParameterType.STRING,
          pretty_name: "Question Name",
          default: "",
        },
      },
    },
    /** If true, the order of the questions in the 'questions' array will be randomized. */
    randomize_question_order: {
      type: ParameterType.BOOL,
      pretty_name: "Randomize Question Order",
      default: false,
    },
    /** The response options associated with the survey. */
    labels: {
      type: ParameterType.HTML_STRING,
      array: true,
      pretty_name: "Labels",
      default: undefined,
    },
    /** HTML-formatted string to display at top of the page above all of the questions. */
    preamble: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Preamble",
      default: null,
    },
    /** Whether the response scale starts with zero (true = 0) or one (false = 0). */
    zero_indexed: {
      type: ParameterType.BOOL,
      pretty_name: "Zero indexed",
      default: true,
    },
    scale_repeat: {
      type: ParameterType.INT,
      pretty_name: "Scale repeat",
      default: 10,
    },
    /** The number of pixels occupied by the survey  */
    survey_width: {
      type: ParameterType.INT,
      pretty_name: "Survey width",
      default: 900,
    },
    /** The percentage of a row occupied by an item text */
    item_width: {
      type: ParameterType.FLOAT,
      pretty_name: "Item width",
      default: 50,
    },
    /** Label of the button to submit responses. */
    button_label: {
      type: ParameterType.STRING,
      pretty_name: "Button label",
      default: "Continue",
    },
  },
};

type Info = typeof info;

/**
 * **survey-grid**
 *
 * jsPsych plugin for gathering responses to questions on a likert scale in a grid format
 *
 * @author Sam Zorowitz
 * @see {@link https://www.jspsych.org/plugins/jspsych-vsl-grid-scene/ vsl-grid-scene plugin documentation on jspsych.org}
 */
class SurveyGridPlugin {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    //---------------------------------------//
    // Section 1: Define plugin HTML / CSS
    //---------------------------------------//

    // Initialize HTML
    var html = "";

    // Define CSS constants
    const n = trial.labels.length; // Number of response options
    const x1 = trial.item_width; // Width of item prompt (percentage)
    const x2 = (100 - trial.item_width) / n; // Width of item response (percentage)

    // inject CSS for trial
    html += `<style>
    .jspsych-survey-grid-preamble {
      width: ${trial.survey_width}px;
      margin: auto;
      font-size: 16px;
      line-height: 1.5em;
    }
    .jspsych-survey-grid-container {
      display: grid;
      grid-template-columns: ${x1}% repeat(${n}, ${x2}%);
      grid-template-rows: auto;
      width: ${trial.survey_width}px;
      margin: auto;
      background-color: #F8F8F8;
      border-radius: 8px;
    }
    .jspsych-survey-grid-row {
      display: contents;
    }
    .jspsych-survey-grid-row:hover div {
      background-color: #dee8eb;
    }
    .jspsych-survey-grid-header {
      padding: 18px 0 0px 0;
      text-align: center;
      font-size: 14px;
      line-height: 1.15em;
    }
    .jspsych-survey-grid-prompt {
      padding: 12px 0 12px 15px;
      text-align: left;
      font-size: 15px;
      line-height: 1.15em;
      justify-items: center;
    }
    .jspsych-survey-grid-opt {
      padding: 12px 0 12px 0;
      font-size: 13px;
      text-align: center;
      line-height: 1.15em;
      justify-items: center;
    }
    .jspsych-survey-grid-opt input[type='radio'] {
      position: relative;
      width: 16px;
      height: 16px;
    }
    .jspsych-survey-grid-opt .pseudo-input {
      position: relative;
      height: 0px;
      width: 0px;
      display: inline-block;
    }
    .jspsych-survey-grid-opt .pseudo-input:after {
      position: absolute;
      left: 6.5px;
      top: -6px;
      height: 2px;
      width: calc(${trial.survey_width}px * ${x2 / 100} - 100%);
      background: #d8dcd6;
      content: "";
    }
    .jspsych-survey-grid-opt:last-child .pseudo-input:after {
      display: none;
    }
    .jspsych-survey-grid-footer {
      margin: auto;
      width: ${trial.survey_width}px;
      padding: 0 0 0 0;
      text-align: right;
    }
    .jspsych-survey-grid-footer input[type=submit] {
      background-color: #F0F0F0;
      padding: 8px 20px;
      border: none;
      border-radius: 4px;
      margin-top: 5px;
      margin-bottom: 20px;
      margin-right: 0px;
      font-size: 13px;
      color: black;
    }
    .jspsych-survey-grid-block {
      position: absolute;
      top: 0%;
      -webkit-transform: translate3d(0, -100%, 0);
      transform: translate3d(0, -100%, 0);
    }
    </style>`;

    // add preamble
    html += '<div class="jspsych-survey-grid-preamble">';
    html += "<p>" + trial.preamble + "<p>";
    html += "</div>";

    // initialize form
    html += '<form name="jspsych-survey-grid" id="jspsych-survey-grid-form">';

    // initialize grid container
    html += '<div class="jspsych-survey-grid-container">';

    // define question order.
    var question_order = [];
    for (var i = 0; i < trial.questions.length; i++) {
      question_order.push(i);
    }
    if (trial.randomize_question_order) {
      question_order = this.jsPsych.randomization.shuffle(question_order);
    }

    // iteratively add items
    for (var i = 0; i < trial.questions.length; i++) {
      // add response header (every `trial.scale_repeat` items)
      if (i % trial.scale_repeat == 0) {
        html += '<div class="jspsych-survey-grid-header"></div>';
        for (var j = 0; j < trial.labels.length; j++) {
          html += '<div class="jspsych-survey-grid-header">' + trial.labels[j] + "</div>";
        }
      }

      // initialize row of survey grid
      html += '<div class="jspsych-survey-grid-row">';

      // define question
      var id = question_order[i];
      var question = trial.questions[id];

      // define question name
      if (!question.name) {
        question["name"] =
          "q" + (id + 1 + "").padStart(Math.ceil(Math.log10(trial.questions.length)), "0");
      }

      // define respose values
      var response_values = [];
      for (var j = 0; j < trial.labels.length; j++) {
        response_values.push(j);
      }
      if (!trial.zero_indexed) {
        response_values = response_values.map((v) => v + 1);
      }
      if (question.reverse) {
        response_values = response_values.reverse();
      }

      // add item prompt
      html += '<div class="jspsych-survey-grid-prompt">' + question.prompt + "</div>";

      // add response options
      for (var j = 0; j < response_values.length; j++) {
        html += '<div class="jspsych-survey-grid-opt">';
        html += '<div class="pseudo-input"></div>';
        html += `<input type="radio" name="${question.name}" order="${i}" pos="${j}" value="${
          response_values[j]
        }" tabindex="-1" ${question.required ? "required" : ""}>`;
        html += "</div>";
      }

      // end row
      html += "</div>";
    }
    html += "</div>";

    // add submit button
    html += '<div class="jspsych-survey-grid-footer">';
    html += `<input type="submit" value="${trial.button_label}"></input>`;
    html += "</div>";

    // add final item
    html += '<div class="jspsych-survey-grid-block" tabindex="-1">';
    for (var j = 0; j < trial.labels.length; j++) {
      html += `<input type="radio" name="q${trial.questions.length + 1}" order="${
        trial.questions.length + 1
      }" pos="${j}" value="${j}" tabindex="-1">`;
    }
    html += "</div>";

    // end form
    html += "</form>";

    // Display HTML
    display_element.innerHTML = html;

    //---------------------------------------//
    // Section 2: Response handling
    //---------------------------------------//

    // Scroll to top of screen.
    window.onbeforeunload = function () {
      window.scrollTo(0, 0);
    };

    // add event listeners
    document
      .querySelectorAll('#jspsych-survey-grid-form .jspsych-survey-grid-opt input[type="radio"]')
      .forEach((radio) => {
        radio.addEventListener("click", recordPageEvent);
      });

    display_element.querySelector("#jspsych-survey-grid-form").addEventListener("submit", (e) => {
      // Wait for response
      e.preventDefault();

      // Remove event listeners
      // document.removeEventListener("click", recordPageEvent);
      document
        .querySelectorAll('#jspsych-survey-grid-form .jspsych-survey-grid-opt input[type="radio"]')
        .forEach((radio) => {
          radio.addEventListener("click", recordPageEvent);
        });

      // Measure page time
      var end_time = performance.now();
      var page_time = Math.round(end_time - start_time);

      // create object to hold responses
      var question_data = [];
      document
        .querySelectorAll(
          '#jspsych-survey-grid-form .jspsych-survey-grid-opt input[type="radio"]:checked'
        )
        .forEach((radio) => {
          const name = radio.getAttribute("name");
          const order = parseInt(radio.getAttribute("order"));
          const pos = parseInt(radio.getAttribute("pos"));
          const response = parseInt(radio.getAttribute("value"));
          question_data.push({ name: name, order: order, pos: pos, response: response });
        });

      // define diagnostic data
      var diagnostics = {
        page_time: page_time,
        honeypot: detectHoneyPot(),
        straightlining: detectStraightLining(trial, question_data),
        zigzagging: detectZigZagging(trial, question_data),
      };

      // save data
      var trial_data = {
        responses: question_data,
        page_time: page_time,
        page_events: page_events,
        diagnostics: diagnostics,
      };

      // Update screen
      display_element.innerHTML = "";

      // next trial
      this.jsPsych.finishTrial(trial_data);
    });

    // record start time
    var start_time = performance.now();

    // preallocate space
    var page_events = [];

    //---------------------------------------//
    // Section 3: Convenience functions
    //---------------------------------------//

    function recordPageEvent(event) {
      // record event time
      var event_time = Math.round(performance.now() - start_time);

      // record event target
      var event_target =
        event.srcElement.getAttribute("name") + "_" + event.srcElement.getAttribute("pos");

      // store event info
      page_events.push({
        event_target: event_target,
        event_time: event_time,
      });
    }

    function detectHoneyPot() {
      // detect checked hidden radio buttons
      var checked_radios = document.querySelectorAll(
        '#jspsych-survey-grid-form .jspsych-survey-grid-block input[type="radio"]:checked'
      );

      // return number of checked buttons
      return checked_radios.length;
    }

    // Straight-lining is defined as choosing the same response option (by position)
    // across the entire survey. We detect this pattern by identifying the maximum
    // percentage of responses loading onto the same item position.
    function detectStraightLining(trial, question_data) {
      // Initialize counts
      let counts = trial.labels.map((x) => 0);

      // Count number of instances per response option
      question_data.forEach((q) => {
        counts[q["pos"]]++;
      });

      // Compute and return maximum fraction
      return Math.max(...counts) / question_data.length;
    }

    // Zig-zagging is defined as choosing adjacent response options (by position)
    // such that a diagonal pattern emerges across responses (i.e. the zig-zag).
    // We detect this pattern by identifying the fraction of responses that exhibit
    // response adjacency (including wrapping).
    function detectZigZagging(trial, question_data) {
      // Initialize score
      let score = 0;

      // Compute distance between adjacent responses
      for (let i = 0; i < question_data.length - 1; i++) {
        let a = parseInt(question_data[i]["pos"]);
        let b = parseInt(question_data[i + 1]["pos"]);
        let delta = Math.abs(a - b);
        if (delta == 1 || delta == trial.labels.length - 1) {
          score++;
        }
      }

      // Compute and return fraction
      return score / (question_data.length - 1);
    }
  }
}

export default SurveyGridPlugin;
