import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "survey-number",
  version: version,
  parameters: {
    questions: {
      type: ParameterType.COMPLEX,
      array: true,
      pretty_name: "Questions",
      default: undefined,
      nested: {
        /** Question prompt. */
        prompt: {
          type: ParameterType.HTML_STRING,
          pretty_name: "Prompt",
          default: undefined,
        },
        /** Placeholder text in the response text box. */
        placeholder: {
          type: ParameterType.STRING,
          pretty_name: "Placeholder",
          default: "",
        },
        /** The number of rows for the response text box. */
        rows: {
          type: ParameterType.INT,
          pretty_name: "Rows",
          default: 1,
        },
        /** The number of columns for the response text box. */
        columns: {
          type: ParameterType.INT,
          pretty_name: "Columns",
          default: 40,
        },
        /** Whether or not a response to this question must be given in order to continue. */
        required: {
          type: ParameterType.BOOL,
          pretty_name: "Required",
          default: false,
        },
        /** Name of the question in the trial data. If no name is given, the questions are named Q0, Q1, etc. */
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
    /** HTML-formatted string to display at top of the page above all of the questions. */
    preamble: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Preamble",
      default: null,
    },
    /** Label of the button to submit responses. */
    button_label: {
      type: ParameterType.STRING,
      pretty_name: "Button label",
      default: "Continue",
    },
    /** Setting this to true will enable browser auto-complete or auto-fill for the form. */
    autocomplete: {
      type: ParameterType.BOOL,
      pretty_name: "Allow autocomplete",
      default: false,
    },
  },
  data: {
    /** The response time in milliseconds for the participant to make a response.
     * The time is measured from when the stimulus first appears on the screen until the participant's response. */
    rt: {
      type: ParameterType.INT,
    },
    /** An object containing the string of the response given by the participant. */
    response: {
      type: ParameterType.OBJECT,
    },
  },
};

type Info = typeof info;

/**
 * **survey-number**
 *
 * Collects a number response in a text box
 *
 * @author Josh de Leeuw
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-survey-number/README.md}}
 */
class SurveyNumberPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    for (var i = 0; i < trial.questions.length; i++) {
      if (typeof trial.questions[i].rows == "undefined") {
        trial.questions[i].rows = 1;
      }
    }
    for (var i = 0; i < trial.questions.length; i++) {
      if (typeof trial.questions[i].columns == "undefined") {
        trial.questions[i].columns = 40;
      }
    }
    for (var i = 0; i < trial.questions.length; i++) {
      if (typeof trial.questions[i].value == "undefined") {
        trial.questions[i].value = "";
      }
    }
    var html = "";
    // show preamble text
    if (trial.preamble !== null) {
      html +=
        '<div id="jspsych-survey-text-preamble" class="jspsych-survey-text-preamble">' +
        trial.preamble +
        "</div>";
    }
    // start form
    if (trial.autocomplete) {
      html += '<form id="jspsych-survey-text-form">';
    } else {
      html += '<form id="jspsych-survey-text-form" autocomplete="off">';
    }
    // generate question order
    var question_order = [];
    for (var i = 0; i < trial.questions.length; i++) {
      question_order.push(i);
    }
    if (trial.randomize_question_order) {
      question_order = this.jsPsych.randomization.shuffle(question_order);
    }
    // add questions
    for (var i = 0; i < trial.questions.length; i++) {
      var question = trial.questions[question_order[i]];
      var question_index = question_order[i];
      html +=
        '<div id="jspsych-survey-text-' +
        question_index +
        '" class="jspsych-survey-text-question" style="margin: 2em 0em;">';
      html += '<p class="jspsych-survey-text">' + question.prompt + "</p>";
      var autofocus = i == 0 ? "autofocus" : "";
      var req = question.required ? "required" : "";
      if (question.rows == 1) {
        html +=
          '<input type="number" id="input-' +
          question_index +
          '"  name="#jspsych-survey-text-response-' +
          question_index +
          '" data-name="' +
          question.name +
          '" size="' +
          question.columns +
          '" ' +
          autofocus +
          " " +
          req +
          ' placeholder="' +
          question.placeholder +
          '"></input>';
      } else {
        html +=
          '<textarea id="input-' +
          question_index +
          '" name="#jspsych-survey-text-response-' +
          question_index +
          '" data-name="' +
          question.name +
          '" cols="' +
          question.columns +
          '" rows="' +
          question.rows +
          '" ' +
          autofocus +
          " " +
          req +
          ' placeholder="' +
          question.placeholder +
          '"></textarea>';
      }
      html += "</div>";
    }
    // add submit button
    html +=
      '<input type="submit" id="jspsych-survey-text-next" class="jspsych-btn jspsych-survey-text" value="' +
      trial.button_label +
      '"></input>';
    html += "</form>";
    display_element.innerHTML = html;
    // backup in case autofocus doesn't work
    (display_element.querySelector("#input-" + question_order[0]) as HTMLInputElement).focus();
    display_element.querySelector("#jspsych-survey-text-form").addEventListener("submit", (e) => {
      e.preventDefault();
      // measure response time
      var endTime = performance.now();
      var response_time = Math.round(endTime - startTime);
      // create object to hold responses
      var question_data = {};
      for (var index = 0; index < trial.questions.length; index++) {
        var id = "Q" + index;
        var q_element: HTMLInputElement | HTMLTextAreaElement = document
          .querySelector("#jspsych-survey-text-" + index)
          .querySelector("textarea, input");
        var val = q_element.value;
        var name = q_element.attributes["data-name"].value;
        if (name == "") {
          name = id;
        }
        var obje = {};
        obje[name] = val;
        Object.assign(question_data, obje);
      }
      // save data
      var trialdata = {
        rt: response_time,
        response: question_data,
      };

      // next trial
      this.jsPsych.finishTrial(trialdata);
    });
    var startTime = performance.now();
  }
}

export default SurveyNumberPlugin;
