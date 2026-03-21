import { startTimeline } from "@jspsych/test-utils";

import DeviceOrientationPlugin from ".";

// Mock window.screen.orientation for testing
const mockOrientation = (type: string) => {
  Object.defineProperty(window.screen, "orientation", {
    value: {
      type,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    writable: true,
    configurable: true,
  });
};

describe("DeviceOrientationPlugin", () => {
  beforeEach(() => {
    mockOrientation("landscape-primary");
  });

  test("ends immediately when already in correct orientation", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: DeviceOrientationPlugin,
        orientation: "landscape",
      },
    ]);

    await expectFinished();

    const data = getData().values()[0];
    expect(data.was_correct_orientation).toBe(true);
    expect(data.final_orientation).toBe("landscape");
    expect(data.skipped).toBe(false);
    expect(data.rt).toBeNull();
  });

  test("shows message when in wrong orientation", async () => {
    mockOrientation("portrait-primary");

    const { expectRunning, getHTML } = await startTimeline([
      {
        type: DeviceOrientationPlugin,
        orientation: "landscape",
      },
    ]);

    await expectRunning();

    expect(getHTML()).toContain("jspsych-device-orientation-message");
    expect(getHTML()).toContain("landscape");
  });

  test("shows skip button when allow_skip is true", async () => {
    mockOrientation("portrait-primary");

    const { expectRunning, getHTML } = await startTimeline([
      {
        type: DeviceOrientationPlugin,
        orientation: "landscape",
        allow_skip: true,
        skip_button_label: "Skip",
      },
    ]);

    await expectRunning();

    expect(getHTML()).toContain("jspsych-device-orientation-skip");
    expect(getHTML()).toContain("Skip");
  });

  test("does not show skip button when allow_skip is false", async () => {
    mockOrientation("portrait-primary");

    const { expectRunning, getHTML } = await startTimeline([
      {
        type: DeviceOrientationPlugin,
        orientation: "landscape",
      },
    ]);

    await expectRunning();

    expect(getHTML()).not.toContain("jspsych-device-orientation-skip");
  });

  test("records correct data structure", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: DeviceOrientationPlugin,
        orientation: "landscape",
      },
    ]);

    await expectFinished();

    const data = getData().values()[0];
    expect(data).toHaveProperty("was_correct_orientation");
    expect(data).toHaveProperty("final_orientation");
    expect(data).toHaveProperty("skipped");
    expect(data).toHaveProperty("rt");
  });
});
