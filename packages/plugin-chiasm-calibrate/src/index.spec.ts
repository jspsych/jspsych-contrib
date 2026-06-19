import jsPsychChiasmCalibrate from ".";

describe("plugin-chiasm-calibrate", () => {
  it("exposes static info with the expected name and parameters", () => {
    expect(jsPsychChiasmCalibrate.info.name).toBe("chiasm-calibrate");
    expect(jsPsychChiasmCalibrate.info.parameters.instructions).toBeDefined();
    expect(jsPsychChiasmCalibrate.info.parameters.screen_calibration).toBeDefined();
    expect(jsPsychChiasmCalibrate.info.data.success).toBeDefined();
    expect(jsPsychChiasmCalibrate.info.data.calibration_duration).toBeDefined();
    expect(jsPsychChiasmCalibrate.info.data.error).toBeDefined();
  });

  function makeJsPsych(extension?: unknown) {
    return {
      extensions: extension ? { chiasm: extension } : {},
      finishTrial: jest.fn(),
    };
  }

  function makeTrialParams(overrides: Record<string, unknown> = {}) {
    return {
      instructions: "<p>calibrating</p>",
      screen_calibration: true,
      ...overrides,
    } as any;
  }

  function runTrial(jsPsych: any, trialParams: any) {
    const display = document.createElement("div");
    return new jsPsychChiasmCalibrate(jsPsych as any).trial(display, trialParams);
  }

  it("forwards screen_calibration to extension.calibrate and records success", async () => {
    const extension = { calibrate: jest.fn().mockResolvedValue(undefined) };
    const jsPsych = makeJsPsych(extension);

    await runTrial(jsPsych, makeTrialParams({ screen_calibration: false }));

    expect(extension.calibrate).toHaveBeenCalledTimes(1);
    expect(extension.calibrate).toHaveBeenCalledWith({ screenCalibration: false });
    expect(jsPsych.finishTrial).toHaveBeenCalledTimes(1);
    expect(jsPsych.finishTrial.mock.calls[0][0]).toMatchObject({
      success: true,
      error: null,
    });
  });

  it("records failure when the extension is missing", async () => {
    const jsPsych = makeJsPsych(undefined);
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    try {
      await runTrial(jsPsych, makeTrialParams());

      expect(jsPsych.finishTrial).toHaveBeenCalledTimes(1);
      const data = jsPsych.finishTrial.mock.calls[0][0];
      expect(data.success).toBe(false);
      expect(typeof data.error).toBe("string");
    } finally {
      errorSpy.mockRestore();
    }
  });

  it("records success: false with a non-null error when calibrate() rejects", async () => {
    const extension = { calibrate: jest.fn().mockRejectedValue(new Error("calibration aborted")) };
    const jsPsych = makeJsPsych(extension);
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    try {
      await runTrial(jsPsych, makeTrialParams());

      expect(jsPsych.finishTrial).toHaveBeenCalledTimes(1);
      const data = jsPsych.finishTrial.mock.calls[0][0];
      expect(data.success).toBe(false);
      expect(data.error).toBe("calibration aborted");
    } finally {
      errorSpy.mockRestore();
    }
  });
});
