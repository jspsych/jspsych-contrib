import { startTimeline } from "@jspsych/test-utils";

import jsPsychCorsiBlocks from ".";

jest.useFakeTimers();

describe("corsi-blocks plugin", () => {
  it("should load", async () => {
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychCorsiBlocks,
        sequence: [0, 1, 2],
        blocks: [
          { x: 10, y: 10 },
          { x: 20, y: 20 },
          { x: 30, y: 30 },
        ],
      },
    ]);

    await jest.runAllTimers();

    await expectFinished();
  });
  it("should work with default blocks", async () => {
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychCorsiBlocks,
        sequence: [0, 1, 2],
      },
    ]);
    await jest.runAllTimers();
    await expectFinished();
  });
});
