import { clickTarget, startTimeline } from "@jspsych/test-utils";

import jsPsychBart from ".";

jest.useFakeTimers();

describe("jsPsych BART plugin", () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  it("should load with basic parameters", async () => {
    const { getHTML } = await startTimeline([
      {
        type: jsPsychBart,
        pop_threshold: 10,
      },
    ]);

    expect(getHTML()).toContain('id="jspsych-bart-container"');
    expect(getHTML()).toContain('id="jspsych-bart-balloon-svg"');
    expect(getHTML()).toContain('id="jspsych-bart-pump-button"');
    expect(getHTML()).toContain('id="jspsych-bart-collect-button"');
  });

  it("should display total points when show_total_points is true", async () => {
    const { getHTML } = await startTimeline([
      {
        type: jsPsychBart,
        pop_threshold: 10,
        show_total_points: true,
        starting_total_points: 50,
      },
    ]);

    expect(getHTML()).toContain('id="jspsych-bart-total-points"');
    expect(getHTML()).toContain("50");
  });

  it("should hide total points when show_total_points is false", async () => {
    const { getHTML } = await startTimeline([
      {
        type: jsPsychBart,
        pop_threshold: 10,
        show_total_points: false,
      },
    ]);

    expect(getHTML()).not.toContain('id="jspsych-bart-total-points"');
  });

  it("should display balloon value when show_balloon_value is true", async () => {
    const { getHTML } = await startTimeline([
      {
        type: jsPsychBart,
        pop_threshold: 10,
        show_balloon_value: true,
      },
    ]);

    expect(getHTML()).toContain('id="jspsych-bart-balloon-value"');
    expect(getHTML()).toContain("Balloon Value");
  });

  it("should hide balloon value when show_balloon_value is false", async () => {
    const { getHTML } = await startTimeline([
      {
        type: jsPsychBart,
        pop_threshold: 10,
        show_balloon_value: false,
      },
    ]);

    expect(getHTML()).not.toContain('id="jspsych-bart-balloon-value"');
  });

  it("should allow collecting without pumping", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychBart,
        pop_threshold: 10,
        starting_total_points: 100,
      },
    ]);

    const collect_button = displayElement.querySelector(
      "#jspsych-bart-collect-button"
    ) as HTMLButtonElement;

    // Advance timers slightly to simulate time passing
    jest.advanceTimersByTime(100);

    clickTarget(collect_button);

    // Advance timers to complete the trial end delay
    jest.advanceTimersByTime(500);

    await expectFinished();

    const data = getData().values()[0];
    expect(data.pumps).toBe(0);
    expect(data.popped).toBe(false);
    expect(data.points_earned).toBe(0);
    expect(data.total_points).toBe(100);
    expect(data.pump_times).toEqual([]);
    expect(data.collect_time).toBeGreaterThan(0);
  });

  it("should pump balloon and collect points", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychBart,
        pop_threshold: 10,
        points_per_pump: 5,
        starting_total_points: 100,
      },
    ]);

    const pump_button = displayElement.querySelector(
      "#jspsych-bart-pump-button"
    ) as HTMLButtonElement;
    const collect_button = displayElement.querySelector(
      "#jspsych-bart-collect-button"
    ) as HTMLButtonElement;

    // Pump 3 times
    clickTarget(pump_button);
    jest.advanceTimersByTime(200);

    clickTarget(pump_button);
    jest.advanceTimersByTime(200);

    clickTarget(pump_button);
    jest.advanceTimersByTime(200);

    // Collect
    clickTarget(collect_button);
    jest.advanceTimersByTime(500);

    await expectFinished();

    const data = getData().values()[0];
    expect(data.pumps).toBe(3);
    expect(data.popped).toBe(false);
    expect(data.points_earned).toBe(15); // 3 pumps * 5 points
    expect(data.total_points).toBe(115); // 100 starting + 15 earned
    expect(data.pump_times.length).toBe(3);
    expect(data.collect_time).toBeGreaterThan(0);
  });

  it("should pop balloon when threshold is reached", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychBart,
        pop_threshold: 3,
        points_per_pump: 10,
        starting_total_points: 50,
      },
    ]);

    const pump_button = displayElement.querySelector(
      "#jspsych-bart-pump-button"
    ) as HTMLButtonElement;

    // Pump to threshold
    clickTarget(pump_button);
    jest.advanceTimersByTime(200);

    clickTarget(pump_button);
    jest.advanceTimersByTime(200);

    clickTarget(pump_button);
    jest.advanceTimersByTime(800); // pop animation + delay

    await expectFinished();

    const data = getData().values()[0];
    expect(data.pumps).toBe(3);
    expect(data.popped).toBe(true);
    expect(data.points_earned).toBe(0); // Lost all points
    expect(data.total_points).toBe(50); // Back to starting points
    expect(data.pump_times.length).toBe(3);
    expect(data.collect_time).toBeNull();
  });

  it("should record pump times correctly", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychBart,
        pop_threshold: 10,
      },
    ]);

    const pump_button = displayElement.querySelector(
      "#jspsych-bart-pump-button"
    ) as HTMLButtonElement;
    const collect_button = displayElement.querySelector(
      "#jspsych-bart-collect-button"
    ) as HTMLButtonElement;

    // Pump twice with different time gaps
    jest.advanceTimersByTime(100);
    clickTarget(pump_button);
    jest.advanceTimersByTime(200);

    jest.advanceTimersByTime(150);
    clickTarget(pump_button);
    jest.advanceTimersByTime(200);

    clickTarget(collect_button);
    jest.advanceTimersByTime(500);

    await expectFinished();

    const data = getData().values()[0];
    expect(data.pump_times.length).toBe(2);
    expect(data.pump_times[0]).toBeGreaterThan(0);
    expect(data.pump_times[1]).toBeGreaterThan(data.pump_times[0]);
  });

  it("should disable buttons during animation", async () => {
    const { expectFinished, displayElement } = await startTimeline([
      {
        type: jsPsychBart,
        pop_threshold: 10,
        pump_animation_duration: 500,
      },
    ]);

    const pump_button = displayElement.querySelector(
      "#jspsych-bart-pump-button"
    ) as HTMLButtonElement;
    const collect_button = displayElement.querySelector(
      "#jspsych-bart-collect-button"
    ) as HTMLButtonElement;

    // Click pump
    clickTarget(pump_button);

    // Buttons should be disabled immediately
    expect(pump_button.disabled).toBe(true);
    expect(collect_button.disabled).toBe(true);

    // Complete animation
    jest.advanceTimersByTime(500);

    // Buttons should be enabled again
    expect(pump_button.disabled).toBe(false);
    expect(collect_button.disabled).toBe(false);

    // Clean up
    clickTarget(collect_button);
    jest.advanceTimersByTime(500);
    await expectFinished();
  });

  it("should use custom button labels", async () => {
    const { getHTML } = await startTimeline([
      {
        type: jsPsychBart,
        pop_threshold: 10,
        pump_button_label: "Inflate",
        collect_button_label: "Cash Out",
      },
    ]);

    expect(getHTML()).toContain("Inflate");
    expect(getHTML()).toContain("Cash Out");
  });

  it("should apply custom balloon color", async () => {
    const { getHTML } = await startTimeline([
      {
        type: jsPsychBart,
        pop_threshold: 10,
        balloon_color: "#0000ff",
      },
    ]);

    expect(getHTML()).toContain("#0000ff");
  });

  it("should scale balloon with custom starting size and increment", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychBart,
        pop_threshold: 10,
        balloon_starting_size: 0.3,
        balloon_size_increment: 0.1,
      },
    ]);

    const balloon_group = displayElement.querySelector(
      "#jspsych-bart-balloon-group"
    ) as SVGGElement;

    // Check initial scale
    expect(balloon_group.getAttribute("transform")).toContain("scale(0.3)");
  });

  it("should update balloon value display on pump", async () => {
    const { displayElement, getHTML } = await startTimeline([
      {
        type: jsPsychBart,
        pop_threshold: 10,
        points_per_pump: 7,
        show_balloon_value: true,
      },
    ]);

    const pump_button = displayElement.querySelector(
      "#jspsych-bart-pump-button"
    ) as HTMLButtonElement;

    // Initial value should be 0
    expect(getHTML()).toContain('id="jspsych-bart-balloon-value-number">0</span>');

    // Pump once
    clickTarget(pump_button);
    jest.advanceTimersByTime(200);

    const value_element = displayElement.querySelector(
      "#jspsych-bart-balloon-value-number"
    ) as HTMLElement;
    expect(value_element.textContent).toBe("7");

    // Pump again
    clickTarget(pump_button);
    jest.advanceTimersByTime(200);

    expect(value_element.textContent).toBe("14");

    // Clean up
    const collect_button = displayElement.querySelector(
      "#jspsych-bart-collect-button"
    ) as HTMLButtonElement;
    clickTarget(collect_button);
    jest.advanceTimersByTime(500);
  });

  it("should handle pop at threshold exactly", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychBart,
        pop_threshold: 1, // Pop on first pump
      },
    ]);

    const pump_button = displayElement.querySelector(
      "#jspsych-bart-pump-button"
    ) as HTMLButtonElement;

    clickTarget(pump_button);
    jest.advanceTimersByTime(800); // pop animation + delay

    await expectFinished();

    const data = getData().values()[0];
    expect(data.pumps).toBe(1);
    expect(data.popped).toBe(true);
  });

  it("should not allow multiple simultaneous pumps", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychBart,
        pop_threshold: 10,
        pump_animation_duration: 500,
      },
    ]);

    const pump_button = displayElement.querySelector(
      "#jspsych-bart-pump-button"
    ) as HTMLButtonElement;

    // Rapid clicks
    clickTarget(pump_button);
    clickTarget(pump_button);
    clickTarget(pump_button);

    // Only first click should register
    jest.advanceTimersByTime(500);

    const value_element = displayElement.querySelector(
      "#jspsych-bart-balloon-value-number"
    ) as HTMLElement;
    expect(value_element.textContent).toBe("1");
  });
});
