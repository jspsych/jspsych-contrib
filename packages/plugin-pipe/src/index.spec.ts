import { startTimeline } from "@jspsych/test-utils";

import PluginPipe from ".";

jest.useFakeTimers();

describe.skip("jsPsychPipe.getCondition()", () => {
  it("should return the correct condition", async () => {
    const expID = "test";
    const condition = await PluginPipe.getCondition(expID);
    expect(condition).toBe(0);
  });
});
