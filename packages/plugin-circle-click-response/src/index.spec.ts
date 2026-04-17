import { clickTarget, startTimeline } from "@jspsych/test-utils";

import jsPsychCircleClickResponse from ".";

jest.useFakeTimers();

describe("circle-click-response", () => {
  it("renders stimulus and choices", async () => {
    const { expectRunning, getHTML } = await startTimeline([
      {
        type: jsPsychCircleClickResponse,
        stimulus: "<p>Center</p>",
        choices: ["<p>A</p>", "<p>B</p>", "<p>C</p>"],
      },
    ]);

    await expectRunning();
    expect(getHTML()).toContain("Center");
    expect(getHTML()).toContain("<p>A</p>");
    expect(getHTML()).toContain("<p>B</p>");
    expect(getHTML()).toContain("<p>C</p>");
  });

  it("renders the prompt when provided", async () => {
    const { expectRunning, getHTML } = await startTimeline([
      {
        type: jsPsychCircleClickResponse,
        stimulus: "<p>Center</p>",
        choices: ["<p>A</p>"],
        prompt: "<p>Pick one</p>",
      },
    ]);

    await expectRunning();
    expect(getHTML()).toContain("Pick one");
  });

  it("records response and rt on click", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychCircleClickResponse,
        stimulus: "<p>Center</p>",
        choices: ["<p>A</p>", "<p>B</p>", "<p>C</p>"],
      },
    ]);

    const choices = displayElement.querySelectorAll(".jspsych-circle-click-response-choice");
    await clickTarget(choices[1]);

    await expectFinished();
    const data = getData().values()[0];
    expect(data.response).toBe("<p>B</p>");
    expect(data.response_index).toBe(1);
    expect(data.rt).toBeGreaterThanOrEqual(0);
    expect(data.correct).toBeNull();
  });

  it("evaluates correctness when correct_choice is set", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychCircleClickResponse,
        stimulus: "<p>Center</p>",
        choices: ["<p>A</p>", "<p>B</p>", "<p>C</p>"],
        correct_choice: 2,
      },
    ]);

    const choices = displayElement.querySelectorAll(".jspsych-circle-click-response-choice");
    await clickTarget(choices[2]);

    await expectFinished();
    const data = getData().values()[0];
    expect(data.correct).toBe(true);
  });

  it("records incorrect when wrong choice is selected", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychCircleClickResponse,
        stimulus: "<p>Center</p>",
        choices: ["<p>A</p>", "<p>B</p>", "<p>C</p>"],
        correct_choice: 2,
      },
    ]);

    const choices = displayElement.querySelectorAll(".jspsych-circle-click-response-choice");
    await clickTarget(choices[0]);

    await expectFinished();
    const data = getData().values()[0];
    expect(data.correct).toBe(false);
  });

  it("ends trial after trial_duration with null response", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychCircleClickResponse,
        stimulus: "<p>Center</p>",
        choices: ["<p>A</p>", "<p>B</p>"],
        trial_duration: 500,
      },
    ]);

    jest.advanceTimersByTime(500);

    await expectFinished();
    const data = getData().values()[0];
    expect(data.response).toBeNull();
    expect(data.rt).toBeNull();
  });

  it("shows feedback and waits before ending trial", async () => {
    const { expectFinished, expectRunning, getHTML, displayElement } = await startTimeline([
      {
        type: jsPsychCircleClickResponse,
        stimulus: "<p>Center</p>",
        choices: ["<p>A</p>", "<p>B</p>"],
        correct_choice: 0,
        feedback_correct: "<p>Correct!</p>",
        feedback_incorrect: "<p>Wrong!</p>",
        feedback_duration: 1000,
      },
    ]);

    const choices = displayElement.querySelectorAll(".jspsych-circle-click-response-choice");
    await clickTarget(choices[0]);

    // Feedback should be visible, trial not yet finished
    expect(getHTML()).toContain("Correct!");

    jest.advanceTimersByTime(1000);
    await expectFinished();
  });

  it("shows incorrect feedback", async () => {
    const { expectFinished, getHTML, displayElement } = await startTimeline([
      {
        type: jsPsychCircleClickResponse,
        stimulus: "<p>Center</p>",
        choices: ["<p>A</p>", "<p>B</p>"],
        correct_choice: 0,
        feedback_correct: "<p>Correct!</p>",
        feedback_incorrect: "<p>Wrong!</p>",
        feedback_duration: 500,
      },
    ]);

    const choices = displayElement.querySelectorAll(".jspsych-circle-click-response-choice");
    await clickTarget(choices[1]);

    expect(getHTML()).toContain("Wrong!");

    jest.advanceTimersByTime(500);
    await expectFinished();
  });

  it("hides stimulus after stimulus_duration", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychCircleClickResponse,
        stimulus: "<p>Center</p>",
        choices: ["<p>A</p>"],
        stimulus_duration: 300,
      },
    ]);

    const stim = displayElement.querySelector(
      "#jspsych-circle-click-response-stimulus"
    ) as HTMLElement;
    expect(stim.style.visibility).not.toBe("hidden");

    jest.advanceTimersByTime(300);
    expect(stim.style.visibility).toBe("hidden");
  });

  it("positions choices in a circle with correct number of elements", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychCircleClickResponse,
        stimulus: "<p>Center</p>",
        choices: ["<p>1</p>", "<p>2</p>", "<p>3</p>", "<p>4</p>"],
        circle_radius: 150,
      },
    ]);

    const choices = displayElement.querySelectorAll(".jspsych-circle-click-response-choice");
    expect(choices.length).toBe(4);
  });
});
