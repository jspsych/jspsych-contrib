import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "{name}",
  version: version,
  parameters: {
    /** Provide a clear description of the parameter_name that could be used as documentation. We will eventually use these comments to automatically build documentation and produce metadata. */
    parameter_name: {
      type: ParameterType.INT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEY, KEYS, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
      default: undefined,
    },
    /** Provide a clear description of the parameter_name2 that could be used as documentation. We will eventually use these comments to automatically build documentation and produce metadata. */
    parameter_name2: {
      type: ParameterType.IMAGE,
      default: undefined,
    },
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
    citation: `{citationJson}`,
  },
};

type Info = typeof info;

/**
 * **{name}**
 *
 * {description}
 *
 * @author {author}
 * @see {@link {documentation-url}}}
 */
class PluginNamePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // data saving
    var trial_data = {
      data1: 99, // Make sure this type and name matches the information for data1 in the data object contained within the info const.
      data2: "hello world!", // Make sure this type and name matches the information for data2 in the data object contained within the info const.
    };

    // end trial
    this.jsPsych.finishTrial(trial_data);
  }
}

export default PluginNamePlugin;
