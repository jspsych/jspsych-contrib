import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "chiasm-calibrate",
  version: version,
  parameters: {
    /** HTML shown briefly before the Chiasm calibration UI takes over the display. */
    instructions: {
      type: ParameterType.HTML_STRING,
      default: "<p>Calibration will begin shortly. Please follow the on-screen instructions.</p>",
    },
    /**
     * Whether to run the credit-card screen-size calibration step before the camera and
     * gaze calibration ceremony. Set to false if the participant's screen has already
     * been measured.
     */
    screen_calibration: {
      type: ParameterType.BOOL,
      default: true,
    },
  },
  data: {
    /** Whether the calibration ceremony completed without throwing. */
    success: { type: ParameterType.BOOL },
    /** Milliseconds elapsed during the calibration ceremony. */
    calibration_duration: { type: ParameterType.INT },
    /** Error message if the ceremony failed, otherwise null. */
    error: { type: ParameterType.STRING },
  },
  citations: "__CITATIONS__",
};

type Info = typeof info;

/**
 * **plugin-chiasm-calibrate**
 *
 * jsPsych plugin that runs the participant-facing Chiasm setup ceremony in one trial:
 *
 * 1. (optional) Credit-card screen-size calibration (`showScreenCalibration`).
 * 2. `setupTrackerWithRetries`: camera readiness check, fullscreen prompt,
 *    calibration instructions and countdown, gaze calibration, processing,
 *    validation instructions and countdown, validation, scoring, and handoff
 *    back to the jsPsych timeline.
 *
 * The ceremony is delegated to the `chiasm` extension via `extension.calibrate({ screenCalibration })`.
 *
 * @author Chiasm
 * @see {@link https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-chiasm-calibrate/README.md}
 */
class ChiasmCalibratePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  async trial(display_element: HTMLElement, trial: TrialType<Info>): Promise<void> {
    display_element.innerHTML = trial.instructions;
    const startTime = performance.now();

    const extension = (this.jsPsych.extensions as Record<string, any>)["chiasm"];
    if (!extension || typeof extension.calibrate !== "function") {
      const error =
        "plugin-chiasm-calibrate: the `chiasm` extension is not registered on this jsPsych instance.";
      console.error(error);
      this.jsPsych.finishTrial({
        success: false,
        calibration_duration: Math.round(performance.now() - startTime),
        error,
      });
      return;
    }

    try {
      await extension.calibrate({ screenCalibration: trial.screen_calibration });
      this.jsPsych.finishTrial({
        success: true,
        calibration_duration: Math.round(performance.now() - startTime),
        error: null,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("plugin-chiasm-calibrate:", err);
      this.jsPsych.finishTrial({
        success: false,
        calibration_duration: Math.round(performance.now() - startTime),
        error: errorMsg,
      });
    }
  }
}

export default ChiasmCalibratePlugin;
