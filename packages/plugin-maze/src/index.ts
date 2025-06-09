import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "maze",
  version: version,
  parameters: {
    /** Provide a clear description of the parameter_name that could be used as documentation. We will eventually use these comments to automatically build documentation and produce metadata. */
    sent: {
      type: ParameterType.STRING, // BOOL, STRING, INT, FLOAT, FUNCTION, KEY, KEYS, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
      default: "hello, world",
    },
  },
  data: {
    /** Provide a clear description of the data1 that could be used as documentation. We will eventually use these comments to automatically build documentation and produce metadata. */
    bottles_of_beer_on_the_wall: {
      type: ParameterType.INT,
    },
  },
  // prettier-ignore
  citations: '__CITATIONS__',
};

type Info = typeof info;

/**
 * **maze**
 *
 * A jsPsych plugin for running Maze experiments
 *
 * @author Morgan Grobol
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-maze/README.md}}
 */
class MazePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    display_element.innerHTML = `<div>${trial.sent}</div>`;

    // data saving
    const trial_data = {
      // Make sure this type and name matches the information contained within the info const.
      bottles_of_beer_on_the_wall: 99,
    };

    // function to handle responses by the participant
    const after_response = (info: { rt: any }) => {
      end_trial();
    };

    // end trial
    const end_trial = () => {
      // kill any remaining keyboard listeners
      this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      this.jsPsych.finishTrial(trial_data);
    };

    const keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: after_response,
      valid_responses: [" "],
      rt_method: "performance",
      persist: false,
      allow_held_key: false,
    });
  }
}

export default MazePlugin;
