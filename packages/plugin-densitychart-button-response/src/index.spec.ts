import { startTimeline } from "@jspsych/test-utils";

import jsPsychPluginHistogramButtonResponse from ".";

jest.useFakeTimers();

describe("my plugin", () => {
  it("should load", async () => {
    const { expectFinished, getHTML, getData, displayElement, jsPsych } =
      await startTimeline([
        {
          type: jsPsychPluginHistogramButtonResponse,
          parameter_name: 1,
          parameter_name2: "img.png",
        },
      ]);

    await expectFinished();
  });
});
