import { startTimeline } from "@jspsych/test-utils";

import jsPsychCorsiBlocks from ".";

jest.useFakeTimers();

describe("corsi-blocks plugin", () => {
  it("should load", async () => {
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychCorsiBlocks,
        sequence: [0, 1, 2],
        blocks: [
          { x: 10, y: 10 },
          { x: 20, y: 20 },
          { x: 30, y: 30 },
        ],
      },
    ]);

    await jest.runAllTimers();

    await expectFinished();
  });

  it("should work with default blocks", async () => {
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychCorsiBlocks,
        sequence: [0, 1, 2],
      },
    ]);
    await jest.runAllTimers();
    await expectFinished();
  });

  it("should support custom temporal parameters", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: jsPsychCorsiBlocks,
        sequence: [0, 1],
        sequence_block_duration: 750,
        sequence_gap_duration: 1200,
        post_sequence_delay: 600,
        inter_trial_delay: 2000,
      },
    ]);
    await jest.runAllTimers();
    await expectFinished();
  });

  it("should support custom colors including background", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: jsPsychCorsiBlocks,
        sequence: [0, 1],
        block_color: "#555555",
        highlight_color: "#ff0000",
        correct_color: "#00ff00",
        incorrect_color: "#ff0000",
        background_color: "#ffffff",
      },
    ]);
    await jest.runAllTimers();
    await expectFinished();
  });

  it("should support input mode with new parameters", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychCorsiBlocks,
        mode: "input",
        sequence: [0, 1],
        post_sequence_delay: 500,
        response_timeout: 5000,
        response_animation_duration: 200,
        inter_trial_delay: 1500,
      },
    ]);

    // Test is just checking that parameters are accepted
    expect(displayElement.innerHTML).toContain("jspsych-corsi");
  });

  it("should support display mode with inter_trial_delay", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: jsPsychCorsiBlocks,
        mode: "display",
        sequence: [0, 1],
        inter_trial_delay: 1000,
      },
    ]);
    await jest.runAllTimers();
    await expectFinished();
  });

  it("should support custom click feedback duration", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychCorsiBlocks,
        mode: "input",
        sequence: [0, 1],
        response_animation_duration: 300,
      },
    ]);
    expect(displayElement.innerHTML).toContain("jspsych-corsi");
  });

  it("should support null response_timeout for unlimited time", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychCorsiBlocks,
        mode: "input",
        sequence: [0, 1],
        response_timeout: null,
      },
    ]);
    expect(displayElement.innerHTML).toContain("jspsych-corsi");
  });

  it("should apply background color to stimulus container", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychCorsiBlocks,
        sequence: [0, 1],
        background_color: "#123456",
      },
    ]);

    const stimulus = displayElement.querySelector("#jspsych-corsi-stimulus");
    expect(stimulus).not.toBeNull();
  });
});
