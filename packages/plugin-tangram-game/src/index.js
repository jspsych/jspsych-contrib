var jsPsychTangramGame = (function (jspsych) {
  "use strict";

  const info = {
    name: "plugin-tangram-game",
    version: "0.0.1", // When working in a Javascript environment with no build, you will need to manually put set the version information. This is used for metadata purposes and publishing.
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
      // When working in a Javascript environment with no build, you will need to manually put the citations information.
      // You may find it useful to fill in the CITATION.cff file generated with this package and use this script to generate your citations:
      // https://github.com/jspsych/jsPsych/blob/main/packages/config/generateCitations.js
      // This is helpful for users of your plugin to easily cite it.
      citations: '__CITATIONS__', // prettier-ignore
    },
  };

  /**
   * **plugin-tangram-game**
   *
   * A child-friendly tangram game with click-and-click interface and potential for custom puzzles
   *
   * @author Aline Normoyle
   * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-tangram-game/README.md}
   */
  class TangramGamePlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {
      // data saving
      var trial_data = {
        data1: 99, // Make sure this type and name matches the information for data1 in the data object contained within the info const.
        data2: "hello world!", // Make sure this type and name matches the information for data2 in the data object contained within the info const.
      };
      // end trial
      this.jsPsych.finishTrial(trial_data);
    }
  }
  TangramGamePlugin.info = info;

  return TangramGamePlugin;
})(jsPsychModule);
