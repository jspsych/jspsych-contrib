import { initJsPsych } from "jspsych";
import { startTimeline } from "jspsych/tests/utils";

import vslAnimateOcclusion from ".";

jest.useFakeTimers();

describe("plugin vsl-animate-occlusion", () => {
  it("should load", async () => {
    const jsPsych = initJsPsych();

    const { expectFinished } = await startTimeline([
      {
        type: vslAnimateOcclusion,
        stimuli: ["img1.png", "img2.png"]
      }
    ]);

    jest.runAllTimers();

    await expectFinished();
  });
});
