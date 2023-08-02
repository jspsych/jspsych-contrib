var globalName = (function (jspsych) {
  "use strict";

  /**
   * **{extension-name}**
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
        data_property: "data_value",
      };
    }
  }
  ExtensionNameExtension.info = {
    name: "{extension-name}",
  };

  return ExtensionNameExtension;
})(jsPsychModule);
