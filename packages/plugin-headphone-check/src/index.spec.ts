jest.mock("../node_modules/jspsych/src/modules/plugin-api/AudioPlayer");

import { clickTarget, startTimeline } from "@jspsych/test-utils";

import jsPsychHeadphoneCheck from ".";

jest.useFakeTimers();

describe("headphone-check plugin", () => {
  it.skip("should complete", async () => {
    const { expectFinished, expectRunning, getHTML, getData, displayElement, jsPsych } =
      await startTimeline([
        {
          type: jsPsychHeadphoneCheck,
          stimuli: ["foo1.mp3"],
          correct: [0],
          calibration: false,
        },
      ]);

    expectRunning();

    clickTarget(displayElement.querySelector("#jspsych-headphone-check-play-0"));
    clickTarget(displayElement.querySelector("#jspsych-headphone-check-radio-0-0"));
    clickTarget(displayElement.querySelector("#jspsych-headphone-check-continue"));

    expectFinished();
  });
});
