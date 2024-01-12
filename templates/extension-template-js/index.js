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
        data_property: "data_value",
      };
    }
  }
  ExtensionNameExtension.info = {
    name: "{name}",
  };

  return ExtensionNameExtension;
})(jsPsychModule);
