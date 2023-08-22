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
          pretty_name: "Question name",
          default: "",
        },
      },
    },
    /** If true, the order of the questions in the 'questions' array will be randomized. */
    randomize_question_order: {
      type: ParameterType.BOOL,
      pretty_name: "Randomize question order",
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
    /** Whether the lowest response anchor is scored as zero (if true) or one (if false). */
    zero_indexed: {
      type: ParameterType.BOOL,
      pretty_name: "Zero-indexed",
      default: false,
    },
    /** Width of the likert scales in pixels. */
    scale_width: {
      type: ParameterType.INT,
      pretty_name: "Scale width",
      default: 960,
    },
    /** The percentage of the scale width allocated to the question prompts. */
    prompt_width: {
      type: ParameterType.FLOAT,
      pretty_name: "Item width",
      default: 50,
    },
    /** The number of items after which the scale labels are repeated. */
    labels_repeat: {
      type: ParameterType.INT,
      pretty_name: "Scale repeat",
      default: 10,
    },
    /** Color of question background on hover (hex or rgb(r,g,b)). */
    hover_color: {
      type: ParameterType.STRING,
      pretty_name: "Hover color",
      default: "#DEE8EB",
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
 * @see {@link https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-survey-grid/docs/jspsych-survey-grid.md}
 */
class SurveyGridPlugin {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    //---------------------------------------//
    // Section 1: Define plugin HTML / CSS
    //---------------------------------------//

    // initialize HTML
    var html = "";

    // define CSS constants
    const n_labels = trial.labels.length; // Number of response options
    const w1 = trial.prompt_width; // Width of item prompt (percentage)
    const w2 = (100 - trial.prompt_width) / n_labels; // Width of item response (percentage)

    // inject CSS for trial
    html += '<style id="jspsych-survey-grid-css">';
    html += `.jspsych-survey-grid-preamble {display: block; width: ${trial.scale_width}px; font-size: 16px; padding-top: 40px; margin-bottom: 10px;}`;
    html += `.jspsych-survey-grid-container {display: grid; grid-template-columns: ${w1}% repeat(${n_labels}, ${w2}%); grid-template-rows: auto; width: ${trial.scale_width}px; background-color: #F8F8F8; border-radius: 8px;}`;
    html += ".jspsych-survey-grid-row {display: contents;}";
    html += `.jspsych-survey-grid-row:hover div {background-color: ${trial.hover_color};}`;
    html +=
      ".jspsych-survey-grid-label {padding: 18px 0 0 0; text-align: center; font-size: 15px; line-height: 1.1em;}";
    html +=
      ".jspsych-survey-grid-prompt {padding: 12px 0 12px 15px; text-align: left; font-size: 16px; line-height: 1.1em; justify-items: center;}";
    html +=
      ".jspsych-survey-grid-opt {padding: 12px 0 12px 0; text-align: center; line-height: 1.15em; justify-items: center;}";
    html +=
      '.jspsych-survey-grid-opt input[type="radio"] {position: relative; width: 18px; height: 18px}';
    html +=
      ".jspsych-survey-grid-opt .pseudo-input {position: relative; height: 0px; width: 0px; display: inline-block;}";
    html += `.jspsych-survey-grid-opt .pseudo-input:after {position: absolute; left: 6.5px; top: -6px; height: 2px; width: calc(${
      trial.scale_width
    }px * ${w2 / 100} - 100%); background: #d8dcd6; content: "";}`;
    html += ".jspsych-survey-grid-opt:last-child .pseudo-input:after {display: none;}";
    html += `.jspsych-survey-grid-footer {width: ${trial.scale_width}px; text-align: right;}`;
    html +=
      ".jspsych-survey-grid-footer input[type=submit] {background-color: #F0F0F0; padding: 8px 20px; margin: 5px 0px 20px 0px; border: none; border-radius: 4px; font-size: 13px; color: black;}";
    html +=
      ".jspsych-survey-grid-contact {position: absolute; top: 0%; -webkit-transform: translate3d(0, -100%, 0); transform: translate3d(0, -100%, 0);}";
    html += "</style>";

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
      // add response header (every `trial.labels_repeat` items)
      if (i % trial.labels_repeat == 0) {
        html += '<div class="jspsych-survey-grid-label"></div>';
        for (var j = 0; j < trial.labels.length; j++) {
          html += '<div class="jspsych-survey-grid-label">' + trial.labels[j] + "</div>";
        }
      }

      // initialize row of survey grid
      html += '<div class="jspsych-survey-grid-row">';

      // define question
      var id = question_order[i];
      var question = trial.questions[id];

      // define question name (prepend zeros based on number of items)
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

    // add final item (not real)
    html += '<div class="jspsych-survey-grid-contact" tabindex="-1">';
    for (var j = 0; j < trial.labels.length; j++) {
      html += `<input type="radio" name="q${trial.questions.length + 1}" order="${
        trial.questions.length + 1
      }" pos="${j}" value="${j}" tabindex="-1">`;
    }
    html += "</div>";

    // end form
    html += "</form>";

    // display HTML
    display_element.innerHTML = html;

    //---------------------------------------//
    // Section 2: Response handling
    //---------------------------------------//

    // scroll to top of screen.
    window.onbeforeunload = function () {
      window.scrollTo(0, 0);
    };

    // add radio event listeners (required to log all radio button events)
    document
      .querySelectorAll('#jspsych-survey-grid-form .jspsych-survey-grid-opt input[type="radio"]')
      .forEach((radio) => {
        radio.addEventListener("click", recordPageEvent);
      });

    // add submit event listener (required to process responses on submission)
    display_element.querySelector("#jspsych-survey-grid-form").addEventListener("submit", (e) => {
      // Wait for response
      e.preventDefault();

      // Remove event listeners
      document
        .querySelectorAll('#jspsych-survey-grid-form .jspsych-survey-grid-opt input[type="radio"]')
        .forEach((radio) => {
          radio.addEventListener("click", recordPageEvent);
        });

      // Measure page time
      var end_time = performance.now();
      var page_time = Math.round(end_time - start_time);

      // store repsonses
      var question_data = [];
      document
        .querySelectorAll(
          '#jspsych-survey-grid-form .jspsych-survey-grid-opt input[type="radio"]:checked'
        )
        .forEach((radio) => {
          const name = radio.getAttribute("name");
          const item_pos = parseInt(radio.getAttribute("order"));
          const resp_pos = parseInt(radio.getAttribute("pos"));
          const response = parseInt(radio.getAttribute("value"));
          question_data.push({
            name: name,
            item_pos: item_pos,
            resp_pos: resp_pos,
            response: response,
          });
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
        page_events: page_events,
        diagnostics: diagnostics,
      };

      // update screen
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

    /* Records the identity and timing of any radio button event on the page. */
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

    /*
    A survey honeypot is a hidden question that legitimate participants will not
    see, but a bot or script user will complete. The honeypot question is designed
    to look like a genuine item but, if answered, will reveal a participant as
    using undesirable methods (e.g., form-filling software).
    */
    function detectHoneyPot() {
      // detect checked hidden radio buttons
      var checked_radios = document.querySelectorAll(
        '#jspsych-survey-grid-form .jspsych-survey-grid-contact input[type="radio"]:checked'
      );

      // return number of checked buttons
      return checked_radios.length;
    }

    /*
    Straight-lining is defined as choosing the same response option (by position)
    across the entire survey. We detect this pattern by identifying the maximum
    fraction of responses of the same response option position.
    */
    function detectStraightLining(trial, question_data) {
      // initialize counts
      let counts = trial.labels.map((x) => 0);

      // count number of instances per response option
      question_data.forEach((q) => {
        counts[q["resp_pos"]]++;
      });

      // compute and return maximum fraction
      return Math.max(...counts) / question_data.length;
    }

    /*
    Zig-zagging is defined as choosing adjacent response options (by position)
    such that a diagonal pattern emerges across responses (i.e., the zig-zag).
    We detect this pattern by identifying the fraction of responses that exhibit
    response adjacency (including wrapping).
    */
    function detectZigZagging(trial, question_data) {
      // initialize score
      let score = 0;

      // compute distance between adjacent responses
      for (let i = 0; i < question_data.length - 1; i++) {
        let a = parseInt(question_data[i]["resp_pos"]);
        let b = parseInt(question_data[i + 1]["resp_pos"]);
        let delta = Math.abs(a - b);
        if (delta == 1 || delta == trial.labels.length - 1) {
          score++;
        }
      }

      // compute and return fraction
      return score / (question_data.length - 1);
    }
  }
}

export default SurveyGridPlugin;
