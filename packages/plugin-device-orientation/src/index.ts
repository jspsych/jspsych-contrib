import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "device-orientation",
  version: version,
  parameters: {
    /** The required orientation: "landscape" or "portrait" */
    orientation: {
      type: ParameterType.SELECT,
      options: ["landscape", "portrait"],
      default: "landscape",
    },
    /** The message to display when the device needs to be rotated. Use %ORIENTATION% as a placeholder for the required orientation. */
    message: {
      type: ParameterType.HTML_STRING,
      default:
        '<p style="font-size: 24px;">Please rotate your device to <strong>%ORIENTATION%</strong> mode to continue.</p>',
    },
    /** If true, show a button that allows participants to skip the orientation requirement. Useful for testing. */
    allow_skip: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** Label for the skip button (only shown if allow_skip is true) */
    skip_button_label: {
      type: ParameterType.STRING,
      default: "Continue anyway",
    },
  },
  data: {
    /** Whether the device was already in the correct orientation when the trial started */
    was_correct_orientation: {
      type: ParameterType.BOOL,
    },
    /** The orientation of the device when the trial ended */
    final_orientation: {
      type: ParameterType.STRING,
    },
    /** Whether the participant skipped the orientation requirement */
    skipped: {
      type: ParameterType.BOOL,
    },
    /** Time spent waiting for correct orientation (ms) */
    rt: {
      type: ParameterType.INT,
    },
  },
  citations: "__CITATIONS__",
};

type Info = typeof info;

/**
 * **device-orientation**
 *
 * Require the device to be in a specific orientation (landscape or portrait) before continuing.
 * If the device is already in the correct orientation, the trial ends immediately with `rt: null`.
 * On desktop browsers, orientation is determined by the window dimensions, so the trial will
 * typically end immediately unless the browser window is sized in the non-target orientation.
 *
 * @author Josh de Leeuw
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-device-orientation/README.md}
 */
class DeviceOrientationPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    const startTime = performance.now();

    // Get current orientation
    const getCurrentOrientation = (): "landscape" | "portrait" => {
      if (window.screen.orientation) {
        return window.screen.orientation.type.includes("landscape") ? "landscape" : "portrait";
      } else {
        return window.innerWidth > window.innerHeight ? "landscape" : "portrait";
      }
    };

    const currentOrientation = getCurrentOrientation();
    const isCorrectOrientation = currentOrientation === trial.orientation;

    // If already correct orientation, end trial immediately
    if (isCorrectOrientation) {
      this.jsPsych.finishTrial({
        was_correct_orientation: true,
        final_orientation: currentOrientation,
        skipped: false,
        rt: null,
      });
      return;
    }

    // Display message asking user to rotate device
    const messageHtml = trial.message.replace(/%ORIENTATION%/g, trial.orientation);
    let html = `<div class="jspsych-device-orientation-container" style="text-align: center; padding: 20px;">`;
    html += `<div class="jspsych-device-orientation-icon" style="font-size: 64px; margin-bottom: 20px;">`;
    html += `🔄`;
    html += `</div>`;
    html += `<div class="jspsych-device-orientation-message">${messageHtml}</div>`;

    if (trial.allow_skip) {
      html += `<button id="jspsych-device-orientation-skip" class="jspsych-btn" style="margin-top: 20px;">${trial.skip_button_label}</button>`;
    }

    html += `</div>`;
    display_element.innerHTML = html;

    // End trial function
    const endTrial = (skipped: boolean) => {
      if (window.screen.orientation) {
        window.screen.orientation.removeEventListener("change", handleOrientationChange);
      }
      window.removeEventListener("resize", handleResize);

      const endTime = performance.now();
      const finalOrientation = getCurrentOrientation();

      display_element.innerHTML = "";

      this.jsPsych.finishTrial({
        was_correct_orientation: false,
        final_orientation: finalOrientation,
        skipped: skipped,
        rt: Math.round(endTime - startTime),
      });
    };

    // Handle orientation change
    const handleOrientationChange = () => {
      if (getCurrentOrientation() === trial.orientation) {
        endTrial(false);
      }
    };

    // Handle resize (fallback for orientation change)
    const handleResize = () => {
      if (getCurrentOrientation() === trial.orientation) {
        endTrial(false);
      }
    };

    // Add event listeners for orientation change
    if (window.screen.orientation) {
      window.screen.orientation.addEventListener("change", handleOrientationChange);
    }
    window.addEventListener("resize", handleResize);

    // Add skip button handler if enabled
    if (trial.allow_skip) {
      display_element
        .querySelector("#jspsych-device-orientation-skip")
        ?.addEventListener("click", () => {
          endTrial(true);
        });
    }
  }
}

export default DeviceOrientationPlugin;
