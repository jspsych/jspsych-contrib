import { clickTarget, startTimeline } from "@jspsych/test-utils";

import htmlChoice from ".";

jest.useFakeTimers();

describe("html-choice", () => {
  it("should load", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: htmlChoice,
        html_array: ["<div>Test-Div</div>"],
      },
    ]);
    clickTarget(document.querySelector("#jspsych-html-choice-0"));

    await expectFinished();
  });
});
