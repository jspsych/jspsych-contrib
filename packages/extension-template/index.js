var jsPsychExtensionName = (function (jspsych) {
  "use strict";

  /**
   * **EXTENSION-NAME**
   *
   * SHORT EXTENSION DESCRIPTION
   *
   * @author YOUR NAME
   * @see {@link https://DOCUMENTATION_URL DOCUMENTATION LINK TEXT}
   */
  class ExtensionNameExtension {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    initialize(params){
      return new Promise((resolve, reject)=>{
        resolve();
      })
    }

    on_start(params){

    }

    on_load(params){

    }

    on_finish(params){
      return {
        data_property: 'data_value'
      }
    }
    
  }
  ExtensionNameExtension.info = {
    name: "extension-name"
  }

  return ExtensionNameExtension;
})(jsPsychModule);
