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

// Mock matchMedia for mobile detection
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
    writable: true,
    configurable: true,
  });
};

describe("DeviceOrientationPlugin", () => {
  beforeEach(() => {
    // Default to desktop (non-mobile) environment
    mockMatchMedia(false);
    mockOrientation("landscape-primary");
  });

  test("ends immediately on desktop devices", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: DeviceOrientationPlugin,
        orientation: "landscape",
      },
    ]);

    await expectFinished();

    const data = getData().values()[0];
    expect(data.skipped).toBe(false);
    expect(data.rt).toBe(0);
  });

  test("ends immediately when already in correct orientation on mobile", async () => {
    // Mock mobile device in landscape
    mockMatchMedia(true);
    Object.defineProperty(navigator, "maxTouchPoints", { value: 5, configurable: true });
    mockOrientation("landscape-primary");

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
  });

  test("records correct data structure", async () => {
    // On desktop, trial ends immediately regardless of orientation param
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
