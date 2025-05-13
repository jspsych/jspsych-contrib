import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "plugin-mindless-clicking",
  version: version,
  parameters: {
    /** The number of times the button must be clicked before proceeding */
    required_clicks: {
      type: ParameterType.INT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEY, KEYS, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
      default: undefined,
    },
    /** The text on the button */
    button_text: {
      type: ParameterType.STRING,
      default: "Click me!",
    },
  },
  data: {
    /** The total time to click the button the required number of times */
    rt: {
      type: ParameterType.INT,
    },
  },
  // When you run build on your plugin, citations will be generated here based on the information in the CITATION.cff file.
  citations: '__CITATIONS__',
};

type Info = typeof info;

/**
 * **plugin-mindless-clicking**
 *
 * Participants click on a button many times
 *
 * @author Josh de Leeuw
 * @see {@link /plugin-mindless-clicking/README.md}}
 */
class MindlessClickingPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    const start_time = performance.now();
    let clicks = 0;

    const html = `<div>
      <button id="jspsych-mindless-clicking-button" class="jspsych-btn">${trial.button_text}</button>
      <p id="jspsych-mindless-clicking-text">Click the button ${trial.required_clicks} more times to continue.</p>
    </div>`;
    display_element.innerHTML = html;

    const update_display = () => {
      const text_element = display_element.querySelector("#jspsych-mindless-clicking-text");
      text_element.innerHTML = `Click the button ${trial.required_clicks - clicks} more times to continue.`;
    }

    const button_click_listener = () => {
      clicks++;
      update_display();
      if (clicks == trial.required_clicks) {
        this.jsPsych.finishTrial({
          rt: performance.now() - start_time,
          clicks: clicks,
        })
      }
    }

    const button = display_element.querySelector("#jspsych-mindless-clicking-button");
    button.addEventListener("click", button_click_listener);
  }

}

export default MindlessClickingPlugin;
