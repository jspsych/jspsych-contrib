import { startTimeline } from "@jspsych/test-utils";

import jsPsychTowerOfLondon from ".";

jest.useFakeTimers();

describe("tower-of-london plugin", () => {
  it("should load and display canvas", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        start_state: [["red", "green", "blue"], [], []],
        goal_state: [["blue"], ["green"], ["red"]],
      },
    ]);

    expect(displayElement.querySelector("#jspsych-tower-of-london-canvas")).not.toBeNull();
  });

  it("should show goal display when show_goal is true", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        show_goal: true,
      },
    ]);

    expect(displayElement.querySelector("#jspsych-tower-of-london-goal-canvas")).not.toBeNull();
  });

  it("should hide goal display when show_goal is false", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        show_goal: false,
      },
    ]);

    expect(displayElement.querySelector("#jspsych-tower-of-london-goal-canvas")).toBeNull();
  });

  it("should show move counter when show_move_counter is true", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        show_move_counter: true,
      },
    ]);

    expect(displayElement.querySelector("#move-count")).not.toBeNull();
  });

  it("should hide move counter when show_move_counter is false", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        show_move_counter: false,
      },
    ]);

    expect(displayElement.querySelector("#move-count")).toBeNull();
  });

  it("should show done button when done_button_text is set", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        done_button_text: "Done",
      },
    ]);

    expect(displayElement.querySelector("#jspsych-tower-of-london-done")).not.toBeNull();
  });

  it("should display prompt when provided", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        prompt: "<p>Test prompt</p>",
      },
    ]);

    expect(displayElement.innerHTML).toContain("Test prompt");
  });

  it("should end trial when done button is clicked", async () => {
    const { expectFinished, displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        done_button_text: "Done",
      },
    ]);

    (displayElement.querySelector("#jspsych-tower-of-london-done") as HTMLButtonElement).click();

    await expectFinished();
  });

  it("should end trial when time_limit is reached", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        time_limit: 1000,
      },
    ]);

    jest.advanceTimersByTime(1000);

    await expectFinished();
  });

  it("should record start_state and goal_state in data", async () => {
    const startState = [["red", "green"], ["blue"], []];
    const goalState = [[], ["red"], ["green", "blue"]];

    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        start_state: startState,
        goal_state: goalState,
        done_button_text: "Done",
      },
    ]);

    (displayElement.querySelector("#jspsych-tower-of-london-done") as HTMLButtonElement).click();

    await expectFinished();

    const data = getData().values()[0];
    expect(data.start_state).toEqual(startState);
    expect(data.goal_state).toEqual(goalState);
  });

  it("should record solved as false when goal not reached", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        start_state: [["red", "green", "blue"], [], []],
        goal_state: [["blue"], ["green"], ["red"]],
        done_button_text: "Done",
      },
    ]);

    (displayElement.querySelector("#jspsych-tower-of-london-done") as HTMLButtonElement).click();

    await expectFinished();

    const data = getData().values()[0];
    expect(data.solved).toBe(false);
    expect(data.num_moves).toBe(0);
  });

  it("should record rt in milliseconds", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        done_button_text: "Done",
      },
    ]);

    jest.advanceTimersByTime(500);

    (displayElement.querySelector("#jspsych-tower-of-london-done") as HTMLButtonElement).click();

    await expectFinished();

    const data = getData().values()[0];
    expect(data.rt).toBeGreaterThanOrEqual(500);
  });

  it("should use custom canvas dimensions", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        canvas_width: 800,
        canvas_height: 600,
      },
    ]);

    const canvas = displayElement.querySelector(
      "#jspsych-tower-of-london-canvas"
    ) as HTMLCanvasElement;
    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(600);
  });

  it("should use custom peg capacities", async () => {
    // This test just verifies the parameter is accepted without error
    const { displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        peg_capacities: [1, 2, 3],
      },
    ]);

    expect(displayElement.querySelector("#jspsych-tower-of-london-canvas")).not.toBeNull();
  });

  it("should initialize moves array as empty", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        done_button_text: "Done",
      },
    ]);

    (displayElement.querySelector("#jspsych-tower-of-london-done") as HTMLButtonElement).click();

    await expectFinished();

    const data = getData().values()[0];
    expect(data.moves).toEqual([]);
  });

  it("should set optimal to null when optimal_moves not specified", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        done_button_text: "Done",
      },
    ]);

    (displayElement.querySelector("#jspsych-tower-of-london-done") as HTMLButtonElement).click();

    await expectFinished();

    const data = getData().values()[0];
    expect(data.optimal).toBeNull();
  });
});
