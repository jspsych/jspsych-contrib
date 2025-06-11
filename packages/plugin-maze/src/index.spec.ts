import { startTimeline } from "@jspsych/test-utils";

import jsPsychMaze from ".";

jest.useFakeTimers();

describe("my plugin", () => {
  it("should load", async () => {
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychMaze,
        sentence: [
          ["After", "x-x-x"],
          ["a", "so"],
          ["bit", "pot"],
          ["of", "if"],
          ["success", "singing"],
          ["the", "ate"],
          ["stocks", "winter"],
          ["took", "walk"],
          ["a", "we"],
          ["dive", "toad"],
        ],
      },
    ]);

    await expectFinished();
  });
});
