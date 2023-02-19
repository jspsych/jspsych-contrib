import { startTimeline } from "@jspsych/test-utils";

import htmlChoice from ".";

jest.useFakeTimers();

describe("html-choice", () => {
  it("should load", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: htmlChoice,
        html_array: [""],
        trial_duration: 1000,
      },
    ]);

    await expectFinished();
  });
});
