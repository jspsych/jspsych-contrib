import { startTimeline } from "@jspsych/test-utils";

import jsPsychPursuitRotor from ".";

jest.useFakeTimers();

describe("pursuit-rotor plugin", () => {
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

  it("should accept custom path_radius parameter", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychPursuitRotor,
        trial_duration: 1000,
        path_radius: 200,
      },
    ]);

    expect(displayElement.querySelector("#jspsych-pursuit-rotor-canvas")).not.toBeNull();
  });

  it("should accept custom target_radius parameter", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychPursuitRotor,
        trial_duration: 1000,
        target_radius: 30,
      },
    ]);

    expect(displayElement.querySelector("#jspsych-pursuit-rotor-canvas")).not.toBeNull();
  });

  it("should accept custom rotation_speed parameter", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychPursuitRotor,
        trial_duration: 1000,
        rotation_speed: 0.25,
      },
    ]);

    expect(displayElement.querySelector("#jspsych-pursuit-rotor-canvas")).not.toBeNull();
  });

  it("should accept counterclockwise rotation direction", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychPursuitRotor,
        trial_duration: 1000,
        rotation_direction: "counterclockwise",
      },
    ]);

    expect(displayElement.querySelector("#jspsych-pursuit-rotor-canvas")).not.toBeNull();
  });

  it("should hide path when show_path is false", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychPursuitRotor,
        trial_duration: 1000,
        show_path: false,
      },
    ]);

    // Canvas should still exist
    expect(displayElement.querySelector("#jspsych-pursuit-rotor-canvas")).not.toBeNull();
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

  it("should accept require_mouse_down parameter", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychPursuitRotor,
        trial_duration: 1000,
        require_mouse_down: true,
      },
    ]);

    expect(displayElement.querySelector("#jspsych-pursuit-rotor-canvas")).not.toBeNull();
  });
});
