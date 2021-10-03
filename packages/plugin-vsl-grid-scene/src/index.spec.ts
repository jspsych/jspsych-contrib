import { startTimeline } from "@jspsych/test-utils";

import VslGridScene from ".";

jest.useFakeTimers();

describe("vsl-grid-scene plugin", () => {
  it("should load", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: VslGridScene,
        stimuli: [["1.png", "2.png"]],
        trial_duration: 500,
      },
    ]);

    jest.runAllTimers();

    await expectFinished();
  });

  // this is a pretty lame test but it at least ensures that the static method
  // exists and creates a string with the right images.
  it("has a static method to generate a stimulus", () => {
    const stimulus = VslGridScene.generate_stimulus([["1.png", "2.png"]], [100, 100]);
    expect(stimulus).toMatch("table");
    expect(stimulus).toMatch("1.png");
    expect(stimulus).toMatch("2.png");
  });
});
