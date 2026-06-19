import jsPsychChiasmSetup from ".";

describe("plugin-chiasm-setup", () => {
  it("exposes static info with the expected name and parameters", () => {
    expect(jsPsychChiasmSetup.info.name).toBe("chiasm-setup");
    expect(jsPsychChiasmSetup.info.parameters.loading_message).toBeDefined();
    expect(jsPsychChiasmSetup.info.parameters.abort_on_failure).toBeDefined();
    expect(jsPsychChiasmSetup.info.parameters.error_message).toBeDefined();
    expect(jsPsychChiasmSetup.info.data.success).toBeDefined();
    expect(jsPsychChiasmSetup.info.data.setup_duration).toBeDefined();
    expect(jsPsychChiasmSetup.info.data.error).toBeDefined();
  });

  const ERROR_MESSAGE = "<p>Setup failed.</p>";

  function makeJsPsych(extension?: unknown) {
    return {
      extensions: extension ? { chiasm: extension } : {},
      abortExperiment: jest.fn(),
      finishTrial: jest.fn(),
    };
  }

  function makeTrialParams(overrides: Record<string, unknown> = {}) {
    return {
      loading_message: "<p>loading</p>",
      abort_on_failure: true,
      error_message: ERROR_MESSAGE,
      ...overrides,
    } as any;
  }

  function runTrial(jsPsych: any, trialParams: any) {
    const display = document.createElement("div");
    return new jsPsychChiasmSetup(jsPsych as any).trial(display, trialParams);
  }

  it("calls extension.start() and records success on the happy path", async () => {
    const extension = { start: jest.fn().mockResolvedValue(undefined) };
    const jsPsych = makeJsPsych(extension);

    await runTrial(jsPsych, makeTrialParams());

    expect(extension.start).toHaveBeenCalledTimes(1);
    expect(jsPsych.abortExperiment).not.toHaveBeenCalled();
    expect(jsPsych.finishTrial).toHaveBeenCalledTimes(1);
    expect(jsPsych.finishTrial.mock.calls[0][0]).toMatchObject({
      success: true,
      error: null,
    });
  });

  it("aborts with chiasm_setup_failed when the extension is missing and abort_on_failure is true", async () => {
    const jsPsych = makeJsPsych(undefined);

    await runTrial(jsPsych, makeTrialParams({ abort_on_failure: true }));

    expect(jsPsych.finishTrial).not.toHaveBeenCalled();
    expect(jsPsych.abortExperiment).toHaveBeenCalledTimes(1);
    const [message, data] = jsPsych.abortExperiment.mock.calls[0];
    expect(message).toBe(ERROR_MESSAGE);
    expect(data).toMatchObject({ chiasm_setup_failed: true });
    expect(typeof data.error).toBe("string");
  });

  it("continues and records failure when the extension is missing and abort_on_failure is false", async () => {
    const jsPsych = makeJsPsych(undefined);

    await runTrial(jsPsych, makeTrialParams({ abort_on_failure: false }));

    expect(jsPsych.abortExperiment).not.toHaveBeenCalled();
    expect(jsPsych.finishTrial).toHaveBeenCalledTimes(1);
    const data = jsPsych.finishTrial.mock.calls[0][0];
    expect(data.success).toBe(false);
    expect(typeof data.error).toBe("string");
  });

  it("does not leak the raw error into participant-facing HTML when start() rejects", async () => {
    const raw = "<img src=x onerror=alert(1)> boom";
    const extension = { start: jest.fn().mockRejectedValue(new Error(raw)) };
    const jsPsych = makeJsPsych(extension);
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    try {
      await runTrial(jsPsych, makeTrialParams({ abort_on_failure: true }));

      expect(jsPsych.abortExperiment).toHaveBeenCalledTimes(1);
      const [message, data] = jsPsych.abortExperiment.mock.calls[0];
      // Participant-facing message is the fixed error_message, never the raw error.
      expect(message).toBe(ERROR_MESSAGE);
      expect(message).not.toContain("onerror");
      // The raw error is preserved only in the data payload.
      expect(data).toMatchObject({ chiasm_setup_failed: true, error: raw });
    } finally {
      errorSpy.mockRestore();
    }
  });

  it("records failure without aborting when start() rejects and abort_on_failure is false", async () => {
    const extension = { start: jest.fn().mockRejectedValue(new Error("boom")) };
    const jsPsych = makeJsPsych(extension);
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    try {
      await runTrial(jsPsych, makeTrialParams({ abort_on_failure: false }));

      expect(jsPsych.abortExperiment).not.toHaveBeenCalled();
      expect(jsPsych.finishTrial).toHaveBeenCalledTimes(1);
      const data = jsPsych.finishTrial.mock.calls[0][0];
      expect(data.success).toBe(false);
      expect(data.error).toBe("boom");
    } finally {
      errorSpy.mockRestore();
    }
  });
});
