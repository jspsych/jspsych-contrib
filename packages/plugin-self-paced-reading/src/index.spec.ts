import { pressKey, startTimeline } from "@jspsych/test-utils";

import SelfPacedReadingPlugin from ".";

jest.useFakeTimers();

describe("self-paced-reading plugin", () => {
  test("Click through sentence A: Mask 1", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: SelfPacedReadingPlugin,
        sentence: "The quick brown fox jumps over the lazy dog.",
        choices: [" "],
      },
    ]);

    // number of key presses needed to complete trial
    for (let i = 0; i < 10; i++) {
      jest.advanceTimersByTime(100);
      await pressKey(" ");
    }
    // This additional time seems necessary to get tests to pass
    jest.advanceTimersByTime(100);

    await expectFinished();

    expect(getData().values()[0].word[9]).toBe("dog.");
    expect(getData().values()[0].word.length).toBe(10);
    for (let i = 0; i < 10; i++) {
      expect(getData().select("rt").values[0][i]).toBe(100);
    }
  });

  test("Click through sentence B: Mask 1", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: SelfPacedReadingPlugin,
        sentence: "One two three four five",
        choices: ["ArrowRight"],
      },
    ]);

    // number of key presses needed to complete trial
    for (let i = 0; i < 6; i++) {
      jest.advanceTimersByTime(100);
      await pressKey("ArrowRight");
    }
    // This additional time seems necessary to get tests to pass
    jest.advanceTimersByTime(100);

    await expectFinished();

    expect(getData().values()[0].word[5]).toBe("five");
    expect(getData().values()[0].word.length).toBe(6);
    for (let i = 0; i < 6; i++) {
      expect(getData().select("rt").values[0][i]).toBe(100);
    }
  });

  test("Click through sentence A: Mask 2", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: SelfPacedReadingPlugin,
        sentence: "The quick brown fox jumps over the lazy dog.",
        mask_type: 2,
        choices: [" "],
      },
    ]);

    // number of key presses needed to complete trial
    for (let i = 0; i < 10; i++) {
      jest.advanceTimersByTime(100);
      await pressKey(" ");
    }
    // This additional time seems necessary to get tests to pass
    jest.advanceTimersByTime(100);

    await expectFinished();

    expect(getData().values()[0].word[9]).toBe("dog.");
    expect(getData().values()[0].word.length).toBe(10);
    for (let i = 0; i < 10; i++) {
      expect(getData().select("rt").values[0][i]).toBe(100);
    }
  });

  test("Click through sentence B: Mask 2", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: SelfPacedReadingPlugin,
        sentence: "One two three four five",
        mask_type: 2,
        choices: ["ArrowRight"],
      },
    ]);

    // number of key presses needed to complete trial
    for (let i = 0; i < 6; i++) {
      jest.advanceTimersByTime(100);
      await pressKey("ArrowRight");
    }
    // This additional time seems necessary to get tests to pass
    jest.advanceTimersByTime(100);

    await expectFinished();

    expect(getData().values()[0].word[5]).toBe("five");
    expect(getData().values()[0].word.length).toBe(6);
    for (let i = 0; i < 6; i++) {
      expect(getData().select("rt").values[0][i]).toBe(100);
    }
  });

  test("Click through sentence A: Mask 3", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: SelfPacedReadingPlugin,
        sentence: "The quick brown fox jumps over the lazy dog.",
        mask_type: 2,
        choices: [" "],
      },
    ]);

    // number of key presses needed to complete trial
    for (let i = 0; i < 10; i++) {
      jest.advanceTimersByTime(100);
      await pressKey(" ");
    }
    // This additional time seems necessary to get tests to pass
    jest.advanceTimersByTime(100);

    await expectFinished();

    expect(getData().values()[0].word[9]).toBe("dog.");
    expect(getData().values()[0].word.length).toBe(10);
    for (let i = 0; i < 10; i++) {
      expect(getData().select("rt").values[0][i]).toBe(100);
    }
  });

  test("Click through sentence B: Mask 3", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: SelfPacedReadingPlugin,
        sentence: "One two three four five",
        mask_type: 2,
        choices: ["ArrowRight"],
      },
    ]);

    // number of key presses needed to complete trial
    for (let i = 0; i < 6; i++) {
      jest.advanceTimersByTime(100);
      await pressKey("ArrowRight");
    }
    // This additional time seems necessary to get tests to pass
    jest.advanceTimersByTime(100);

    await expectFinished();

    expect(getData().values()[0].word[5]).toBe("five");
    expect(getData().values()[0].word.length).toBe(6);
    for (let i = 0; i < 6; i++) {
      expect(getData().select("rt").values[0][i]).toBe(100);
    }
  });

  test("Click through sentence A: Mask 1, with IWI", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: SelfPacedReadingPlugin,
        sentence: "The quick brown fox jumps over the lazy dog.",
        choices: [" "],
        inter_word_interval: 50,
      },
    ]);

    // number of key presses needed to complete trial
    for (let i = 0; i < 10; i++) {
      jest.advanceTimersByTime(100);
      await pressKey(" ");
    }
    // This additional time seems necessary to get tests to pass
    jest.advanceTimersByTime(100);

    await expectFinished();

    // First keypress should have rt of 100ms
    expect(getData().select("rt").values[0][0]).toBe(100);
    // Because of IWI, subsequent keypresses should have rt of 50ms
    for (let i = 1; i < 10; i++) {
      expect(getData().select("rt").values[0][i]).toBe(50);
    }
  });

  test("Click through sentence B: Mask 1, with IWI", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: SelfPacedReadingPlugin,
        sentence: "One two three four five",
        choices: ["ArrowRight"],
        inter_word_interval: 50,
      },
    ]);

    // number of key presses needed to complete trial
    for (let i = 0; i < 6; i++) {
      jest.advanceTimersByTime(100);
      await pressKey("ArrowRight");
    }
    // This additional time seems necessary to get tests to pass
    jest.advanceTimersByTime(100);

    await expectFinished();

    // First keypress should have rt of 100ms
    expect(getData().select("rt").values[0][0]).toBe(100);
    // Because of IWI, subsequent keypresses should have rt of 50ms
    for (let i = 1; i < 6; i++) {
      expect(getData().select("rt").values[0][i]).toBe(50);
    }
  });
});
