import { startTimeline } from "@jspsych/test-utils";

import jsPsychCorsiBlocks from ".";

jest.useFakeTimers();

describe("corsi-blocks plugin", () => {
  it("should load", async () => {
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychCorsiBlocks,
        parameter_name: 1,
        parameter_name2: "img.png",
      },
    ]);

    await expectFinished();
  });
});
