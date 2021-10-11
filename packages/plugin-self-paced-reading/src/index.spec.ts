import { startTimeline } from "@jspsych/test-utils";
import SelfPacedReadingPlugin from ".";

import pluginName from ".";

jest.useFakeTimers();

describe("self-paced-reading plugin", () => {
  it("should load", async () => {
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: SelfPacedReadingPlugin,
      },
    ]);

    await expectFinished();
  });
});
