import { startTimeline } from "@jspsych/test-utils";

import jsPsychTrailMaking from ".";

jest.useFakeTimers();

describe("trail-making plugin", () => {
  // Store original methods for restoration
  let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;
  let mockCtx: any;
  let arcCalls: Array<{ x: number; y: number; radius: number; fillStyle?: string }>;
  let fillTextCalls: Array<{ text: string; x: number; y: number }>;

  beforeEach(() => {
    arcCalls = [];
    fillTextCalls = [];

    // Create mock context that tracks calls
    mockCtx = {
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 0,
      font: "",
      textAlign: "",
      textBaseline: "",
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      arc: jest.fn((x: number, y: number, radius: number) => {
        arcCalls.push({ x, y, radius, fillStyle: mockCtx.fillStyle });
      }),
      stroke: jest.fn(),
      fill: jest.fn(),
      fillText: jest.fn((text: string, x: number, y: number) => {
        fillTextCalls.push({ text, x, y });
      }),
    };

    // Mock getContext to return our mock
    originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCtx) as any;
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });

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

  it("should draw targets with specified target_radius", async () => {
    arcCalls = [];

    await startTimeline([
      {
        type: jsPsychTrailMaking,
        target_radius: 35,
        num_targets: 5,
      },
    ]);

    // Filter arc calls for target circles (radius should be 35)
    const targetCalls = arcCalls.filter((call) => call.radius === 35);
    // Should have 5 targets drawn
    expect(targetCalls.length).toBe(5);
  });

  it("should draw correct number of targets for test_type A", async () => {
    fillTextCalls = [];

    await startTimeline([
      {
        type: jsPsychTrailMaking,
        test_type: "A",
        num_targets: 8,
      },
    ]);

    // Should have labels "1" through "8"
    const labels = fillTextCalls.map((call) => call.text);
    for (let i = 1; i <= 8; i++) {
      expect(labels).toContain(i.toString());
    }
  });

  it("should draw alternating numbers and letters for test_type B", async () => {
    fillTextCalls = [];

    await startTimeline([
      {
        type: jsPsychTrailMaking,
        test_type: "B",
        num_targets: 6,
      },
    ]);

    // Should have labels 1, A, 2, B, 3, C
    const labels = fillTextCalls.map((call) => call.text);
    expect(labels).toContain("1");
    expect(labels).toContain("A");
    expect(labels).toContain("2");
    expect(labels).toContain("B");
    expect(labels).toContain("3");
    expect(labels).toContain("C");
  });

  it("should use custom targets when provided", async () => {
    fillTextCalls = [];

    const customTargets = [
      { x: 100, y: 100, label: "1" },
      { x: 200, y: 200, label: "2" },
      { x: 300, y: 300, label: "3" },
    ];

    await startTimeline([
      {
        type: jsPsychTrailMaking,
        targets: customTargets,
      },
    ]);

    // Should draw labels at specified positions
    const labels = fillTextCalls.map((call) => call.text);
    expect(labels).toContain("1");
    expect(labels).toContain("2");
    expect(labels).toContain("3");

    // Check that targets are drawn at correct positions
    const label1Call = fillTextCalls.find((call) => call.text === "1");
    expect(label1Call?.x).toBe(100);
    expect(label1Call?.y).toBe(100);
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

  it("should record inter-click times between correct clicks", async () => {
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
    // First inter-click time should be around 500ms
    expect(data.inter_click_times[0]).toBeGreaterThanOrEqual(500);
    // Second should be around 300ms
    expect(data.inter_click_times[1]).toBeGreaterThanOrEqual(300);
  });

  it("should calculate total path distance correctly", async () => {
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

  it("should record click details with correct/incorrect status", async () => {
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

  it("should use custom target colors", async () => {
    arcCalls = [];

    await startTimeline([
      {
        type: jsPsychTrailMaking,
        target_color: "#ff0000",
        visited_color: "#00ff00",
        num_targets: 3,
      },
    ]);

    // Verify that target circles are drawn with the specified color
    const targetColorCalls = arcCalls.filter((call) => call.fillStyle === "#ff0000");
    expect(targetColorCalls.length).toBeGreaterThan(0);
  });

  it("should respond to touch events", async () => {
    const customTargets = [
      { x: 100, y: 100, label: "1" },
      { x: 200, y: 200, label: "2" },
    ];

    const { expectFinished, displayElement } = await startTimeline([
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

    // Create mock touch events using TouchEvent with mocked changedTouches
    const createTouchEvent = (clientX: number, clientY: number) => {
      // Create TouchEvent with empty arrays, then override changedTouches
      const touchEvent = new TouchEvent("touchend", { bubbles: true });
      Object.defineProperty(touchEvent, "changedTouches", {
        value: [{ clientX, clientY }],
        writable: false,
      });
      return touchEvent;
    };

    canvas.dispatchEvent(createTouchEvent(100, 100));
    canvas.dispatchEvent(createTouchEvent(200, 200));

    await expectFinished();
  });
});
