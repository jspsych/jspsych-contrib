export interface BehaviorMetrics {
  duration_ms: number;
  pointer_moves: number;
  pointer_path_px: number;
  pointer_speed_cv: number | null;
  clicks: number;
  clicks_without_approach: number;
  clicks_at_exact_center: number;
  keydowns: number;
  inter_key_mean_ms: number | null;
  inter_key_cv: number | null;
  pastes: number;
  text_inserted_without_keys: number;
  untrusted_events: number;
  blurs: number;
  hidden_ms: number;
}

interface PointerSample {
  x: number;
  y: number;
  t: number;
}

const APPROACH_WINDOW_MS = 400;
const APPROACH_TOLERANCE_PX = 3;
const CENTER_TOLERANCE_PX = 0.5;
const MAX_KEY_GAP_MS = 2000;

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function coefficientOfVariation(values: number[]): number | null {
  const average = mean(values);
  if (average === null || average === 0 || values.length < 3) return null;
  const variance = values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length;
  return Math.sqrt(variance) / average;
}

function isAtElementCenter(event: MouseEvent): boolean {
  const target = event.target;
  if (!(target instanceof Element)) return false;
  const box = target.getBoundingClientRect();
  if (box.width === 0 || box.height === 0) return false;
  const centerX = box.left + box.width / 2;
  const centerY = box.top + box.height / 2;
  return (
    Math.abs(event.clientX - centerX) <= CENTER_TOLERANCE_PX &&
    Math.abs(event.clientY - centerY) <= CENTER_TOLERANCE_PX
  );
}

export class BehaviorRecorder {
  private target: Document;
  private now: () => number;
  private startedAt = 0;
  private pointer: PointerSample[] = [];
  private speeds: number[] = [];
  private keyTimes: number[] = [];
  private keysSinceLastInput = 0;
  private hiddenSince: number | null = null;
  private metrics = BehaviorRecorder.emptyMetrics();

  constructor(target: Document = document, now: () => number = () => performance.now()) {
    this.target = target;
    this.now = now;
  }

  static emptyMetrics(): BehaviorMetrics {
    return {
      duration_ms: 0,
      pointer_moves: 0,
      pointer_path_px: 0,
      pointer_speed_cv: null,
      clicks: 0,
      clicks_without_approach: 0,
      clicks_at_exact_center: 0,
      keydowns: 0,
      inter_key_mean_ms: null,
      inter_key_cv: null,
      pastes: 0,
      text_inserted_without_keys: 0,
      untrusted_events: 0,
      blurs: 0,
      hidden_ms: 0,
    };
  }

  start(): void {
    this.reset();
    this.startedAt = this.now();
    this.target.addEventListener("pointermove", this.onPointerMove, true);
    this.target.addEventListener("click", this.onClick, true);
    this.target.addEventListener("keydown", this.onKeyDown, true);
    this.target.addEventListener("paste", this.onPaste, true);
    this.target.addEventListener("input", this.onInput, true);
    this.target.addEventListener("visibilitychange", this.onVisibilityChange, true);
    this.target.defaultView?.addEventListener("blur", this.onBlur);
  }

  stop(): BehaviorMetrics {
    this.target.removeEventListener("pointermove", this.onPointerMove, true);
    this.target.removeEventListener("click", this.onClick, true);
    this.target.removeEventListener("keydown", this.onKeyDown, true);
    this.target.removeEventListener("paste", this.onPaste, true);
    this.target.removeEventListener("input", this.onInput, true);
    this.target.removeEventListener("visibilitychange", this.onVisibilityChange, true);
    this.target.defaultView?.removeEventListener("blur", this.onBlur);

    const stoppedAt = this.now();
    if (this.hiddenSince !== null) this.metrics.hidden_ms += stoppedAt - this.hiddenSince;

    const keyGaps = this.keyTimes
      .slice(1)
      .map((time, index) => time - this.keyTimes[index])
      .filter((gap) => gap < MAX_KEY_GAP_MS);

    return {
      ...this.metrics,
      duration_ms: Math.round(stoppedAt - this.startedAt),
      pointer_path_px: Math.round(this.metrics.pointer_path_px),
      pointer_speed_cv: round(coefficientOfVariation(this.speeds)),
      inter_key_mean_ms: round(mean(keyGaps)),
      inter_key_cv: round(coefficientOfVariation(keyGaps)),
      hidden_ms: Math.round(this.metrics.hidden_ms),
    };
  }

  private reset(): void {
    this.pointer = [];
    this.speeds = [];
    this.keyTimes = [];
    this.keysSinceLastInput = 0;
    this.hiddenSince = this.target.visibilityState === "hidden" ? this.now() : null;
    this.metrics = BehaviorRecorder.emptyMetrics();
  }

  private countIfUntrusted(event: Event): void {
    if (!event.isTrusted) this.metrics.untrusted_events += 1;
  }

  private onPointerMove = (event: PointerEvent): void => {
    this.countIfUntrusted(event);
    const sample = { x: event.clientX, y: event.clientY, t: this.now() };
    const previous = this.pointer[this.pointer.length - 1];
    if (previous) {
      const distance = Math.hypot(sample.x - previous.x, sample.y - previous.y);
      const elapsed = sample.t - previous.t;
      this.metrics.pointer_path_px += distance;
      if (elapsed > 0 && distance > 0) this.speeds.push(distance / elapsed);
    }
    this.pointer.push(sample);
    this.metrics.pointer_moves += 1;
  };

  private onClick = (event: MouseEvent): void => {
    this.countIfUntrusted(event);
    this.metrics.clicks += 1;
    const isKeyboardActivation = event.detail === 0;
    if (isKeyboardActivation) return;
    if (!this.wasApproached(event)) this.metrics.clicks_without_approach += 1;
    if (isAtElementCenter(event)) this.metrics.clicks_at_exact_center += 1;
  };

  private wasApproached(event: MouseEvent): boolean {
    const lastMove = this.pointer[this.pointer.length - 1];
    if (!lastMove) return false;
    const recent = this.now() - lastMove.t <= APPROACH_WINDOW_MS;
    const nearby =
      Math.hypot(event.clientX - lastMove.x, event.clientY - lastMove.y) <= APPROACH_TOLERANCE_PX;
    return recent && nearby;
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    this.countIfUntrusted(event);
    this.metrics.keydowns += 1;
    this.keysSinceLastInput += 1;
    this.keyTimes.push(this.now());
  };

  private onPaste = (event: ClipboardEvent): void => {
    this.countIfUntrusted(event);
    this.metrics.pastes += 1;
  };

  private onInput = (event: Event): void => {
    const inputType = (event as InputEvent).inputType ?? "";
    const isTyping =
      inputType === "" ||
      inputType.startsWith("insertText") ||
      inputType === "insertReplacementText";
    const isPaste = inputType === "insertFromPaste" || inputType === "insertFromDrop";
    if (isTyping && !isPaste && this.keysSinceLastInput === 0)
      this.metrics.text_inserted_without_keys += 1;
    this.keysSinceLastInput = 0;
  };

  private onVisibilityChange = (): void => {
    if (this.target.visibilityState === "hidden") {
      this.hiddenSince = this.now();
    } else if (this.hiddenSince !== null) {
      this.metrics.hidden_ms += this.now() - this.hiddenSince;
      this.hiddenSince = null;
    }
  };

  private onBlur = (): void => {
    this.metrics.blurs += 1;
  };
}

function round(value: number | null, digits = 3): number | null {
  if (value === null) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
