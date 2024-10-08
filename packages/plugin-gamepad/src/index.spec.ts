import { startTimeline } from "@jspsych/test-utils";

import PluginGamepad from ".";

jest.useFakeTimers();

describe("Gamepad", () => {
  it("should end within about 2s", async () => {
    let time_start = performance.now();
    await startTimeline([
      {
        type: PluginGamepad,
        end_trial: (_c: CanvasRenderingContext2D, _g: Gamepad, time_stamp: number, _d: number) => {
          return time_stamp > 10000;
        },
      },
    ]);
    let time_now = performance.now();
    // Set a 50 ms threshold
    expect(time_now - time_start).toBeLessThanOrEqual(50);
  });
});
