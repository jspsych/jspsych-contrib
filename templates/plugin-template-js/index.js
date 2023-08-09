var _globalName_ = (function (jspsych) {
  "use strict";

  const info = {
    name: "{name}",
    parameters: {
      parameter_name: {
        type: jspsych.ParameterType.INT,
        default: undefined,
      },
      parameter_name2: {
        type: jspsych.ParameterType.IMAGE,
        default: undefined,
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
        parameter_name: "parameter value",
      };
      // end trial
      this.jsPsych.finishTrial(trial_data);
    }
  }
  PluginNamePlugin.info = info;

  return PluginNamePlugin;
})(jsPsychModule);
