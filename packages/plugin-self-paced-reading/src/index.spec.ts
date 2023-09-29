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

    expect(getData().last(1).values()[0].spr_words[9]).toBe("dog.");
    expect(getData().last(1).values()[0].spr_words.length).toBe(10);
    expect(getData().last(1).values()[0].spr_rts.mean()).toBe(200); // should fail
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

    expect(getData().last(1).values()[0].spr_words[5]).toBe("five");
    expect(getData().last(1).values()[0].spr_words.length).toBe(6);
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

    expect(getData().last(1).values()[0].spr_words[9]).toBe("dog.");
    expect(getData().last(1).values()[0].spr_words.length).toBe(10);
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

    expect(getData().last(1).values()[0].spr_words[5]).toBe("five");
    expect(getData().last(1).values()[0].spr_words.length).toBe(6);
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

    expect(getData().last(1).values()[0].spr_words[9]).toBe("dog.");
    expect(getData().last(1).values()[0].spr_words.length).toBe(10);
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

    expect(getData().last(1).values()[0].spr_words[5]).toBe("five");
    expect(getData().last(1).values()[0].spr_words.length).toBe(6);
  });
});
