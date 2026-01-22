import { clickTarget, startTimeline } from "@jspsych/test-utils";

import jsPsychImageHotspots from ".";

jest.useFakeTimers();

describe("jsPsychImageHotspots plugin", () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  it("should load with basic parameters", async () => {
    const { expectFinished, getHTML, getData, displayElement } = await startTimeline([
      {
        type: jsPsychImageHotspots,
        stimulus: "test.jpg",
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

    expect(getHTML()).toContain('id="jspsych-image-hotspots-container"');
    expect(getHTML()).toContain('src="test.jpg"');

    // Trigger image load event to create hotspots
    const img = displayElement.querySelector(
      "#jspsych-image-hotspots-stimulus"
    ) as HTMLImageElement;
    img.dispatchEvent(new Event("load"));

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
  });

  it("should handle multiple hotspots", async () => {
    const { expectFinished, getHTML, getData, displayElement } = await startTimeline([
      {
        type: jsPsychImageHotspots,
        stimulus: "test.jpg",
        hotspots: [
          {
            id: "hotspot1",
            x: 10,
            y: 10,
            width: 50,
            height: 50,
          },
          {
            id: "hotspot2",
            x: 100,
            y: 100,
            width: 50,
            height: 50,
          },
        ],
      },
    ]);

    // Trigger image load event to create hotspots
    const img = displayElement.querySelector(
      "#jspsych-image-hotspots-stimulus"
    ) as HTMLImageElement;
    img.dispatchEvent(new Event("load"));

    expect(getHTML()).toContain('data-hotspot-id="hotspot1"');
    expect(getHTML()).toContain('data-hotspot-id="hotspot2"');

    // Click the second hotspot
    clickTarget(displayElement.querySelector('[data-hotspot-id="hotspot2"]'));

    await expectFinished();

    const data = getData().values()[0];
    expect(data.hotspot_clicked).toBe("hotspot2");
  });

  it("should timeout when trial_duration is set", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychImageHotspots,
        stimulus: "test.jpg",
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

    jest.advanceTimersByTime(1000);

    await expectFinished();

    const data = getData().values()[0];
    expect(data.hotspot_clicked).toBeNull();
    expect(data.rt).toBeNull();
  });

  it("should apply custom highlight CSS", async () => {
    const customCSS = "background-color: red; border: 5px solid blue;";

    const { displayElement } = await startTimeline([
      {
        type: jsPsychImageHotspots,
        stimulus: "test.jpg",
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

    // Trigger image load event to create hotspots
    const img = displayElement.querySelector(
      "#jspsych-image-hotspots-stimulus"
    ) as HTMLImageElement;
    img.dispatchEvent(new Event("load"));

    const hotspot = displayElement.querySelector('[data-hotspot-id="test_hotspot"]');

    // Simulate mousedown to trigger highlight
    const mouseDownEvent = new MouseEvent("mousedown", { bubbles: true });
    hotspot.dispatchEvent(mouseDownEvent);

    // Check if highlight was created with custom CSS
    const highlight = displayElement.querySelector(
      ".jspsych-image-hotspots-highlight"
    ) as HTMLElement;
    expect(highlight).toBeTruthy();
    expect(highlight.style.cssText).toContain("background-color: red");
    expect(highlight.style.cssText).toContain("border: 5px solid blue");
  });

  it("should record rounded click coordinates", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychImageHotspots,
        stimulus: "test.jpg",
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

    // Trigger image load event to create hotspots
    const img = displayElement.querySelector(
      "#jspsych-image-hotspots-stimulus"
    ) as HTMLImageElement;
    img.dispatchEvent(new Event("load"));

    const hotspot = displayElement.querySelector('[data-hotspot-id="test_hotspot"]');

    // Mock getBoundingClientRect to return known values
    jest
      .spyOn(
        displayElement.querySelector("#jspsych-image-hotspots-stimulus")!,
        "getBoundingClientRect"
      )
      .mockReturnValue({
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
    // clientX: 75.7 - left: 0 = 75.7, rounded = 76
    // clientY: 85.3 - top: 0 = 85.3, rounded = 85
    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      clientX: 75.7,
      clientY: 85.3,
    });

    hotspot!.dispatchEvent(clickEvent);

    await expectFinished();

    const data = getData().values()[0];
    expect(Number.isInteger(data.click_x)).toBe(true); // Should be rounded
    expect(Number.isInteger(data.click_y)).toBe(true); // Should be rounded
  });

  it("should handle empty hotspots array", async () => {
    const { expectFinished, getHTML, getData } = await startTimeline([
      {
        type: jsPsychImageHotspots,
        stimulus: "test.jpg",
        hotspots: [],
        trial_duration: 100,
      },
    ]);

    expect(getHTML()).toContain('id="jspsych-image-hotspots-container"');
    expect(getHTML()).not.toContain("data-hotspot-id");

    jest.advanceTimersByTime(100);

    await expectFinished();

    const data = getData().values()[0];
    expect(data.hotspot_clicked).toBeNull();
  });

  it("should show prompt if there is one", async () => {
    const { expectFinished, getHTML, getData, displayElement } = await startTimeline([
      {
        type: jsPsychImageHotspots,
        stimulus: "test.jpg",
        prompt: "<p>This is a prompt</p>",
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

    expect(getHTML()).toContain(`
      </div>
    <p>This is a prompt</p>`);
  });
});
