import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "{name}",
  version: version,
  parameters: {
    /** This comment will be scraped as docs for parameter_name when running generating the JsPsych docs.  */
    parameter_name: {
      type: ParameterType.INT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEY, KEYS, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
      default: undefined,
    },
    /** This comment will be scraped as docs for parameter_name when running generating the JsPsych docs.  */
    parameter_name2: {
      type: ParameterType.IMAGE,
      default: undefined,
    },
  },
  data: {
    /** This comment will be scraped as metadata for data_name when running the metadata module.  */
    data_name: {
      type: ParameterType.INT,
    },
    /** This comment will be scraped as metadata for data_name2 when running the metadata module.  */
    data_name2: {
      type: ParameterType.STRING,
    },
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
      data_name: 99, // Make sure this type and name matches data_name
      data_name2: "hello world!", // Make this this type and name matches data_name2
    };

    // end trial
    this.jsPsych.finishTrial(trial_data);
  }
}

export default PluginNamePlugin;
