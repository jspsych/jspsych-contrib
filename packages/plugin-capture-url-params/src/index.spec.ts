import { startTimeline } from "@jspsych/test-utils";

import jsPsychPluginCaptureUrlParams from ".";

jest.useFakeTimers();

describe("my plugin", () => {
  it("should load", async () => {
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychPluginCaptureUrlParams,
      },
    ]);

    await expectFinished();
  });
});
