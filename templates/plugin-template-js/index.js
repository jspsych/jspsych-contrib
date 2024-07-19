import { version } from "./package.json";

var _globalName_ = (function (jspsych) {
  "use strict";

  const info = {
    name: "{name}",
    version: version,
    parameters: {
      /** Provide a clear description of the parameter_name that could be used as documentation. We will eventually use these comments to automatically build documentation and produce metadata. */
      parameter_name: {
        type: jspsych.ParameterType.INT,
        default: undefined,
      },
      /** Provide a clear description of the parameter_name2 that could be used as documentation. We will eventually use these comments to automatically build documentation and produce metadata. */
      parameter_name2: {
        type: jspsych.ParameterType.IMAGE,
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
        data1: 99, // Make sure this type and name matches data1
        data2: "hello world!", // Make this this type and name matches data2
      };
      // end trial
      this.jsPsych.finishTrial(trial_data);
    }
  }
  PluginNamePlugin.info = info;

  return PluginNamePlugin;
})(jsPsychModule);
