import { pressKey, startTimeline } from "@jspsych/test-utils";

import jsPsychMaze from ".";

jest.useFakeTimers();

describe("The maze jspsych plugin", () => {
  it("Runs maze", async () => {
    const sentence = [
      ["The", "x-x-x"],
      ["fashion", "realize"],
      ["model", "shirt"],
      ["was", "see"],
      ["very", "into"],
      ["self-conscious", "professionally"],
      ["of", "do"],
      ["her", "why"],
      ["appearance", "sandwiches"],
    ];
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychMaze,
        sentence: sentence,
        waiting_time: 50,
      },
    ]);

    // Start
    jest.advanceTimersByTime(100);
    pressKey("f");

    // This one is too fast and should be ignored
    jest.advanceTimersByTime(10);
    pressKey("f");

    for (const [_word, _foil] of sentence) {
      jest.advanceTimersByTime(100);
      pressKey("f");
    }

    await expectFinished();

    // Unclear to me why the values are wrapped in length 1 array
    for (const [i, [word, foil], r] of getData()
      .select("events")
      .values[0].map((r: Response, i: number) => [i, sentence[i], r])) {
      expect(r.word).toBe(word);
      expect(r.foil).toBe(foil);
      // FIXME: make this better, probably with different rts
      // We first waited 10s before the first word
      expect(r.rt).toBe(0 === i ? 110 : 100);
    }
  });
  it("Asks questions", async () => {
    const sentence = [
      ["The", "x-x-x"],
      ["fashion", "realize"],
      ["model", "shirt"],
      ["was", "see"],
      ["very", "into"],
      ["self-conscious", "professionally"],
      ["of", "do"],
      ["her", "why"],
      ["appearance", "sandwiches"],
    ];
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychMaze,
        sentence: sentence,
        question: {
          text: "Who was self-conscious?",
          correct: "The model",
          wrong: "The designer",
        },
      },
    ]);

    // Start
    jest.advanceTimersByTime(100);
    pressKey("f");

    for (const [_word, _foil] of sentence) {
      jest.advanceTimersByTime(100);
      pressKey("f");
    }

    // Question
    jest.advanceTimersByTime(100);
    pressKey("f");

    await expectFinished();

    // Unclear to me why the values are wrapped in length 1 array
    for (const [[word, foil], r] of getData()
      .select("events")
      .values[0].map((r: Response, i: number) => [sentence[i], r])) {
      expect(r.word).toBe(word);
      expect(r.foil).toBe(foil);
      expect(r.rt).toBe(100);
    }
  });
});
