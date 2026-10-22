import type { BehaviorMetrics } from "./behavior";
import type { EnvironmentReport } from "./environment";

export interface CheckResult {
  honeypot_filled: boolean;
  canary_triggered: boolean;
  attention_failed: boolean | null;
}

export interface Flag {
  id: string;
  weight: number;
  detail: string;
}

export interface HumanCheckSummary {
  score: number;
  flags: Flag[];
  trials_observed: number;
  checks_observed: number;
}

export interface ScoringOptions {
  weights?: Partial<Record<FlagId, number>>;
}

export type FlagId =
  | "webdriver"
  | "automation_globals"
  | "headless_user_agent"
  | "environment_inconsistent"
  | "honeypot"
  | "canary"
  | "attention"
  | "untrusted_events"
  | "clicks_without_approach"
  | "clicks_at_exact_center"
  | "text_without_keys"
  | "robotic_typing"
  | "no_pointer_on_pointer_device"
  | "excessive_pastes";

export const DEFAULT_WEIGHTS: Record<FlagId, number> = {
  webdriver: 0.9,
  automation_globals: 0.9,
  headless_user_agent: 0.9,
  environment_inconsistent: 0.3,
  honeypot: 0.8,
  canary: 0.95,
  attention: 0.3,
  untrusted_events: 0.7,
  clicks_without_approach: 0.5,
  clicks_at_exact_center: 0.4,
  text_without_keys: 0.4,
  robotic_typing: 0.5,
  no_pointer_on_pointer_device: 0.3,
  excessive_pastes: 0.2,
};

const MIN_CLICKS_FOR_RATIO = 3;
const SUSPICIOUS_CLICK_RATIO = 0.8;
const MIN_KEY_GAPS = 10;
const ROBOTIC_KEY_CV = 0.1;
const SUSPICIOUS_PASTES = 3;

function sum(behaviors: BehaviorMetrics[], key: keyof BehaviorMetrics): number {
  return behaviors.reduce((total, behavior) => total + ((behavior[key] as number) ?? 0), 0);
}

function environmentFlags(
  environment: EnvironmentReport | null,
  add: (id: FlagId, detail: string) => void
): void {
  if (!environment) return;
  if (environment.webdriver) add("webdriver", "navigator.webdriver is true");
  if (environment.automation_globals.length > 0)
    add("automation_globals", environment.automation_globals.join(", "));
  if (environment.headless_user_agent) add("headless_user_agent", environment.user_agent);

  const inconsistencies = [
    environment.no_languages && "no navigator.languages",
    environment.zero_outer_window && "outer window is 0x0",
    environment.missing_chrome_runtime && "Chrome UA without window.chrome",
    environment.user_agent_platform_mismatch && "user agent and platform disagree",
  ].filter(Boolean);
  if (inconsistencies.length > 0) add("environment_inconsistent", inconsistencies.join("; "));
}

function checkFlags(checks: CheckResult[], add: (id: FlagId, detail: string) => void): void {
  const honeypots = checks.filter((check) => check.honeypot_filled).length;
  const canaries = checks.filter((check) => check.canary_triggered).length;
  const attentionFailures = checks.filter((check) => check.attention_failed === true).length;
  if (honeypots > 0) add("honeypot", `${honeypots} hidden field(s) filled`);
  if (canaries > 0) add("canary", `${canaries} hidden instruction(s) followed`);
  if (attentionFailures > 0) add("attention", `${attentionFailures} attention check(s) failed`);
}

function behaviorFlags(
  behaviors: BehaviorMetrics[],
  pointerDevice: boolean,
  add: (id: FlagId, detail: string) => void
): void {
  if (behaviors.length === 0) return;

  const untrusted = sum(behaviors, "untrusted_events");
  if (untrusted > 0) add("untrusted_events", `${untrusted} synthetic event(s)`);

  const pointerClicks = sum(behaviors, "clicks");
  const unapproached = sum(behaviors, "clicks_without_approach");
  if (
    pointerClicks >= MIN_CLICKS_FOR_RATIO &&
    unapproached / pointerClicks >= SUSPICIOUS_CLICK_RATIO
  ) {
    add(
      "clicks_without_approach",
      `${unapproached}/${pointerClicks} clicks with no pointer movement before them`
    );
  }

  const centered = sum(behaviors, "clicks_at_exact_center");
  if (pointerClicks >= MIN_CLICKS_FOR_RATIO && centered / pointerClicks >= SUSPICIOUS_CLICK_RATIO) {
    add(
      "clicks_at_exact_center",
      `${centered}/${pointerClicks} clicks at the exact centre of the target`
    );
  }

  const silentInserts = sum(behaviors, "text_inserted_without_keys");
  if (silentInserts > 0)
    add("text_without_keys", `${silentInserts} text change(s) with no keystrokes`);

  const typedTrials = behaviors.filter(
    (behavior) => behavior.keydowns > MIN_KEY_GAPS && behavior.inter_key_cv !== null
  );
  const roboticTrials = typedTrials.filter(
    (behavior) => (behavior.inter_key_cv as number) < ROBOTIC_KEY_CV
  );
  if (typedTrials.length > 0 && roboticTrials.length / typedTrials.length >= 0.5) {
    add(
      "robotic_typing",
      `${roboticTrials.length}/${typedTrials.length} typed trials with near-constant key timing`
    );
  }

  const totalMoves = sum(behaviors, "pointer_moves");
  if (pointerDevice && pointerClicks >= MIN_CLICKS_FOR_RATIO && totalMoves === 0) {
    add("no_pointer_on_pointer_device", `${pointerClicks} clicks but no pointer movement at all`);
  }

  const pastes = sum(behaviors, "pastes");
  if (pastes >= SUSPICIOUS_PASTES) add("excessive_pastes", `${pastes} paste events`);
}

export function combineWeights(weights: number[]): number {
  return 1 - weights.reduce((remaining, weight) => remaining * (1 - weight), 1);
}

export function scoreSession(
  input: {
    environment: EnvironmentReport | null;
    behaviors: BehaviorMetrics[];
    checks: CheckResult[];
    pointerDevice?: boolean;
  },
  options: ScoringOptions = {}
): HumanCheckSummary {
  const weights = { ...DEFAULT_WEIGHTS, ...options.weights };
  const flags: Flag[] = [];
  const add = (id: FlagId, detail: string) => {
    if (weights[id] > 0) flags.push({ id, weight: weights[id], detail });
  };

  environmentFlags(input.environment, add);
  checkFlags(input.checks, add);
  behaviorFlags(input.behaviors, input.pointerDevice ?? true, add);

  return {
    score: Math.round(combineWeights(flags.map((flag) => flag.weight)) * 1000) / 1000,
    flags,
    trials_observed: input.behaviors.length,
    checks_observed: input.checks.length,
  };
}
