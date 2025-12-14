import { startTimeline } from "@jspsych/test-utils";

import jsPsychPluginTtsSelectLang from ".";

jest.useFakeTimers();

describe("my plugin", () => {
  it("should load", async () => {
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychPluginTtsSelectLang,
        parameter_name: 1,
        parameter_name2: "img.png",
      },
    ]);

    await expectFinished();
  });
});
