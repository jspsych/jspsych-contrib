import { startTimeline } from "@jspsych/test-utils";

import PluginPipe from ".";

jest.useFakeTimers();

describe("my plugin", () => {
  it.skip("should load", async () => {
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: PluginPipe,
        parameter_name: 1,
        parameter_name2: "img.png",
      },
    ]);

    await expectFinished();
  });
});
