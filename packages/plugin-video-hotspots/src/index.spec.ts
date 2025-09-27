import { clickTarget, startTimeline } from "@jspsych/test-utils";

import jsPsychVideoHotspots from ".";

jest.useFakeTimers();

describe("jsPsychVideoHotspots plugin", () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  it("should load with basic parameters", async () => {
    const { expectFinished, getHTML, getData, displayElement } = await startTimeline([
      {
        type: jsPsychVideoHotspots,
        stimulus: "test.mp4",
        hotspots: [
          {
            id: "test_hotspot",
            x: 50,
            y: 50,
            width: 100,
            height: 100,
          },
        ],
      },
    ]);

    expect(getHTML()).toContain('id="jspsych-video-hotspots-container"');
    expect(getHTML()).toContain('src="test.mp4"');

    // Mock video events to simulate video ending
    const video = displayElement.querySelector(
      "#jspsych-video-hotspots-stimulus"
    ) as HTMLVideoElement;

    // Mock video duration
    Object.defineProperty(video, "duration", {
      writable: true,
      value: 5.5, // 5.5 seconds
    });

    // Trigger video ended event to create hotspots
    video.dispatchEvent(new Event("ended"));

    expect(getHTML()).toContain('data-hotspot-id="test_hotspot"');

    // Advance time to ensure rt > 0
    jest.advanceTimersByTime(100);

    // Click the hotspot to finish the trial
    clickTarget(displayElement.querySelector('[data-hotspot-id="test_hotspot"]'));

    await expectFinished();

    const data = getData().values()[0];
    expect(data.hotspot_clicked).toBe("test_hotspot");
    expect(data.rt).toBeGreaterThan(0);
    expect(typeof data.click_x).toBe("number");
    expect(typeof data.click_y).toBe("number");
    expect(data.video_duration).toBe(5500); // 5.5 seconds in milliseconds
  });

  it("should prevent clicks before video ends", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychVideoHotspots,
        stimulus: "test.mp4",
        hotspots: [
          {
            id: "test_hotspot",
            x: 50,
            y: 50,
            width: 100,
            height: 100,
          },
        ],
      },
    ]);

    // Don't trigger video ended event - hotspots should not be created
    expect(getHTML()).not.toContain('data-hotspot-id="test_hotspot"');
  });

  it("should timeout after video ends when trial_duration is set", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychVideoHotspots,
        stimulus: "test.mp4",
        hotspots: [
          {
            id: "test_hotspot",
            x: 50,
            y: 50,
            width: 100,
            height: 100,
          },
        ],
        trial_duration: 1000,
      },
    ]);

    // Trigger video ended event
    const video = displayElement.querySelector(
      "#jspsych-video-hotspots-stimulus"
    ) as HTMLVideoElement;
    Object.defineProperty(video, "duration", { writable: true, value: 3.0 });
    video.dispatchEvent(new Event("ended"));

    // Advance time by trial duration
    jest.advanceTimersByTime(1000);

    await expectFinished();

    const data = getData().values()[0];
    expect(data.hotspot_clicked).toBeNull();
    expect(data.rt).toBeNull();
    expect(data.video_duration).toBe(3000);
  });

  it("should handle video loading errors", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychVideoHotspots,
        stimulus: "nonexistent.mp4",
        hotspots: [],
      },
    ]);

    // Trigger video error event
    const video = displayElement.querySelector(
      "#jspsych-video-hotspots-stimulus"
    ) as HTMLVideoElement;
    video.dispatchEvent(new Event("error"));

    await expectFinished();

    const data = getData().values()[0];
    expect(data.hotspot_clicked).toBeNull();
    expect(data.video_duration).toBeNull();
  });

  it("should apply custom highlight CSS", async () => {
    const customCSS = "background-color: red; border: 5px solid blue;";

    const { displayElement } = await startTimeline([
      {
        type: jsPsychVideoHotspots,
        stimulus: "test.mp4",
        hotspots: [
          {
            id: "test_hotspot",
            x: 50,
            y: 50,
            width: 100,
            height: 100,
          },
        ],
        hotspot_highlight_css: customCSS,
      },
    ]);

    // Trigger video ended event to create hotspots
    const video = displayElement.querySelector(
      "#jspsych-video-hotspots-stimulus"
    ) as HTMLVideoElement;
    video.dispatchEvent(new Event("ended"));

    const hotspot = displayElement.querySelector('[data-hotspot-id="test_hotspot"]');

    // Simulate mousedown to trigger highlight
    const mouseDownEvent = new MouseEvent("mousedown", { bubbles: true });
    hotspot!.dispatchEvent(mouseDownEvent);

    // Check if highlight was created with custom CSS
    const highlight = displayElement.querySelector(
      ".jspsych-video-hotspots-highlight"
    ) as HTMLElement;
    expect(highlight).toBeTruthy();
    expect(highlight.style.cssText).toContain("background-color: red");
    expect(highlight.style.cssText).toContain("border: 5px solid blue");
  });

  it("should record rounded click coordinates", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychVideoHotspots,
        stimulus: "test.mp4",
        hotspots: [
          {
            id: "test_hotspot",
            x: 50,
            y: 50,
            width: 100,
            height: 100,
          },
        ],
      },
    ]);

    // Trigger video ended event to create hotspots
    const video = displayElement.querySelector(
      "#jspsych-video-hotspots-stimulus"
    ) as HTMLVideoElement;
    video.dispatchEvent(new Event("ended"));

    const hotspot = displayElement.querySelector('[data-hotspot-id="test_hotspot"]');

    // Mock getBoundingClientRect to return known values
    jest.spyOn(video, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 200,
      x: 0,
      y: 0,
      bottom: 200,
      right: 200,
      toJSON: () => ({}),
    } as DOMRect);

    // Create a click event with fractional coordinates
    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      clientX: 75.7,
      clientY: 85.3,
    });

    hotspot!.dispatchEvent(clickEvent);

    await expectFinished();

    const data = getData().values()[0];
    // Just verify coordinates are integers (rounded)
    expect(Number.isInteger(data.click_x)).toBe(true);
    expect(Number.isInteger(data.click_y)).toBe(true);
  });
});
