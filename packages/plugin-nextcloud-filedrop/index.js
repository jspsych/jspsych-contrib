var jsPsychNextcloudFiledropPlugin = (function (jspsych) {
  "use strict";

  const info = {
    name: "nextcloud-upload",
    version: "2.0.0",
    parameters: {
      url: {
        type: jspsych.ParameterType.STRING,
        default: undefined,
      },
      folder: {
        type: jspsych.ParameterType.STRING,
        default: undefined,
      },
      filename: {
        type: jspsych.ParameterType.FUNCTION,
        default: null,
      },
      generate_download_url_on_error: {
        type: jspsych.ParameterType.BOOL,
        default: false,
      },
    },
    data: {
      /** The name of the uploaded file. */
      filename: {
        type: jspsych.ParameterType.STRING,
      },
      /** Whether an error occurred during upload. */
      error: {
        type: jspsych.ParameterType.BOOL,
      },
      /** The URL to download the file in case of an error. */
      url: {
        type: jspsych.ParameterType.STRING,
      },
    },
  };

  /**
   * **NEXTCLOUD-UPLOAD**
   *
   * This plugin can be used to save jsPsych data
   * to a nextcloud instance using the file drop method.
   * Please refer to README.md for details.
   *
   * @author Martin Grewe
   */
  class NextcloudFiledropPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {
      let data = this.jsPsych.data.get().json();

      // Determine filename
      let filename =
        trial["filename"] == null ? new Date().toJSON() + ".zip" : trial["filename"](this.jsPsych);

      var trial_data = {
        filename: filename,
        error: false,
      };

      var progress_bar_container = document.createElement("div");
      progress_bar_container.id = "jspsych-loading-progress-bar-container";
      progress_bar_container.style.height = "10px";
      progress_bar_container.style.width = "300px";
      progress_bar_container.style.backgroundColor = "#ddd";
      progress_bar_container.style.margin = "auto";

      var progress_bar_text = document.createElement("p");

      var progress_bar = document.createElement("div");
      progress_bar.id = "jspsych-loading-progress-bar";
      progress_bar.style.height = "10px";
      progress_bar.style.width = "0px";
      progress_bar.style.backgroundColor = "#777";

      progress_bar_container.appendChild(progress_bar);
      this.jsPsych.getDisplayElement().appendChild(progress_bar_text);
      this.jsPsych.getDisplayElement().appendChild(progress_bar_container);

      var zip = new JSZip();
      zip.file("data.json", data);

      zip
        .generateAsync({ type: "blob" }, (metadata) => {
          progress_bar_text.innerHTML = "Compressing data, please be patient.";
          const perc = metadata.percent.toFixed(2);
          // console.log("Compression progress: " + perc);
          progress_bar.style.width = perc + "%";
        })
        .then((blob) => {
          const xhr = new XMLHttpRequest();

          // Progress callback
          xhr.upload.addEventListener("progress", (event) => {
            progress_bar_text.innerHTML = "Uploading data, please be patient.";
            console.log("Upload progress: " + Math.round((event.loaded / event.total) * 100));
            progress_bar.style.width = Math.round((event.loaded / event.total) * 100) + "%";
          });

          // Upload finished callback
          xhr.addEventListener("loadend", () => {
            console.log("Upload finished.");
            this.jsPsych.getDisplayElement().removeChild(progress_bar_text);
            this.jsPsych.getDisplayElement().removeChild(progress_bar_container);
            display_element.innerHTML = "Upload finished.";
            this.jsPsych.finishTrial(trial_data);
          });

          // Upload error callback
          xhr.addEventListener("error", (evt) => {
            console.log("Upload error.", evt);
            trial_data.error = true;
            if (trial["generate_download_url_on_error"]) {
              trial_data.url = URL.createObjectURL(blob);
              trial_data.filename = filename;
            }
          });

          const url = trial["url"] + "/public.php/webdav/" + filename;
          xhr.open("PUT", url, true);
          xhr.setRequestHeader("Authorization", "Basic " + btoa(trial["folder"] + ":"));
          xhr.send(blob);
        });

      // end trial
    }
  }
  NextcloudFiledropPlugin.info = info;

  return NextcloudFiledropPlugin;
})(jsPsychModule);
