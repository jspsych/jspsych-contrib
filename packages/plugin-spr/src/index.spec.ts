import { pressKey, startTimeline } from "@jspsych/test-utils";

import jsPsychSpr from ".";

jest.useFakeTimers();

/** see if a certain word exists within a region of the spr text (before, current, after) */
function containsWord(element: HTMLElement, word: string, section: "before" | "current" | "after") {
  const spans = element.querySelectorAll(`.jspsych-spr-${section}-region`);
  return Array.from(spans).some((span) => span.innerHTML === word);
}

function containsWords(
  element: HTMLElement,
  words: string[],
  section: "before" | "current" | "after"
) {
  return words.every((word) => containsWord(element, word, section));
}

describe("spr plugin", () => {
  test("mode 1 masking works", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychSpr,
        sentence: "Five big booms",
        mode: 1,
      },
    ]);

    expect(containsWords(displayElement, ["Five", "big", "booms"], "after")).toBe(true);

    jest.advanceTimersByTime(100);
    pressKey(" ");

    expect(containsWord(displayElement, "Five", "current")).toBe(true);
    expect(containsWords(displayElement, ["big", "booms"], "after")).toBe(true);

    jest.advanceTimersByTime(100);
    pressKey(" ");

    expect(containsWord(displayElement, "Five", "before")).toBe(true);
    expect(containsWord(displayElement, "big", "current")).toBe(true);
    expect(containsWord(displayElement, "booms", "after")).toBe(true);

    jest.advanceTimersByTime(100);
    pressKey(" ");

    expect(containsWords(displayElement, ["Five", "big"], "before")).toBe(true);
    expect(containsWord(displayElement, "booms", "current")).toBe(true);

    jest.advanceTimersByTime(100);
    pressKey(" ");

    await expectFinished();

    // check blanked out word as data
    expect(getData().values()[0].results[0].segment).toBe("____");
    expect(getData().values()[0].results[1].segment).toBe("Five");

    // check rts
    for (let i = 0; i < 4; i++) {
      expect(getData().values()[0].results[i].rt).toBe(100);
    }
  });

  test("mode 2 masking works", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychSpr,
        sentence: "Five big booms",
        mode: 2,
      },
    ]);

    // functionally similar to mode 1
    expect(containsWords(displayElement, ["Five", "big", "booms"], "after")).toBe(true);

    jest.advanceTimersByTime(100);
    pressKey(" ");

    expect(containsWord(displayElement, "Five", "current")).toBe(true);
    expect(containsWords(displayElement, ["big", "booms"], "after")).toBe(true);

    jest.advanceTimersByTime(100);
    pressKey(" ");

    expect(containsWord(displayElement, "Five", "before")).toBe(true);
    expect(containsWord(displayElement, "big", "current")).toBe(true);
    expect(containsWord(displayElement, "booms", "after")).toBe(true);

    jest.advanceTimersByTime(100);
    pressKey(" ");

    expect(containsWords(displayElement, ["Five", "big"], "before")).toBe(true);
    expect(containsWord(displayElement, "booms", "current")).toBe(true);

    jest.advanceTimersByTime(100);
    pressKey(" ");

    await expectFinished();

    // check blanked out word as data
    expect(getData().values()[0].results[0].segment).toBe("____");
    expect(getData().values()[0].results[1].segment).toBe("Five");

    // check rts
    for (let i = 0; i < 4; i++) {
      expect(getData().values()[0].results[i].rt).toBe(100);
    }
  });

  test("mode 3 masking works", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychSpr,
        sentence: "Five big booms",
        mode: 3,
      },
    ]);

    // only one word is shown
    expect(containsWords(displayElement, ["Five, big, booms"], "after")).toBe(false);

    jest.advanceTimersByTime(100);
    pressKey(" ");

    expect(containsWord(displayElement, "Five", "current")).toBe(true);
    expect(containsWords(displayElement, ["big", "booms"], "after")).toBe(false);

    jest.advanceTimersByTime(100);
    pressKey(" ");

    expect(containsWord(displayElement, "Five", "before")).toBe(false);
    expect(containsWord(displayElement, "big", "current")).toBe(true);
    expect(containsWord(displayElement, "booms", "after")).toBe(false);

    jest.advanceTimersByTime(100);
    pressKey(" ");

    expect(containsWords(displayElement, ["Five", "big"], "before")).toBe(false);
    expect(containsWord(displayElement, "booms", "current")).toBe(true);

    jest.advanceTimersByTime(100);
    pressKey(" ");

    await expectFinished();

    // check blanked out word as data
    expect(getData().values()[0].results[0].segment).toBe("____");
    expect(getData().values()[0].results[1].segment).toBe("Five");

    // check rts
    for (let i = 0; i < 4; i++) {
      expect(getData().values()[0].results[i].rt).toBe(100);
    }
  });

  test("mode 1 + delimiter displays proper text", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychSpr,
        sentence: "What is^going^on right now?",
        mode: 1,
      },
    ]);

    expect(
      containsWords(displayElement, ["What", "is", "going", "on", "right", "now?"], "after")
    ).toBe(true);

    jest.advanceTimersByTime(100);
    pressKey(" ");

    expect(containsWords(displayElement, ["What", "is"], "current")).toBe(true);
    expect(containsWords(displayElement, ["going", "on", "right", "now?"], "after")).toBe(true);

    jest.advanceTimersByTime(100);
    pressKey(" ");

    expect(containsWords(displayElement, ["What", "is"], "before")).toBe(true);
    expect(containsWord(displayElement, "going", "current")).toBe(true);
    expect(containsWords(displayElement, ["on", "right", "now?"], "after")).toBe(true);

    jest.advanceTimersByTime(100);
    pressKey(" ");

    expect(containsWords(displayElement, ["What", "is", "going"], "before")).toBe(true);
    expect(containsWords(displayElement, ["on", "right", "now?"], "current")).toBe(true);

    jest.advanceTimersByTime(100);
    pressKey(" ");

    await expectFinished();

    // check blanked out word as data
    expect(getData().values()[0].results[0].segment).toBe("____ __");
    expect(getData().values()[0].results[1].segment).toBe("What is");
  });

  test("mode 2 + delimiter displays proper text", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychSpr,
        sentence: "What is^going^on right now?",
        mode: 2,
      },
    ]);

    expect(
      containsWords(displayElement, ["What", "is", "going", "on", "right", "now?"], "after")
    ).toBe(true);

    jest.advanceTimersByTime(100);
    pressKey(" ");

    expect(containsWords(displayElement, ["What", "is"], "current")).toBe(true);
    expect(containsWords(displayElement, ["going", "on", "right", "now?"], "after")).toBe(true);

    jest.advanceTimersByTime(100);
    pressKey(" ");

    expect(containsWords(displayElement, ["What", "is"], "before")).toBe(true);
    expect(containsWord(displayElement, "going", "current")).toBe(true);
    expect(containsWords(displayElement, ["on", "right", "now?"], "after")).toBe(true);

    jest.advanceTimersByTime(100);
    pressKey(" ");

    expect(containsWords(displayElement, ["What", "is", "going"], "before")).toBe(true);
    expect(containsWords(displayElement, ["on", "right", "now?"], "current")).toBe(true);

    jest.advanceTimersByTime(100);
    pressKey(" ");

    await expectFinished();

    // check blanked out word as data
    expect(getData().values()[0].results[0].segment).toBe("____ __");
    expect(getData().values()[0].results[1].segment).toBe("What is");
  });

  test("using custom gap character works", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychSpr,
        sentence: "Five big booms",
        mode: 1,
        gap_character: "X",
      },
    ]);

    expect(displayElement.innerHTML).toMatch(/.+X.+X./);
  });

  test("intra gap characters are removed", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychSpr,
        sentence: "What^does that^mean? Fish",
        mode: 1,
        gap_character: "X",
        intra_gap_character: false,
      },
    ]);

    // only X should appear at delimiter marks
    expect(displayElement.innerHTML).toMatch(/.+X.+X./);
  });
});
