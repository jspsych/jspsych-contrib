import { startTimeline } from "@jspsych/test-utils";

import vslAnimateOcclusion from ".";

jest.useFakeTimers();

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
});
