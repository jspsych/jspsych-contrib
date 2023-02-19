import htmlMultiResponse from "@jspsych-contrib/plugin-html-multi-response";
import { clickTarget, startTimeline } from "@jspsych/test-utils";

import htmlChoice from ".";

jest.useFakeTimers();

describe("html-choice", () => {
  test("displays html", async () => {
    const { getHTML } = await startTimeline([
      {
        type: htmlChoice,
        html_array: ["this is html"],
      },
    ]);
    expect(getHTML()).toContain(
      '<div><div class="jspsych-html-choice" id="jspsych-html-choice-0" data-choice="0" value="null">this is html</div></div>'
    );
  });
});
