import { pressKey, startTimeline } from "@jspsych/test-utils";

import SelfPacedReadingPlugin from ".";

jest.useFakeTimers();

describe("self-paced-reading plugin", () => {
  test("Click through sentence: Mask 1", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: SelfPacedReadingPlugin,
        sentence: "The quick brown fox jumps over the lazy dog.",
        choices: [" "],
      },
    ]);

    // number of key presses meeded to complete trial
    for (let i = 0; i <= 10; i++) {
      pressKey(" ");
      jest.advanceTimersByTime(100);
    }

    await expectFinished();

    expect(getData().last(1).values()[0].word).toBe("dog.");
    expect(getData().last(1).values()[0].word_number).toBe(9);
  });

  test("Click through sentence: Mask 1", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: SelfPacedReadingPlugin,
        sentence: "One two three four five",
        choices: ["ArrowRight"],
      },
    ]);

    // number of key presses meeded to complete trial
    for (let i = 0; i <= 6; i++) {
      pressKey("ArrowRight");
      jest.advanceTimersByTime(100);
    }

    await expectFinished();

    expect(getData().last(1).values()[0].word).toBe("five");
    expect(getData().last(1).values()[0].word_number).toBe(5);
  });

  test("Click through sentence: Mask 2", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: SelfPacedReadingPlugin,
        sentence: "The quick brown fox jumps over the lazy dog.",
        mask_type: 2,
        choices: [" "],
      },
    ]);

    // number of key presses meeded to complete trial
    for (let i = 0; i <= 10; i++) {
      pressKey(" ");
      jest.advanceTimersByTime(100);
    }

    await expectFinished();

    expect(getData().last(1).values()[0].word).toBe("dog.");
    expect(getData().last(1).values()[0].word_number).toBe(9);
  });

  test("Click through sentence: Mask 2", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: SelfPacedReadingPlugin,
        sentence: "One two three four five",
        mask_type: 2,
        choices: ["ArrowRight"],
      },
    ]);

    // number of key presses meeded to complete trial
    for (let i = 0; i <= 6; i++) {
      pressKey("ArrowRight");
      jest.advanceTimersByTime(100);
    }

    await expectFinished();

    expect(getData().last(1).values()[0].word).toBe("five");
    expect(getData().last(1).values()[0].word_number).toBe(5);
  });

  test("Click through sentence: Mask 3", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: SelfPacedReadingPlugin,
        sentence: "The quick brown fox jumps over the lazy dog.",
        mask_type: 2,
        choices: [" "],
      },
    ]);

    // number of key presses meeded to complete trial
    for (let i = 0; i <= 10; i++) {
      pressKey(" ");
      jest.advanceTimersByTime(100);
    }

    await expectFinished();

    expect(getData().last(1).values()[0].word).toBe("dog.");
    expect(getData().last(1).values()[0].word_number).toBe(9);
  });

  test("Click through sentence: Mask 3", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: SelfPacedReadingPlugin,
        sentence: "One two three four five",
        mask_type: 2,
        choices: ["ArrowRight"],
      },
    ]);

    // number of key presses meeded to complete trial
    for (let i = 0; i <= 6; i++) {
      pressKey("ArrowRight");
      jest.advanceTimersByTime(100);
    }

    await expectFinished();

    expect(getData().last(1).values()[0].word).toBe("five");
    expect(getData().last(1).values()[0].word_number).toBe(5);
  });
});
