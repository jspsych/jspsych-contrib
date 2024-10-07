import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "spr",
  version: version,
  parameters: {
    /** Provide a clear description of the parameter_name that could be used as documentation. We will eventually use these comments to automatically build documentation and produce metadata. */
    reading_string: {
      type: ParameterType.STRING, // BOOL, STRING, INT, FLOAT, FUNCTION, KEY, KEYS, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
      default: undefined,
    },
    // /** Provide a clear description of the parameter_name2 that could be used as documentation. We will eventually use these comments to automatically build documentation and produce metadata. */
    // parameter_name2: {
    //   type: ParameterType.IMAGE,
    //   default: undefined,
    // },
  },
  data: {
    /** Provide a clear description of the data1 that could be used as documentation. We will eventually use these comments to automatically build documentation and produce metadata. */
    data1: {
      type: ParameterType.INT,
    },
    /** Provide a clear description of the data2 that could be used as documentation. We will eventually use these comments to automatically build documentation and produce metadata. */
    data2: {
      type: ParameterType.STRING,
    },
  },
};

type Info = typeof info;

/**
 * **spr**
 *
 * This is a package built to enable self   paced reading
 *
 * @author Victor Zhang
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-spr/README.md}}
 */
class SprPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var html = `<p>does this work</p>`;

    display_element.innerHTML = html;

    // data saving
    var trial_data = {
      data1: 99, // Make sure this type and name matches the information for data1 in the data object contained within the info const.
      data2: "hello world!", // Make sure this type and name matches the information for data2 in the data object contained within the info const.
    };
    // end trial
    // this.jsPsych.finishTrial(trial_data);
  }
}

export default SprPlugin;
