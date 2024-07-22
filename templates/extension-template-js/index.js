var _globalName_ = (function (jspsych) {
  "use strict";

  /**
   * **{name}**
   *
   * {description}
   *
   * @author {author}
   * @see {@link {documentation-url}}}
   */
  class ExtensionNameExtension {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    initialize(params) {
      return new Promise((resolve, reject) => {
        resolve();
      });
    }

    on_start(params) {}

    on_load(params) {}

    on_finish(params) {
      return {
        data1: 99, // Make sure this type and name matches the information for data1 in the data object contained within the info const.
        data2: "hello world!", // Make sure this type and name matches the information for data2 in the data object contained within the info const.
      };
    }
  }
  ExtensionNameExtension.info = {
    name: "{name}",
    version: "1.0.0", // When working in a Javascript environment with no build, you will need to manually put set the version information. This is used for metadata purposes and publishing.
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

  return ExtensionNameExtension;
})(jsPsychModule);
