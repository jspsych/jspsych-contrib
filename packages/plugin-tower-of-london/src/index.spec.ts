import { startTimeline } from "@jspsych/test-utils";

import jsPsychTowerOfLondon from ".";

jest.useFakeTimers();

describe("tower-of-london plugin", () => {
  it("should load and display SVG", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        start_state: [["red", "green", "blue"], [], []],
        goal_state: [["blue"], ["green"], ["red"]],
      },
    ]);

    expect(displayElement.querySelector("#jspsych-tower-of-london-svg")).not.toBeNull();
  });

  it("should draw pegs as SVG rects", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        start_state: [["red", "green", "blue"], [], []],
        goal_state: [["blue"], ["green"], ["red"]],
        canvas_width: 500,
        canvas_height: 400,
      },
    ]);

    const svg = displayElement.querySelector("#jspsych-tower-of-london-svg")!;
    const rects = svg.querySelectorAll("rect");
    // Background + base + 3 pegs + goal inset rects
    expect(rects.length).toBeGreaterThanOrEqual(5);
  });

  it("should draw balls as SVG circles", async () => {
    const { displayElement } = await startTimeline([
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

    const svg = displayElement.querySelector("#jspsych-tower-of-london-svg")!;
    // Main balls (r=30) + goal balls (r=9)
    const circles = svg.querySelectorAll("circle");
    const mainBalls = Array.from(circles).filter((c) => c.getAttribute("r") === "30");
    expect(mainBalls.length).toBe(3);

    // Verify ball colors
    const fills = mainBalls.map((c) => c.getAttribute("fill"));
    expect(fills).toContain("#e74c3c");
    expect(fills).toContain("#27ae60");
    expect(fills).toContain("#3498db");
  });

  it("should draw goal inset with label when show_goal is true", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        start_state: [["red", "green", "blue"], [], []],
        goal_state: [["blue"], ["green"], ["red"]],
        show_goal: true,
      },
    ]);

    const svg = displayElement.querySelector("#jspsych-tower-of-london-svg")!;
    const text = svg.querySelector("text");
    expect(text).not.toBeNull();
    expect(text!.textContent).toBe("Goal");
  });

  it("should use custom goal_label text", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        show_goal: true,
        goal_label: "Target",
      },
    ]);

    const svg = displayElement.querySelector("#jspsych-tower-of-london-svg")!;
    const text = svg.querySelector("text");
    expect(text!.textContent).toBe("Target");

    // Goal balls should be drawn at smaller radius (30 * 0.3 = 9)
    const circles = svg.querySelectorAll("circle");
    const goalBalls = Array.from(circles).filter((c) => c.getAttribute("r") === "9");
    expect(goalBalls.length).toBe(3);
  });

  it("should not draw goal inset when show_goal is false", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        show_goal: false,
      },
    ]);

    const svg = displayElement.querySelector("#jspsych-tower-of-london-svg")!;
    expect(svg.querySelector("text")).toBeNull();
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
        end_delay: 0,
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
        end_delay: 0,
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

    const svg = displayElement.querySelector("#jspsych-tower-of-london-svg") as SVGSVGElement;
    expect(svg.getAttribute("width")).toBe("800");
    expect(svg.getAttribute("height")).toBe("600");
  });

  it("should scale peg heights by capacity", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        peg_capacities: [3, 2, 1],
        start_state: [["red"], [], []],
        goal_state: [[], ["red"], []],
        show_goal: false,
      },
    ]);

    const svg = displayElement.querySelector("#jspsych-tower-of-london-svg")!;
    const rects = Array.from(svg.querySelectorAll("rect"));
    // Filter for narrow peg rects (width=15)
    const pegRects = rects.filter((r) => r.getAttribute("width") === "15");
    expect(pegRects.length).toBe(3);

    const heights = pegRects.map((r) => parseInt(r.getAttribute("height")!));
    expect(heights[0]).toBeGreaterThan(heights[1]);
    expect(heights[1]).toBeGreaterThan(heights[2]);
  });

  it("should use custom ball radius", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        ball_radius: 40,
        start_state: [["red", "green", "blue"], [], []],
        goal_state: [["blue"], ["green"], ["red"]],
        show_goal: false,
      },
    ]);

    const svg = displayElement.querySelector("#jspsych-tower-of-london-svg")!;
    const circles = svg.querySelectorAll("circle");
    const ballsWithRadius40 = Array.from(circles).filter((c) => c.getAttribute("r") === "40");
    expect(ballsWithRadius40.length).toBe(3);
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

  it("should respond to click events on SVG", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychTowerOfLondon,
        start_state: [["red", "green", "blue"], [], []],
        goal_state: [["blue"], ["green"], ["red"]],
      },
    ]);

    const svg = displayElement.querySelector("#jspsych-tower-of-london-svg") as SVGSVGElement;

    svg.getBoundingClientRect = jest.fn(() => ({
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

    const clickEvent = new MouseEvent("click", {
      clientX: 125,
      clientY: 200,
      bubbles: true,
    });

    svg.dispatchEvent(clickEvent);

    // The SVG should still exist (test didn't crash)
    expect(displayElement.querySelector("#jspsych-tower-of-london-svg")).not.toBeNull();
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

    await expectRunning();

    expect(displayElement.querySelector("#jspsych-tower-of-london-svg")).not.toBeNull();

    jest.advanceTimersByTime(500);

    await expectFinished();
  });
});
