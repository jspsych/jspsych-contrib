import { startTimeline } from "@jspsych/test-utils";

import jsPsychHtmlKeyboardResponseRaf from ".";

jest.useFakeTimers();

describe("my plugin", () => {
  it("should load", async () => {
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychHtmlKeyboardResponseRaf,
        stimulus: "Hello world!",
        trial_duration: 1000,
      },
    ]);

    jest.runAllTimers();

    await expectFinished();
  });
});
