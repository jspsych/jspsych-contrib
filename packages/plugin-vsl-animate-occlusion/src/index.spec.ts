import { startTimeline } from "@jspsych/test-utils";

import vslAnimateOcclusion from ".";

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("plugin vsl-animate-occlusion", () => {
  it("should load", async () => {
    const { expectRunning } = await startTimeline([
      {
        type: vslAnimateOcclusion,
        stimuli: ["img1.png", "img2.png"],
      },
    ]);

    await expectRunning();
  });

  it("should finish automatically", async () => {
    const { expectRunning, expectFinished } = await startTimeline([
      {
        type: vslAnimateOcclusion,
        stimuli: ["img1.png", "img2.png"],
        cycle_duration: 100,
        pre_movement_duration: 0,
      },
    ]);

    await expectRunning();

    await timeout(500); // can't use fake timers here because snapsvg uses animation frames.

    await expectFinished();
  });
});
