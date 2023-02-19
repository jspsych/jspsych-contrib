import { startTimeline } from "@jspsych/test-utils";

import htmlChoice from ".";

jest.useFakeTimers();

describe("html-choice", () => {
  it("should load", async () => {
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: htmlChoice,
        html_array: [""],
      },
    ]);

    await expectFinished();
  });
});
