import { startTimeline } from "@jspsych/test-utils";

import jsPsychSpr from ".";

jest.useFakeTimers();

describe.skip("my plugin", () => {
  it("should load", async () => {
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychSpr,
        parameter_name: 1,
        parameter_name2: "img.png",
      },
    ]);

    await expectFinished();
  });
});
