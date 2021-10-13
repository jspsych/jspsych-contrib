import { pressKey, startTimeline } from "@jspsych/test-utils";

import SelfPacedReadingPlugin from ".";

jest.useFakeTimers();

describe("self-paced-reading plugin", () => {
  test("should load", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: SelfPacedReadingPlugin,
        sentence: "The quick brown fox jumps over the lazy dog.",
        choices: ["m"],
      },
    ]);

    // number of key presses meeded to complete trial
    for (let i = 0; i <= 10; i++) {
      pressKey("m");
      jest.advanceTimersByTime(100);
    }

    await expectFinished();
  });
});
