import { startTimeline } from "@jspsych/test-utils";

import jsPsychTowerOfLondon from ".";

jest.useFakeTimers();

describe("tower-of-london plugin", () => {
  // Store original methods for restoration
  let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;
  let mockCtx: any;
  let arcCalls: Array<{ x: number; y: number; radius: number; fillStyle?: string }>;
  let fillRectCalls: Array<{ x: number; y: number; width: number; height: number }>;

  beforeEach(() => {
    arcCalls = [];
    fillRectCalls = [];

    // Create mock context that tracks calls
    mockCtx = {
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 0,
      fillRect: jest.fn((x: number, y: number, w: number, h: number) => {
        fillRectCalls.push({ x, y, width: w, height: h });
      }),
      strokeRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn((x: number, y: number, radius: number) => {
        arcCalls.push({ x, y, radius, fillStyle: mockCtx.fillStyle });
      }),
      stroke: jest.fn(),
      fill: jest.fn(),
    };

    // Mock getContext to return our mock
    originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCtx) as any;
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });

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

  it("should draw pegs and base on canvas", async () => {
    fillRectCalls = [];

    await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        start_state: [["red", "green", "blue"], [], []],
        goal_state: [["blue"], ["green"], ["red"]],
        canvas_width: 500,
        canvas_height: 400,
      },
    ]);

    // Should have fillRect calls for:
    // - Background clear
    // - Base (horizontal bar at bottom)
    // - 3 pegs (vertical bars)
    expect(fillRectCalls.length).toBeGreaterThanOrEqual(4);

    // Base should be near the bottom of the canvas
    const baseCalls = fillRectCalls.filter((call) => call.y > 350);
    expect(baseCalls.length).toBeGreaterThan(0);
  });

  it("should draw balls with correct colors on canvas", async () => {
    arcCalls = [];

    await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        start_state: [["red", "green", "blue"], [], []],
        goal_state: [["blue"], ["green"], ["red"]],
        ball_colors: {
          red: "#e74c3c",
          green: "#27ae60",
          blue: "#3498db",
        },
      },
    ]);

    // Should have arc calls for balls (radius = 30 by default)
    const ballCalls = arcCalls.filter((call) => call.radius === 30);
    expect(ballCalls.length).toBe(3); // 3 balls in start_state

    // Verify ball colors are being used
    const colors = ballCalls.map((call) => call.fillStyle);
    expect(colors).toContain("#e74c3c"); // red
    expect(colors).toContain("#27ae60"); // green
    expect(colors).toContain("#3498db"); // blue
  });

  it("should show goal display when show_goal is true and draw goal state", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        start_state: [["red", "green", "blue"], [], []],
        goal_state: [["blue"], ["green"], ["red"]],
        show_goal: true,
      },
    ]);

    const goalCanvas = displayElement.querySelector(
      "#jspsych-tower-of-london-goal-canvas"
    ) as HTMLCanvasElement;
    expect(goalCanvas).not.toBeNull();

    // Goal canvas should be smaller than main canvas
    const mainCanvas = displayElement.querySelector(
      "#jspsych-tower-of-london-canvas"
    ) as HTMLCanvasElement;
    expect(goalCanvas.width).toBeLessThan(mainCanvas.width);
    expect(goalCanvas.height).toBeLessThan(mainCanvas.height);
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

    const counter = displayElement.querySelector("#move-count");
    expect(counter).not.toBeNull();
    expect(counter?.textContent).toBe("0");
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

    const button = displayElement.querySelector(
      "#jspsych-tower-of-london-done"
    ) as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.textContent).toBe("Done");
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
        end_delay: 0, // Skip delay for this test
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
        end_delay: 0, // Skip delay for this test
      },
    ]);

    jest.advanceTimersByTime(1000);

    await expectFinished();
  });

  it("should record start_state and goal_state in data", async () => {
    const startState = [["red", "green"], ["blue"], []] as [string[], string[], string[]];
    const goalState = [[], ["red"], ["green", "blue"]] as [string[], string[], string[]];

    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        start_state: startState,
        goal_state: goalState,
        done_button_text: "Done",
        end_delay: 0,
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
        end_delay: 0,
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
        end_delay: 0,
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

  it("should use custom peg capacities and draw capacity indicators", async () => {
    arcCalls = [];

    await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        peg_capacities: [3, 2, 1],
        start_state: [["red"], [], []],
        goal_state: [[], ["red"], []],
      },
    ]);

    // Capacity indicators are drawn as small dots (radius 3)
    const capacityIndicators = arcCalls.filter((call) => call.radius === 3);
    // Should have 3 + 2 + 1 = 6 capacity indicator dots
    expect(capacityIndicators.length).toBe(6);
  });

  it("should use custom ball radius", async () => {
    arcCalls = [];

    await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        ball_radius: 40,
        start_state: [["red", "green", "blue"], [], []],
        goal_state: [["blue"], ["green"], ["red"]],
      },
    ]);

    // Balls should be drawn with radius 40
    const ballCalls = arcCalls.filter((call) => call.radius === 40);
    expect(ballCalls.length).toBe(3);
  });

  it("should initialize moves array as empty", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        done_button_text: "Done",
        end_delay: 0,
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
        end_delay: 0,
      },
    ]);

    (displayElement.querySelector("#jspsych-tower-of-london-done") as HTMLButtonElement).click();

    await expectFinished();

    const data = getData().values()[0];
    expect(data.optimal).toBeNull();
  });

  it("should respond to click events on canvas", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        start_state: [["red", "green", "blue"], [], []],
        goal_state: [["blue"], ["green"], ["red"]],
      },
    ]);

    const canvas = displayElement.querySelector(
      "#jspsych-tower-of-london-canvas"
    ) as HTMLCanvasElement;

    // Mock getBoundingClientRect for click position calculation
    canvas.getBoundingClientRect = jest.fn(() => ({
      left: 0,
      top: 0,
      right: 500,
      bottom: 400,
      width: 500,
      height: 400,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    // Click on first peg area (around x=125 for a 500px wide canvas)
    const clickEvent = new MouseEvent("click", {
      clientX: 125,
      clientY: 200,
      bubbles: true,
    });

    canvas.dispatchEvent(clickEvent);

    // The canvas should still exist (test didn't crash)
    expect(displayElement.querySelector("#jspsych-tower-of-london-canvas")).not.toBeNull();
  });

  it("should delay trial end by end_delay duration", async () => {
    const { expectFinished, expectRunning, displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        done_button_text: "Done",
        end_delay: 500,
      },
    ]);

    (displayElement.querySelector("#jspsych-tower-of-london-done") as HTMLButtonElement).click();

    // Trial should still be running (canvas shown for feedback)
    await expectRunning();

    // Canvas should still be visible during delay
    expect(displayElement.querySelector("#jspsych-tower-of-london-canvas")).not.toBeNull();

    // Advance past the delay
    jest.advanceTimersByTime(500);

    await expectFinished();
  });
});
