import { version } from "./package.json";

var _globalName_ = (function (jspsych) {
  "use strict";

  const info = {
    name: "{name}",
    version: version,
    parameters: {
      /** This comment will be scraped as docs for parameter_name when running generating the JsPsych docs.  */
      parameter_name: {
        type: jspsych.ParameterType.INT,
        default: undefined,
      },
      /** This comment will be scraped as docs for parameter_name2 when running generating the JsPsych docs.  */
      parameter_name2: {
        type: jspsych.ParameterType.IMAGE,
        default: undefined,
      },
    },
    data: {
      /** This comment will be scraped as metadata for data_name when running the metadata module.  */
      data_name: {
        type: jspsych.ParameterType.INT,
      },
      /** This comment will be scraped as metadata for data_name2 when running the metadata module.  */
      data_name2: {
        type: jspsych.ParameterType.STRING,
      },
    },
  };

  /**
   * **{name}**
   *
   * {description}
   *
   * @author {author}
   * @see {@link {documentation-url}}
   */
  class PluginNamePlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {
      // data saving
      var trial_data = {
        data_name: 99, // Make sure this type and name matches data_name
        data_name2: "hello world!", // Make this this type and name matches data_name2
      };
      // end trial
      this.jsPsych.finishTrial(trial_data);
    }
  }
  PluginNamePlugin.info = info;

  return PluginNamePlugin;
})(jsPsychModule);
