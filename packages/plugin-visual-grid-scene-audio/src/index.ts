import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "plugin-visual-grid-scene-audio",
  version: version,
  parameters: {
    /** Provide a clear description of the parameter_name that could be used as documentation. We will eventually use these comments to automatically build documentation and produce metadata. */
    stimulus_audio: {
      type: ParameterType.AUDIO, // BOOL, STRING, INT, FLOAT, FUNCTION, KEY, KEYS, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
      default: undefined,
    },
    /** Provide a clear description of the parameter_name2 that could be used as documentation. We will eventually use these comments to automatically build documentation and produce metadata. */
    stimulus_images: {
      type: ParameterType.STRING,
      default: [],
      array: true,
    },
    image_size: {
      type: ParameterType.INT,
      pretty_name: "Image size",
      array: true,
      default: [100, 100],
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
  // When you run build on your plugin, citations will be generated here based on the information in the CITATION.cff file.
  citations: "__CITATIONS__",
};

type Info = typeof info;

/**
 * **plugin-visual-grid-scene-audio**
 *
 * same as VisualGridScene but with Audio
 *
 * @author Valeria Inojosa
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-visual-grid-scene-audio/README.md}}
 */
class VisualGridSceneAudioPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>, on_load: () => void) {
    return new Promise(async () => {
      const audio = await this.jsPsych.pluginAPI.getAudioPlayer(trial.stimulus_audio);

      var grid = VisualGridSceneAudioPlugin.generate_grid(trial.stimulus_images, trial.image_size);
      display_element.innerHTML = grid;

      audio.addEventListener("ended", () => this.end_trial(audio, display_element));

      on_load();

      audio.play();
    });
  }

  static generate_grid(pattern, image_size: number[]) {
    var nrows = pattern.length;
    var ncols = pattern[0].length;

    // create blank element to hold code that we generate
    var html = '<div id="jspsych-vsl-grid-scene-dummy" css="display: none;">';

    // create table
    html +=
      '<table id="jspsych-vsl-grid-scene table" ' +
      'style="border-collapse: collapse; margin-left: auto; margin-right: auto;">';

    for (var row = 0; row < nrows; row++) {
      html +=
        '<tr id="jspsych-vsl-grid-scene-table-row-' +
        row +
        '" css="height: ' +
        image_size[1] +
        'px;">';

      for (var col = 0; col < ncols; col++) {
        html +=
          '<td id="jspsych-vsl-grid-scene-table-' +
          row +
          "-" +
          col +
          '" ' +
          'style="padding: ' +
          image_size[1] / 10 +
          "px " +
          image_size[0] / 10 +
          'px; border: 1px solid #555;">' +
          '<div id="jspsych-vsl-grid-scene-table-cell-' +
          row +
          "-" +
          col +
          '" style="width: ' +
          image_size[0] +
          "px; height: " +
          image_size[1] +
          'px;">';
        if (pattern[row][col] !== 0) {
          html +=
            "<img " +
            'src="' +
            pattern[row][col] +
            '" style="width: ' +
            image_size[0] +
            "px; height: " +
            image_size[1] +
            '"></img>';
        }
        html += "</div>";
        html += "</td>";
      }
      html += "</tr>";
    }

    html += "</table>";
    html += "</div>";

    return html;
  }

  private end_trial(audio, display_element) {
    // stop the audio file if it is playing
    audio.stop();

    // remove end event listeners if they exist
    audio.removeEventListener("ended", this.end_trial);

    // gather the data to store for the trial
    var trial_data = {
      data1: 99, // Make sure this type and name matches the information for data1 in the data object contained within the info const.
      data2: "hello world!", // Make sure this type and name matches the information for data2 in the data object contained within the info const.
    };

    // clear the display
    display_element.innerHTML = "";

    // move on to the next trial
    this.jsPsych.finishTrial(trial_data);
  }
}

export default VisualGridSceneAudioPlugin;
