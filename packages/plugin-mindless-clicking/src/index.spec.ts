import { clickTarget, startTimeline } from "@jspsych/test-utils";

import jsPsychPluginMindlessClicking from ".";

jest.useFakeTimers();

describe("my plugin", () => {
  it("should load", async () => {
    const { expectFinished, expectRunning, getHTML, getData, displayElement, jsPsych } =
      await startTimeline([
        {
          type: jsPsychPluginMindlessClicking,
          required_clicks: 5,
        },
      ]);

    await expectRunning();
  });
  it("should finish when the button is clicked the required number of times", async () => {
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychPluginMindlessClicking,
        required_clicks: 5,
      },
    ]);

    const button = displayElement.querySelector("#jspsych-mindless-clicking-button");
    for (let i = 0; i < 5; i++) {
      clickTarget(button);
      jest.advanceTimersByTime(100);
    }

    await expectFinished();

    const data = getData();
    expect(data.values()[0].rt).toBeDefined();
    expect(data.values()[0].clicks).toBe(5);
  });
});
