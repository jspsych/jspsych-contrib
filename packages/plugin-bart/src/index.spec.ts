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

  it("should apply custom info box and text colors", async () => {
    const { getHTML } = await startTimeline([
      {
        type: jsPsychBart,
        pop_threshold: 10,
        value_text_color: "rgb(10, 20, 30)",
        label_text_color: "rgb(40, 50, 60)",
        info_box_border_color: "rgb(70, 80, 90)",
        info_box_background_color: "rgb(100, 110, 120)",
      },
    ]);

    const html = getHTML();
    expect(html).toContain("rgb(10, 20, 30)");
    expect(html).toContain("rgb(40, 50, 60)");
    expect(html).toContain("rgb(70, 80, 90)");
    expect(html).toContain("rgb(100, 110, 120)");
  });

  it("should use currentColor-based defaults for info box and text colors", async () => {
    const { getHTML } = await startTimeline([
      {
        type: jsPsychBart,
        pop_threshold: 10,
      },
    ]);

    const html = getHTML();
    // Defaults inherit the surrounding text color so they adapt to light/dark themes
    expect(html).toContain("currentColor");
    // Hard-coded legacy colors should no longer be present
    expect(html).not.toContain("#333");
    expect(html).not.toContain("#666");
    expect(html).not.toContain("#f0f0f0");
  });

  it("should apply a custom balloon stage height", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychBart,
        pop_threshold: 10,
        balloon_stage_height: 600,
      },
    ]);

    const container = displayElement.querySelector(
      "#jspsych-bart-balloon-container"
    ) as HTMLElement;
    expect(container.style.height).toBe("600px");

    const svg = displayElement.querySelector("#jspsych-bart-balloon-svg") as SVGSVGElement;
    expect(svg.getAttribute("height")).toBe("600");
    // Width preserves the 300:400 (0.75) aspect ratio of the viewBox
    expect(svg.getAttribute("width")).toBe("450");
    // viewBox stays at the original coordinate system so balloon math is unaffected
    expect(svg.getAttribute("viewBox")).toBe("0 0 300 400");
  });

  it("should default the balloon stage height to 400px", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychBart,
        pop_threshold: 10,
      },
    ]);

    const container = displayElement.querySelector(
      "#jspsych-bart-balloon-container"
    ) as HTMLElement;
    expect(container.style.height).toBe("400px");
  });

  it("should scale balloon with custom starting size and increment", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychBart,
        pop_threshold: 10,
        balloon_starting_size: 0.3,
        balloon_size_increment: 0.1,
        max_pumps: 20, // default
      },
    ]);

    const balloon_group = displayElement.querySelector(
      "#jspsych-bart-balloon-group"
    ) as SVGGElement;

    // Check that starting scale remains constant
    // With starting_size=0.3, increment=0.1, max_pumps=20
    // New approach: keep starting_size=0.3 constant
    // Adjusted increment: (1.17 - 0.3) / 20 = 0.0435
    const transform = balloon_group.getAttribute("transform");
    expect(transform).toContain("scale(");
    // Verify starting size is kept at 0.3
    const scaleMatch = transform.match(/scale\(([0-9.]+)\)/);
    expect(scaleMatch).not.toBeNull();
    const actualScale = parseFloat(scaleMatch[1]);
    expect(actualScale).toBeCloseTo(0.3, 2);
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
    expect(getHTML()).toContain('id="jspsych-bart-balloon-value-number">0 points</div>');

    // Pump once
    clickTarget(pump_button);
    jest.advanceTimersByTime(200);

    const value_element = displayElement.querySelector(
      "#jspsych-bart-balloon-value-number"
    ) as HTMLElement;
    expect(value_element.textContent).toBe("7 points");

    // Pump again
    clickTarget(pump_button);
    jest.advanceTimersByTime(200);

    expect(value_element.textContent).toBe("14 points");

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
    expect(value_element.textContent).toBe("1 points");
  });
});
