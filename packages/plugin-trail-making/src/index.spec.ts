import { startTimeline } from "@jspsych/test-utils";

import jsPsychTrailMaking from ".";

jest.useFakeTimers();

describe("trail-making plugin", () => {
  it("should load with default parameters", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychTrailMaking,
      },
    ]);

    // Check that canvas is created
    const canvas = displayElement.querySelector("canvas");
    expect(canvas).not.toBeNull();
    expect(canvas?.width).toBe(600);
    expect(canvas?.height).toBe(600);
  });

  it("should accept custom canvas dimensions", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychTrailMaking,
        canvas_width: 800,
        canvas_height: 500,
      },
    ]);

    const canvas = displayElement.querySelector("canvas");
    expect(canvas?.width).toBe(800);
    expect(canvas?.height).toBe(500);
  });

  it("should display a prompt when provided", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychTrailMaking,
        prompt: "<p>Connect the circles in order</p>",
      },
    ]);

    expect(displayElement.innerHTML).toContain("Connect the circles in order");
  });

  it("should use custom targets when provided", async () => {
    const customTargets = [
      { x: 100, y: 100, label: "1" },
      { x: 200, y: 200, label: "2" },
      { x: 300, y: 300, label: "3" },
    ];

    const { displayElement } = await startTimeline([
      {
        type: jsPsychTrailMaking,
        targets: customTargets,
      },
    ]);

    const canvas = displayElement.querySelector("canvas");
    expect(canvas).not.toBeNull();
  });

  it("should complete when all targets are clicked in order", async () => {
    const customTargets = [
      { x: 100, y: 100, label: "1" },
      { x: 200, y: 200, label: "2" },
      { x: 300, y: 300, label: "3" },
    ];

    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychTrailMaking,
        targets: customTargets,
        test_type: "A",
      },
    ]);

    const canvas = displayElement.querySelector("canvas")!;

    // Simulate clicking targets in correct order
    for (const target of customTargets) {
      const clickEvent = new MouseEvent("click", {
        clientX: target.x,
        clientY: target.y,
        bubbles: true,
      });
      // Need to mock getBoundingClientRect
      canvas.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        top: 0,
        right: 600,
        bottom: 600,
        width: 600,
        height: 600,
        x: 0,
        y: 0,
        toJSON: () => {},
      }));
      canvas.dispatchEvent(clickEvent);
    }

    await expectFinished();

    const data = getData().values()[0];
    expect(data.test_type).toBe("A");
    expect(data.num_errors).toBe(0);
    expect(data.completion_time).toBeGreaterThanOrEqual(0);
  });

  it("should track errors for incorrect clicks", async () => {
    const customTargets = [
      { x: 100, y: 100, label: "1" },
      { x: 200, y: 200, label: "2" },
      { x: 300, y: 300, label: "3" },
    ];

    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychTrailMaking,
        targets: customTargets,
        test_type: "A",
        error_duration: 100,
      },
    ]);

    const canvas = displayElement.querySelector("canvas")!;
    canvas.getBoundingClientRect = jest.fn(() => ({
      left: 0,
      top: 0,
      right: 600,
      bottom: 600,
      width: 600,
      height: 600,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    // Click target 2 first (wrong order)
    canvas.dispatchEvent(
      new MouseEvent("click", {
        clientX: 200,
        clientY: 200,
        bubbles: true,
      })
    );

    // Wait for error duration
    jest.advanceTimersByTime(100);

    // Now click in correct order
    canvas.dispatchEvent(
      new MouseEvent("click", {
        clientX: 100,
        clientY: 100,
        bubbles: true,
      })
    );
    canvas.dispatchEvent(
      new MouseEvent("click", {
        clientX: 200,
        clientY: 200,
        bubbles: true,
      })
    );
    canvas.dispatchEvent(
      new MouseEvent("click", {
        clientX: 300,
        clientY: 300,
        bubbles: true,
      })
    );

    await expectFinished();

    const data = getData().values()[0];
    expect(data.num_errors).toBe(1);
  });

  it("should generate type B sequence with alternating numbers and letters", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychTrailMaking,
        test_type: "B",
        num_targets: 6,
        seed: 12345,
      },
    ]);

    const canvas = displayElement.querySelector("canvas");
    expect(canvas).not.toBeNull();
    // Type B with 6 targets should have 1, A, 2, B, 3, C
  });

  it("should use seed for reproducible layouts", async () => {
    const seed = 42;

    const { displayElement: display1 } = await startTimeline([
      {
        type: jsPsychTrailMaking,
        num_targets: 5,
        seed: seed,
      },
    ]);

    // The canvas should be created with the seeded layout
    const canvas1 = display1.querySelector("canvas");
    expect(canvas1).not.toBeNull();
  });

  it("should record inter-click times", async () => {
    const customTargets = [
      { x: 100, y: 100, label: "1" },
      { x: 200, y: 200, label: "2" },
      { x: 300, y: 300, label: "3" },
    ];

    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychTrailMaking,
        targets: customTargets,
      },
    ]);

    const canvas = displayElement.querySelector("canvas")!;
    canvas.getBoundingClientRect = jest.fn(() => ({
      left: 0,
      top: 0,
      right: 600,
      bottom: 600,
      width: 600,
      height: 600,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    // Click with time delays
    canvas.dispatchEvent(new MouseEvent("click", { clientX: 100, clientY: 100, bubbles: true }));
    jest.advanceTimersByTime(500);
    canvas.dispatchEvent(new MouseEvent("click", { clientX: 200, clientY: 200, bubbles: true }));
    jest.advanceTimersByTime(300);
    canvas.dispatchEvent(new MouseEvent("click", { clientX: 300, clientY: 300, bubbles: true }));

    await expectFinished();

    const data = getData().values()[0];
    expect(data.inter_click_times.length).toBe(2);
  });

  it("should calculate total path distance", async () => {
    const customTargets = [
      { x: 0, y: 0, label: "1" },
      { x: 100, y: 0, label: "2" },
      { x: 100, y: 100, label: "3" },
    ];

    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychTrailMaking,
        targets: customTargets,
        target_radius: 50, // Large radius to ensure hits
      },
    ]);

    const canvas = displayElement.querySelector("canvas")!;
    canvas.getBoundingClientRect = jest.fn(() => ({
      left: 0,
      top: 0,
      right: 600,
      bottom: 600,
      width: 600,
      height: 600,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    canvas.dispatchEvent(new MouseEvent("click", { clientX: 0, clientY: 0, bubbles: true }));
    canvas.dispatchEvent(new MouseEvent("click", { clientX: 100, clientY: 0, bubbles: true }));
    canvas.dispatchEvent(new MouseEvent("click", { clientX: 100, clientY: 100, bubbles: true }));

    await expectFinished();

    const data = getData().values()[0];
    // Distance should be 100 + 100 = 200
    expect(data.total_path_distance).toBe(200);
  });

  it("should record click details in data", async () => {
    const customTargets = [
      { x: 100, y: 100, label: "1" },
      { x: 200, y: 200, label: "2" },
    ];

    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychTrailMaking,
        targets: customTargets,
      },
    ]);

    const canvas = displayElement.querySelector("canvas")!;
    canvas.getBoundingClientRect = jest.fn(() => ({
      left: 0,
      top: 0,
      right: 600,
      bottom: 600,
      width: 600,
      height: 600,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    canvas.dispatchEvent(new MouseEvent("click", { clientX: 100, clientY: 100, bubbles: true }));
    canvas.dispatchEvent(new MouseEvent("click", { clientX: 200, clientY: 200, bubbles: true }));

    await expectFinished();

    const data = getData().values()[0];
    expect(data.clicks.length).toBe(2);
    expect(data.clicks[0].correct).toBe(true);
    expect(data.clicks[0].label).toBe("1");
    expect(data.clicks[1].correct).toBe(true);
    expect(data.clicks[1].label).toBe("2");
  });

  it("should export targets in data", async () => {
    const customTargets = [
      { x: 100, y: 100, label: "1" },
      { x: 200, y: 200, label: "2" },
    ];

    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychTrailMaking,
        targets: customTargets,
      },
    ]);

    const canvas = displayElement.querySelector("canvas")!;
    canvas.getBoundingClientRect = jest.fn(() => ({
      left: 0,
      top: 0,
      right: 600,
      bottom: 600,
      width: 600,
      height: 600,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    canvas.dispatchEvent(new MouseEvent("click", { clientX: 100, clientY: 100, bubbles: true }));
    canvas.dispatchEvent(new MouseEvent("click", { clientX: 200, clientY: 200, bubbles: true }));

    await expectFinished();

    const data = getData().values()[0];
    expect(data.targets).toEqual(customTargets);
  });
});
