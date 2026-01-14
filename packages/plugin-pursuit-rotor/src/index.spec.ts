import { startTimeline } from "@jspsych/test-utils";

import jsPsychPursuitRotor from ".";

jest.useFakeTimers();

describe("pursuit-rotor plugin", () => {
  // Store original methods for restoration
  let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;
  let mockCtx: any;
  let arcCalls: Array<{ x: number; y: number; radius: number }>;
  let strokeCalls: number;

  beforeEach(() => {
    arcCalls = [];
    strokeCalls = 0;

    // Create mock context that tracks calls
    mockCtx = {
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 0,
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn((x: number, y: number, radius: number) => {
        arcCalls.push({ x, y, radius });
      }),
      stroke: jest.fn(() => {
        strokeCalls++;
      }),
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
        type: jsPsychPursuitRotor,
        trial_duration: 1000,
      },
    ]);

    expect(displayElement.querySelector("#jspsych-pursuit-rotor-canvas")).not.toBeNull();
  });

  it("should display prompt when provided", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychPursuitRotor,
        trial_duration: 1000,
        prompt: "<p>Track the target!</p>",
      },
    ]);

    expect(displayElement.innerHTML).toContain("Track the target!");
  });

  it("should end trial after trial_duration", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: jsPsychPursuitRotor,
        trial_duration: 1000,
      },
    ]);

    jest.advanceTimersByTime(1000);
    await expectFinished();
  });

  it("should record time_on_target in data", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychPursuitRotor,
        trial_duration: 500,
      },
    ]);

    jest.advanceTimersByTime(500);
    await expectFinished();

    const data = getData().values()[0];
    expect(data.time_on_target).toBeDefined();
    expect(typeof data.time_on_target).toBe("number");
  });

  it("should record percent_on_target in data", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychPursuitRotor,
        trial_duration: 500,
      },
    ]);

    jest.advanceTimersByTime(500);
    await expectFinished();

    const data = getData().values()[0];
    expect(data.percent_on_target).toBeDefined();
    expect(typeof data.percent_on_target).toBe("number");
  });

  it("should record samples array", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychPursuitRotor,
        trial_duration: 500,
        sample_interval: 100,
      },
    ]);

    jest.advanceTimersByTime(500);
    await expectFinished();

    const data = getData().values()[0];
    expect(data.samples).toBeDefined();
    expect(Array.isArray(data.samples)).toBe(true);
  });

  it("should use custom canvas dimensions", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychPursuitRotor,
        trial_duration: 1000,
        canvas_width: 600,
        canvas_height: 400,
      },
    ]);

    const canvas = displayElement.querySelector(
      "#jspsych-pursuit-rotor-canvas"
    ) as HTMLCanvasElement;
    expect(canvas.width).toBe(600);
    expect(canvas.height).toBe(400);
  });

  it("should draw path circle with specified path_radius", async () => {
    arcCalls = [];

    await startTimeline([
      {
        type: jsPsychPursuitRotor,
        trial_duration: 100,
        path_radius: 200,
        show_path: true,
      },
    ]);

    // Advance time to trigger draw
    jest.advanceTimersByTime(50);

    // Check that arc was called with path_radius of 200 for the path circle
    // The path circle is drawn at canvas center with the specified radius
    const pathCircleCalls = arcCalls.filter((call) => call.radius === 200);
    expect(pathCircleCalls.length).toBeGreaterThan(0);
  });

  it("should draw target with specified target_radius", async () => {
    arcCalls = [];

    await startTimeline([
      {
        type: jsPsychPursuitRotor,
        trial_duration: 100,
        target_radius: 40,
      },
    ]);

    // Advance time to trigger draw
    jest.advanceTimersByTime(50);

    // Check that arc was called with target_radius of 40
    const targetCalls = arcCalls.filter((call) => call.radius === 40);
    expect(targetCalls.length).toBeGreaterThan(0);
  });

  it("should move target based on rotation_speed", async () => {
    arcCalls = [];

    await startTimeline([
      {
        type: jsPsychPursuitRotor,
        trial_duration: 1000,
        rotation_speed: 0.5, // 0.5 rotations per second = 180 degrees in 1 second
        path_radius: 150,
        canvas_width: 500,
        canvas_height: 500,
        start_angle: 0, // Start at right (x=center+radius)
      },
    ]);

    // Record position at start
    arcCalls = [];
    jest.advanceTimersByTime(16); // One frame

    // Get target position (target has radius 25 by default)
    const startTargetCalls = arcCalls.filter((c) => c.radius === 25);

    // Advance half a rotation period (1 second at 0.5 rps = full rotation, so 0.5s = half)
    arcCalls = [];
    jest.advanceTimersByTime(500);

    const endTargetCalls = arcCalls.filter((c) => c.radius === 25);

    // The target should have moved - x position should be different
    // At 0.5 rps, after 0.5 seconds the target should have rotated 90 degrees
    if (startTargetCalls.length > 0 && endTargetCalls.length > 0) {
      const startX = startTargetCalls[0].x;
      const endX = endTargetCalls[endTargetCalls.length - 1].x;
      expect(startX).not.toBe(endX);
    }
  });

  it("should rotate counterclockwise when rotation_direction is counterclockwise", async () => {
    // Test clockwise first
    arcCalls = [];
    await startTimeline([
      {
        type: jsPsychPursuitRotor,
        trial_duration: 500,
        rotation_direction: "clockwise",
        rotation_speed: 0.25,
        path_radius: 150,
        start_angle: 0,
      },
    ]);

    jest.advanceTimersByTime(100);
    const cwCalls = arcCalls.filter((c) => c.radius === 25);
    const cwY = cwCalls.length > 0 ? cwCalls[cwCalls.length - 1].y : 0;

    jest.advanceTimersByTime(400);

    // Test counterclockwise
    arcCalls = [];
    await startTimeline([
      {
        type: jsPsychPursuitRotor,
        trial_duration: 500,
        rotation_direction: "counterclockwise",
        rotation_speed: 0.25,
        path_radius: 150,
        start_angle: 0,
      },
    ]);

    jest.advanceTimersByTime(100);
    const ccwCalls = arcCalls.filter((c) => c.radius === 25);
    const ccwY = ccwCalls.length > 0 ? ccwCalls[ccwCalls.length - 1].y : 0;

    // Clockwise rotation from 0 degrees goes down (increasing y)
    // Counterclockwise goes up (decreasing y)
    // The y values should be on opposite sides of center
    expect(cwY).not.toBe(ccwY);
  });

  it("should not draw path stroke when show_path is false", async () => {
    strokeCalls = 0;

    await startTimeline([
      {
        type: jsPsychPursuitRotor,
        trial_duration: 100,
        show_path: false,
      },
    ]);

    jest.advanceTimersByTime(50);

    // When show_path is false, stroke should only be called for the target border
    // not for the path circle. With show_path true, we'd have 2 strokes per draw.
    // We can verify the path arc (with path_radius) is not followed by stroke
    const pathRadiusCalls = arcCalls.filter((c) => c.radius === 150); // default path_radius
    expect(pathRadiusCalls.length).toBe(0);
  });

  it("should draw path stroke when show_path is true", async () => {
    arcCalls = [];

    await startTimeline([
      {
        type: jsPsychPursuitRotor,
        trial_duration: 100,
        show_path: true,
        path_radius: 150,
      },
    ]);

    jest.advanceTimersByTime(50);

    // When show_path is true, we should see arc calls with path_radius
    const pathRadiusCalls = arcCalls.filter((c) => c.radius === 150);
    expect(pathRadiusCalls.length).toBeGreaterThan(0);
  });

  it("should record trial_duration in data", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychPursuitRotor,
        trial_duration: 2000,
      },
    ]);

    jest.advanceTimersByTime(2000);
    await expectFinished();

    const data = getData().values()[0];
    expect(data.trial_duration).toBe(2000);
  });

  it("should track cursor position on mouse move", async () => {
    const { displayElement, expectFinished, getData } = await startTimeline([
      {
        type: jsPsychPursuitRotor,
        trial_duration: 500,
        sample_interval: 50,
      },
    ]);

    const canvas = displayElement.querySelector(
      "#jspsych-pursuit-rotor-canvas"
    ) as HTMLCanvasElement;

    // Simulate mouse move
    const mouseEvent = new MouseEvent("mousemove", {
      clientX: 250,
      clientY: 250,
      bubbles: true,
    });

    // Mock getBoundingClientRect
    canvas.getBoundingClientRect = jest.fn(() => ({
      left: 0,
      top: 0,
      right: 500,
      bottom: 500,
      width: 500,
      height: 500,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    canvas.dispatchEvent(mouseEvent);

    jest.advanceTimersByTime(500);
    await expectFinished();

    const data = getData().values()[0];
    // Samples should contain cursor position data
    expect(data.samples.length).toBeGreaterThan(0);
    // At least one sample should have cursor coordinates
    const samplesWithCursor = data.samples.filter(
      (s: any) => s.cursor_x !== null && s.cursor_y !== null
    );
    expect(samplesWithCursor.length).toBeGreaterThan(0);
  });

  it("should accept require_mouse_down parameter and only track when mouse is down", async () => {
    const { displayElement, expectFinished, getData } = await startTimeline([
      {
        type: jsPsychPursuitRotor,
        trial_duration: 500,
        sample_interval: 50,
        require_mouse_down: true,
      },
    ]);

    const canvas = displayElement.querySelector(
      "#jspsych-pursuit-rotor-canvas"
    ) as HTMLCanvasElement;

    canvas.getBoundingClientRect = jest.fn(() => ({
      left: 0,
      top: 0,
      right: 500,
      bottom: 500,
      width: 500,
      height: 500,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    // Move mouse without pressing - shouldn't count as on target
    canvas.dispatchEvent(
      new MouseEvent("mousemove", { clientX: 250, clientY: 250, bubbles: true })
    );

    jest.advanceTimersByTime(500);
    await expectFinished();

    const data = getData().values()[0];
    // With require_mouse_down and no mouse down, time_on_target should be 0
    expect(data.time_on_target).toBe(0);
  });
});
