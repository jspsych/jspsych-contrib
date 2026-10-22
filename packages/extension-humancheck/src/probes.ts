const CANARY_WORDS = [
  "heliotrope",
  "marzipan",
  "quokka",
  "obsidian",
  "tamarind",
  "zeppelin",
  "cardamom",
  "axolotl",
];

const VISUALLY_HIDDEN =
  "position:absolute!important;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0;";

const HONEYPOT_ID = "jspsych-humancheck-honeypot";
const ANSWER_FIELDS = 'input[type="text"],input[type="search"],input:not([type]),textarea';

// The display element is emptied by jsPsych before extension on_finish runs, and an agent can set
// .value without firing an input event, so field contents are polled as well as listened for.
const POLL_INTERVAL_MS = 250;

export interface ProbeOptions {
  honeypot: boolean;
  honeypot_label: string;
  canary: boolean;
  canary_word: string | null;
  canary_instruction: string;
  expected: string[] | null;
}

export interface ProbeResult {
  honeypot_filled: boolean;
  honeypot_value: string;
  canary_word: string | null;
  canary_triggered: boolean;
  attention_failed: boolean | null;
}

export function containsWord(text: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(text);
}

export function pickCanaryWord(random: () => number = Math.random): string {
  return CANARY_WORDS[Math.floor(random() * CANARY_WORDS.length)];
}

export function emptyProbeResult(): ProbeResult {
  return {
    honeypot_filled: false,
    honeypot_value: "",
    canary_word: null,
    canary_triggered: false,
    attention_failed: null,
  };
}

function renderHiddenBlock(options: ProbeOptions, canaryWord: string | null): string {
  const canary =
    canaryWord === null
      ? ""
      : `<p>${options.canary_instruction
          .replace("{word}", canaryWord)
          .replace("{field}", options.honeypot_label)}</p>`;

  const honeypot = options.honeypot
    ? `<label for="${HONEYPOT_ID}">${options.honeypot_label}</label>
       <input id="${HONEYPOT_ID}" name="hc_extra" type="text" tabindex="-1" autocomplete="off" data-lpignore="true" data-1p-ignore>`
    : "";

  return `<div class="jspsych-humancheck-probe" aria-hidden="true" style="${VISUALLY_HIDDEN}">${canary}${honeypot}</div>`;
}

export class HiddenProbe {
  private display: HTMLElement | null = null;
  private container: HTMLElement | null = null;
  private options: ProbeOptions | null = null;
  private canaryWord: string | null = null;
  private honeypotValue = "";
  private answers = new Set<string>();
  private sawAnswerField = false;
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private random: () => number = Math.random) {}

  attach(display: HTMLElement, options: ProbeOptions): void {
    this.reset();
    this.display = display;
    this.options = options;
    this.canaryWord = options.canary ? options.canary_word ?? pickCanaryWord(this.random) : null;

    if (options.honeypot || this.canaryWord !== null) {
      const holder = display.ownerDocument.createElement("div");
      holder.innerHTML = renderHiddenBlock(options, this.canaryWord);
      this.container = holder.firstElementChild as HTMLElement;
      display.appendChild(this.container);
    }

    display.ownerDocument.addEventListener("input", this.onInput, true);
    this.pollTimer = setInterval(this.scan, POLL_INTERVAL_MS);
    this.scan();
  }

  detach(): ProbeResult {
    if (this.options === null) return emptyProbeResult();

    this.scan();
    if (this.pollTimer !== null) clearInterval(this.pollTimer);
    this.pollTimer = null;
    this.display?.ownerDocument.removeEventListener("input", this.onInput, true);
    this.container?.remove();

    const result: ProbeResult = {
      honeypot_filled: this.options.honeypot && this.honeypotValue.trim() !== "",
      honeypot_value: this.honeypotValue,
      canary_word: this.canaryWord,
      canary_triggered: this.canaryWord !== null && this.sawCanary(this.canaryWord),
      attention_failed: this.evaluateAttention(),
    };

    this.reset();
    return result;
  }

  private sawCanary(word: string): boolean {
    if (containsWord(this.honeypotValue, word)) return true;
    for (const answer of this.answers) if (containsWord(answer, word)) return true;
    return false;
  }

  private evaluateAttention(): boolean | null {
    const expected = this.options?.expected;
    if (!expected || expected.length === 0 || !this.sawAnswerField) return null;
    for (const answer of this.answers) {
      if (expected.some((candidate) => containsWord(answer, candidate))) return false;
    }
    return true;
  }

  private onInput = (): void => {
    this.scan();
  };

  private scan = (): void => {
    if (this.display === null) return;

    const honeypot = this.display.querySelector<HTMLInputElement>(`#${HONEYPOT_ID}`);
    if (honeypot && honeypot.value !== "") this.honeypotValue = honeypot.value;

    for (const field of this.display.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      ANSWER_FIELDS
    )) {
      if (field.id === HONEYPOT_ID) continue;
      this.sawAnswerField = true;
      if (field.value !== "") this.answers.add(field.value);
    }
  };

  private reset(): void {
    if (this.pollTimer !== null) clearInterval(this.pollTimer);
    this.pollTimer = null;
    this.display = null;
    this.container = null;
    this.options = null;
    this.canaryWord = null;
    this.honeypotValue = "";
    this.answers = new Set();
    this.sawAnswerField = false;
  }
}
