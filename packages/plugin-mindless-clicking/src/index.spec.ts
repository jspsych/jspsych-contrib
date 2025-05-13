import { startTimeline } from "@jspsych/test-utils";

import jsPsychPluginMindlessClicking from ".";

jest.useFakeTimers();

describe("my plugin", () => {
  it("should load", async () => {
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychPluginMindlessClicking,
        required_clicks: 5,
      },
    ]);

    await expectFinished();
  });
});
