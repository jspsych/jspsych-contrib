import htmlButtonResponse from "@jspsych/plugin-html-button-response";
import { clickTarget } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

import HumanCheckExtension from ".";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function buildExperiment(params: Record<string, unknown> = {}) {
  const jsPsych = initJsPsych({ extensions: [{ type: HumanCheckExtension }] });
  const timeline = {
    extensions: [{ type: HumanCheckExtension, params: { canary_word: "quokka", ...params } }],
    timeline: [
      { type: htmlButtonResponse, stimulus: "<p>Pick one</p>", choices: ["left", "right"] },
    ],
  };
  return { jsPsych, timeline };
}

function extensionOf(jsPsych: ReturnType<typeof initJsPsych>) {
  return (jsPsych.extensions as Record<string, HumanCheckExtension>).humancheck;
}

describe("extension-humancheck", () => {
  it("declares a version and data fields so jsPsych v9 will accept it", () => {
    expect(HumanCheckExtension.info.name).toBe("humancheck");
    expect(HumanCheckExtension.info.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(Object.keys(HumanCheckExtension.info.data!)).toContain("humancheck_duration_ms");
  });

  it("adds behavioural columns to an ordinary trial and scores it as clean", async () => {
    const { jsPsych, timeline } = buildExperiment();
    const run = jsPsych.run([timeline]);
    await flush();

    await clickTarget(jsPsych.getDisplayElement().querySelector("button")!);
    await run;

    const trial = jsPsych.data.get().values()[0];
    expect(trial.humancheck_duration_ms).toEqual(expect.any(Number));
    expect(trial.humancheck_clicks).toBeGreaterThanOrEqual(1);
    expect(trial.humancheck_honeypot_filled).toBe(false);
    expect(trial.humancheck_canary_word).toBe("quokka");
    expect(trial.humancheck_canary_triggered).toBe(false);
  });

  it("flags an agent that fills the hidden honeypot on a plain button trial", async () => {
    const { jsPsych, timeline } = buildExperiment();
    const run = jsPsych.run([timeline]);
    await flush();

    const display = jsPsych.getDisplayElement();
    const honeypot = display.querySelector<HTMLInputElement>("#jspsych-humancheck-honeypot")!;
    honeypot.value = "quokka";
    honeypot.dispatchEvent(new InputEvent("input", { bubbles: true }));

    const summary = extensionOf(jsPsych).summarize();
    await clickTarget(display.querySelector("button")!);
    await run;

    const trial = jsPsych.data.get().values()[0];
    expect(trial.humancheck_honeypot_filled).toBe(true);
    expect(trial.humancheck_canary_triggered).toBe(true);

    const final = extensionOf(jsPsych).summarize();
    expect(final.flags.map((flag) => flag.id)).toEqual(
      expect.arrayContaining(["honeypot", "canary"])
    );
    expect(final.score).toBeGreaterThan(0.9);
    expect(summary.score).toBe(0);
  });

  it("probes the environment once and exposes the report", async () => {
    const { jsPsych, timeline } = buildExperiment();
    const run = jsPsych.run([timeline]);
    await flush();
    await clickTarget(jsPsych.getDisplayElement().querySelector("button")!);
    await run;

    expect(extensionOf(jsPsych).environment).toHaveProperty("webdriver");
    expect(extensionOf(jsPsych).summarize().trials_observed).toBe(1);
  });

  it("skips the environment probe when asked to", async () => {
    const jsPsych = initJsPsych({
      extensions: [{ type: HumanCheckExtension, params: { probe_environment: false } }],
    });
    const run = jsPsych.run([
      {
        extensions: [{ type: HumanCheckExtension }],
        type: htmlButtonResponse,
        stimulus: "<p>Pick one</p>",
        choices: ["ok"],
      },
    ]);
    await flush();
    await clickTarget(jsPsych.getDisplayElement().querySelector("button")!);
    await run;

    expect(extensionOf(jsPsych).environment).toBeNull();
  });

  it("leaves no probe markup behind in the recorded display", async () => {
    const { jsPsych, timeline } = buildExperiment();
    const run = jsPsych.run([timeline]);
    await flush();
    await clickTarget(jsPsych.getDisplayElement().querySelector("button")!);
    await run;

    expect(jsPsych.getDisplayElement().querySelector(".jspsych-humancheck-probe")).toBeNull();
  });

  it("rescores a session from exported trial data", () => {
    const trials = [
      {
        humancheck_duration_ms: 3000,
        humancheck_pointer_moves: 0,
        humancheck_pointer_path_px: 0,
        humancheck_pointer_speed_cv: null,
        humancheck_clicks: 3,
        humancheck_clicks_without_approach: 3,
        humancheck_clicks_at_exact_center: 3,
        humancheck_keydowns: 0,
        humancheck_inter_key_mean_ms: null,
        humancheck_inter_key_cv: null,
        humancheck_pastes: 0,
        humancheck_text_inserted_without_keys: 0,
        humancheck_untrusted_events: 4,
        humancheck_blurs: 0,
        humancheck_hidden_ms: 0,
        humancheck_honeypot_filled: true,
        humancheck_honeypot_value: "https://example.com",
        humancheck_canary_word: "quokka",
        humancheck_canary_triggered: false,
        humancheck_attention_failed: null,
      },
      { trial_type: "html-button-response", rt: 400 },
    ];

    const collected = HumanCheckExtension.collectFromTrials(trials);
    expect(collected.behaviors).toHaveLength(1);
    expect(collected.checks).toEqual([
      { honeypot_filled: true, canary_triggered: false, attention_failed: null },
    ]);
  });
});
