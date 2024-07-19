import { version } from "./package.json";

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
        data_name: 99, // Make sure this type and name matches data_name
        data_name2: "hello world!", // Make this this type and name matches data_name2
      };
    }
  }
  ExtensionNameExtension.info = {
    name: "{name}",
    version: version,
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

  return ExtensionNameExtension;
})(jsPsychModule);
