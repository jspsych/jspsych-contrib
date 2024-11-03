import { startTimeline } from "@jspsych/test-utils";

import jsPsychHeadphoneCheck from ".";

jest.useFakeTimers();

describe.skip("headphone-check plugin", () => {
  it("should load", async () => {
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychHeadphoneCheck,
        parameter_name: 1,
        parameter_name2: "img.png",
      },
    ]);

    expect(3).toBe(3);
  });
});
