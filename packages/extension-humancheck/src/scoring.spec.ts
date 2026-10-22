import { BehaviorMetrics, BehaviorRecorder } from "./behavior";
import { EnvironmentReport } from "./environment";
import { combineWeights, scoreSession } from "./scoring";

const cleanEnvironment: EnvironmentReport = {
  webdriver: false,
  headless_user_agent: false,
  automation_globals: [],
  no_languages: false,
  zero_outer_window: false,
  missing_chrome_runtime: false,
  user_agent_platform_mismatch: false,
  hardware_concurrency: 8,
  screen: { width: 1920, height: 1080, avail_width: 1920, avail_height: 1040 },
  viewport: { width: 1400, height: 900 },
  timezone: "Europe/Oslo",
  user_agent: "Mozilla/5.0",
};

function behavior(overrides: Partial<BehaviorMetrics>): BehaviorMetrics {
  return { ...BehaviorRecorder.emptyMetrics(), duration_ms: 4000, ...overrides };
}

const humanTrial = behavior({
  pointer_moves: 240,
  pointer_path_px: 3100,
  pointer_speed_cv: 0.9,
  clicks: 4,
  clicks_without_approach: 0,
  keydowns: 40,
  inter_key_mean_ms: 160,
  inter_key_cv: 0.55,
});

describe("scoreSession", () => {
  it("gives a clean human session a score of zero", () => {
    const summary = scoreSession({
      environment: cleanEnvironment,
      behaviors: [humanTrial, humanTrial],
      checks: [{ honeypot_filled: false, canary_triggered: false, attention_failed: false }],
    });
    expect(summary.score).toBe(0);
    expect(summary.flags).toEqual([]);
  });

  it("flags a DOM-reading agent that fills the honeypot and follows the canary", () => {
    const summary = scoreSession({
      environment: cleanEnvironment,
      behaviors: [
        behavior({
          clicks: 3,
          clicks_without_approach: 3,
          untrusted_events: 6,
          text_inserted_without_keys: 2,
        }),
      ],
      checks: [{ honeypot_filled: true, canary_triggered: true, attention_failed: null }],
    });
    const ids = summary.flags.map((flag) => flag.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "honeypot",
        "canary",
        "untrusted_events",
        "clicks_without_approach",
        "text_without_keys",
      ])
    );
    expect(summary.score).toBeGreaterThan(0.99);
  });

  it("flags automation frameworks from the environment alone", () => {
    const summary = scoreSession({
      environment: { ...cleanEnvironment, webdriver: true, automation_globals: ["__playwright"] },
      behaviors: [humanTrial],
      checks: [],
    });
    expect(summary.flags.map((flag) => flag.id)).toEqual(["webdriver", "automation_globals"]);
  });

  it("flags metronomic typing but not human rhythm", () => {
    const robotic = behavior({ keydowns: 30, inter_key_cv: 0.02 });
    expect(scoreSession({ environment: null, behaviors: [robotic], checks: [] }).flags[0].id).toBe(
      "robotic_typing"
    );
    expect(scoreSession({ environment: null, behaviors: [humanTrial], checks: [] }).flags).toEqual(
      []
    );
  });

  it("does not punish keyboard-only or touch participants for missing pointer movement", () => {
    const touchTrial = behavior({ clicks: 5, pointer_moves: 0 });
    const summary = scoreSession({
      environment: null,
      behaviors: [touchTrial],
      checks: [],
      pointerDevice: false,
    });
    expect(summary.flags).toEqual([]);
  });

  it("lets researchers disable or reweight flags", () => {
    const summary = scoreSession(
      {
        environment: null,
        behaviors: [],
        checks: [{ honeypot_filled: true, canary_triggered: false, attention_failed: true }],
      },
      { weights: { honeypot: 0, attention: 0.6 } }
    );
    expect(summary.flags.map((flag) => flag.id)).toEqual(["attention"]);
    expect(summary.score).toBe(0.6);
  });
});

describe("combineWeights", () => {
  it("combines independent evidence without exceeding 1", () => {
    expect(combineWeights([])).toBe(0);
    expect(combineWeights([0.5, 0.5])).toBeCloseTo(0.75);
    expect(combineWeights([0.9, 0.9, 0.9])).toBeLessThan(1);
  });
});
