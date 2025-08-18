import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "vaast-fixation",
  version: version,
  parameters: {
    /**
     * The string that is displayed as fixation.
     */
    fixation: {
      type: ParameterType.STRING,
      default: "+",
    },
    /**
     * Font size of the fixation text.
     */
    font_size: {
      type: ParameterType.INT,
      default: 200,
    },
    /**
     * Minimal duration (in ms).
     */
    min_duration: {
      type: ParameterType.INT,
      default: 800,
    },
    /**
     * Maximal duration (in ms).
     */
    max_duration: {
      type: ParameterType.INT,
      default: 2000,
    },
    /**
     * An array with the images displayed as background as function of the position.
     */
    background_images: {
      type: ParameterType.IMAGE,
      array: true,
      default: undefined,
    },
    /**
     * The position in the "background_images" array which will be used to set the background.
     */
    position: {
      type: ParameterType.INT,
      default: 3,
    },
  },
  data: {
    /**
     * Duration of the fixation trial (in ms).
     */
    duration: {
      type: ParameterType.INT,
    },
  },
  // prettier-ignore
};

type Info = typeof info;

/**
 * **vaast-fixation**
 *
 * The VAAST-fixation plugin displays a fixation text that is usually a cross.
 * This plugin is usually called before a vaast-text or vaast-image trial.
 * The participant doesn't respond to the fixation trial.
 *
 * @author Cédric Batailler
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-vaast-fixation/README.md}}
 */
class VaastFixationPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // Randomly selecting duration
    const min_duration = trial.min_duration ?? 800;
    const max_duration = trial.max_duration ?? 2000;
    const duration_range = max_duration - min_duration;
    const trialDuration = Math.random() * duration_range + min_duration;

    // Affichage du stimulus
    let html_str = "";

    const position = trial.position ?? 3;

    html_str +=
      "<div style='position: absolute; right: 0; top: 0; width: 100%; height: 100%; background: url(" +
      trial.background_images[position] +
      ") center no-repeat; z-index: -1; background-color: #000000'></div>";
    html_str +=
      "<div style='height: 100vh; display: flex; justify-content: center; align-items: center; z-index:1; color: #ffffff; font-size: " +
      trial.font_size +
      "px' id='jspsych-vaast-stim'>" +
      trial.fixation +
      "</div>";

    display_element.innerHTML = html_str;

    // function to end trial when it is time
    const end_trial = () => {
      // gather the data to store for the trial
      let trial_data = {
        duration: trialDuration,
      };

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);
    };

    // end trial if time limit is set
    this.jsPsych.pluginAPI.setTimeout(function () {
      end_trial();
    }, trialDuration);
  }
}

export default VaastFixationPlugin;
