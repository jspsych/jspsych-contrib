import { startTimeline } from "@jspsych/test-utils";

import jsPsychMaze from ".";

jest.useFakeTimers();

describe("my plugin", () => {
  it("should load", async () => {
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychMaze,
        sent: "yo",
      },
    ]);

    await expectFinished();
  });
});
