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
      },
    ]);

    // Start
    jest.advanceTimersByTime(100);
    pressKey("f");

    for (const [_word, _foil] of sentence) {
      jest.advanceTimersByTime(100);
      pressKey("f");
    }

    await expectFinished();

    // Unclear to me why the values are wrapped in length 1 array
    for (const e of getData().select("events").values[0]) {
      expect(e.rt).toBe(100);
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
    for (const e of getData().select("events").values[0]) {
      expect(e.rt).toBe(100);
    }
  });
});
