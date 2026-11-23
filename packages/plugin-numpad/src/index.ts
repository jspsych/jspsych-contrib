import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "plugin-numpad",
  version: version,
  parameters: {
    /**
     * A 2D array describing the numpad, one inner array per row. Every row must have the same length.
     * Each entry can be:
     * - a non-negative integer or a string of digits (e.g. `7`, `"7"`, `"00"`), which enters those digits;
     * - `"delete"`, which removes the last character;
     * - `"continue"`, which submits the response;
     * - `"negative"`, which toggles a leading minus sign;
     * - `"decimal"`, which enters `decimal_character` (once per response);
     * - `"separator"`, which enters `separator_character` (only when `separate_pattern` is `"none"`);
     * - `null`, which leaves the cell empty.
     *
     * Identical keys can be placed next to each other in order to merge into one larger button, but
     * only into larger rectangles (so no L-shaped buttons allowed). Otherwise, keys may only be present
     * once in the numpad.
     */
    numpad_layout: {
      type: ParameterType.COMPLEX,
      default: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        ["delete", 0, "continue"],
      ],
      array: true,
    },
    /**
     * The maximum number of digits that can be entered. If the participant tries to enter more than this number,
     * additional input will be ignored. Set this to null for no limit.
     */
    max_digits: {
      type: ParameterType.INT,
      default: null,
    },
    /**
     * The minimum number of digits that must be entered in order to continue. If the participant
     * tries to continue before entering this number of digits, `error_message` will display with reason
     * `min_digits` and they will not be allowed to continue until they have entered enough digits.
     * Set this to 0 to allow submitting an empty response.
     */
    min_digits: {
      type: ParameterType.INT,
      default: 1,
    },
    /**
     * An optional function taking in the current contents of the field `input` and returning true or false
     * to either accept the contents or reject and show the `error_message` with reason `"validate_fn"`.
     */
    validate_fn: {
      type: ParameterType.FUNCTION,
      default: null,
    },
    /**
     * A function taking in the current contents of the field `input` and the `reason` of error
     * (one of `"min_digits"`: too few digits; `"format"`: response ends in minus sign, decimal, or
     * separator character; or `"validate_fn"`: `validate_fn` returned false) and returning an error
     * message to be displayed between the display and the numpad.
     */
    error_message: {
      type: ParameterType.FUNCTION,
      default: (_input: string, reason: string) => {
        switch (reason) {
          case "min_digits":
            return "Please enter at least the minimum number of digits before continuing.";
          case "format":
            return "Please finish entering your number before continuing.";
          default:
            return "Please enter a valid response before continuing.";
        }
      },
    },
    /**
     * If true, a preview of the current input will be displayed above the numpad. If false, no preview will be displayed.
     */
    show_preview: {
      type: ParameterType.BOOL,
      default: true,
    },
    /**
     * A function taking in the current contents of the field `input` and returning the text to show in
     * the preview, e.g. `(input) => "$" + input` or `(input) => input + " kg"`. This only changes what
     * is displayed to the participant, and will not be reflected in the results or in `error_message`.
     */
    format_function: {
      type: ParameterType.FUNCTION,
      default: (input: string) => input,
    },
    /**
     * An HTML string that will be displayed above the numpad and the preview if not `null`.
     */
    preamble: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /**
     * The text for the continue button.
     */
    continue_button_text: {
      type: ParameterType.STRING,
      default: "Continue",
    },
    /**
     * The text for the delete button.
     */
    delete_button_text: {
      type: ParameterType.STRING,
      default: "Delete",
    },
    /**
     * The text for the negative button.
     */
    negative_button_text: {
      type: ParameterType.STRING,
      default: "±",
    },
    /**
     * Both the character entered by the `"decimal"` key and the keyboard key that will enter it.
     */
    decimal_character: {
      type: ParameterType.STRING,
      default: ".",
    },
    /**
     * The character used as a thousands or lakh-crore separator, inputting either by the `"separator"` key
     * or inserted automatically by `separate_pattern`. Can also be the keyboard key that enters it when
     * `separate_pattern` is `"none"`.
     */
    separator_character: {
      type: ParameterType.STRING,
      default: ",",
    },
    /**
     * How separators are inserted into the whole-number part of the response.
     * - `"none"`: no automatic separators, the participant may enter them with a `"separator"` key;
     * - `"thousands"`: automatic separators every three digits (1,234,567);
     * - `"lakh_crore"`: automatic separators in the Indian numbering style (12,34,567);
     *
     * A `"separator"` numpad key cannot be used with `"thousands"` or `"lakh_crore"`.
     */
    separate_pattern: {
      type: ParameterType.SELECT,
      options: ["none", "thousands", "lakh_crore"],
      default: "none",
    },
    /**
     * If true, the user may use the keyboard to enter input in addition to clicking on the numpad.
     * Only keys present on the numpad can be typed: single-digit keys, `-` for `"negative"`,
     * `decimal_character` for `"decimal"`, and `separator_character` for `"separator"`. Multi-digit
     * keys such as `"00"` can only be clicked. If false, only clicking on the numpad will be allowed.
     */
    allow_keyboard: {
      type: ParameterType.BOOL,
      default: true,
    },
    /**
     * If allow_keyboard is true, this will be the key that the user can press to
     * delete the last character they entered.
     */
    delete_key: {
      type: ParameterType.KEY,
      default: "Backspace",
    },
    /**
     * If allow_keyboard is true, this will be the key that the user can press to
     * continue and submit their input.
     */
    continue_key: {
      type: ParameterType.KEY,
      default: "Enter",
    },
    /**
     * How long to wait for the participant to continue before ending the trial, in milliseconds. When
     * the time runs out, the trial ends with whatever has been entered so far, with no validation, and
     * `rt` is null. Set this to null for no time limit.
     */
    trial_duration: {
      type: ParameterType.INT,
      default: null,
    },
  },
  data: {
    /**
     * The response as entered, including any minus sign, decimal character, and separators, but
     * without `format_function` applied. `null` if no response was given.
     */
    response: {
      type: ParameterType.STRING,
    },
    /**
     * The response parsed as a number, ignoring separators, removing leading zeros, and reading the
     * decimal character as a decimal point. Since this is a normal JavaScript number, any response
     * greater than 16 significant digits will be rounded. `null` if no response was given.
     */
    raw_number: {
      type: ParameterType.FLOAT,
    },
    /**
     * The response time in milliseconds for the trial. `null` if the trial ended because
     * `trial_duration` ran out.
     */
    rt: {
      type: ParameterType.INT,
    },
    /**
     * Every key press during the trial, in order, including presses that had no effect (e.g. a digit
     * past `max_digits`) and presses of `"continue"` that were rejected.
     */
    key_presses: {
      type: ParameterType.COMPLEX,
      array: true,
      nested: {
        /** The time of the key press in milliseconds, measured from the start of the trial like `rt`. */
        time: {
          type: ParameterType.INT,
        },
        /**
         * The numpad key that was pressed (e.g. `"7"`, `"00"`, `"delete"`, `"continue"`), even when it
         * was typed on the keyboard.
         */
        key_pressed: {
          type: ParameterType.STRING,
        },
        /** True for a click or tap on the numpad, false for a keyboard press. */
        is_numpad: {
          type: ParameterType.BOOL,
        },
      },
    },
  },
};

type Info = typeof info;

/**
 * **plugin-numpad**
 *
 * An interactable and responsive numpad supporting both touch and keyboard interaction for numerical input.
 *
 * @author jade
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-numpad/README.md}}
 */
class NumpadPlugin implements JsPsychPlugin<Info> {
  static info = info;
  private params: TrialType<Info>;
  /** the entered digits, one per entry, alongside "decimal" and "separator" markers. */
  private input: string[];
  /** whether the minus sign is toggled on. */
  private negative: boolean;
  private preview: HTMLElement | null;
  private errorDiv: HTMLElement;
  private startTime: number;
  private keyPresses: { time: number; key_pressed: string; is_numpad: boolean }[];
  private keyboardListener = null;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.params = trial;
    this.input = [];
    this.negative = false;
    this.keyPresses = [];
    this.keyboardListener = null;

    // validate layout and parameters
    const { rows, cols, buttons } = this.parseLayout(trial.numpad_layout);
    const keys = buttons.map((b) => b.key);
    this.validateParameters(keys);

    // build display
    display_element.innerHTML = `<style id="jspsych-numpad-styles">${this.getCss()}</style>
      <div id="jspsych-numpad-container" class="jspsych-numpad-container"
        style="--jspsych-numpad-cols: ${cols}; --jspsych-numpad-rows: ${rows};">
        ${
          trial.preamble !== null
            ? `<div id="jspsych-numpad-preamble" class="jspsych-numpad-preamble">${trial.preamble}</div>`
            : ""
        }
        <div class="jspsych-numpad-body">
          ${
            trial.show_preview
              ? `<div id="jspsych-numpad-preview" class="jspsych-numpad-preview"></div>`
              : ""
          }
          <div id="jspsych-numpad-error" class="jspsych-numpad-error"></div>
          <div id="jspsych-numpad-grid" class="jspsych-numpad-grid">
            ${Array.from(
              { length: rows },
              (_, r) => `<div class="jspsych-numpad-row-sizer" style="grid-row: ${r + 1};"></div>`
            ).join("")}
          </div>
        </div>
      </div>`;

    const grid = display_element.querySelector<HTMLElement>("#jspsych-numpad-grid");
    this.preview = display_element.querySelector("#jspsych-numpad-preview");
    this.errorDiv = display_element.querySelector("#jspsych-numpad-error");

    const labels = {
      delete: trial.delete_button_text,
      continue: trial.continue_button_text,
      negative: trial.negative_button_text,
      decimal: trial.decimal_character,
      separator: trial.separator_character,
    };

    for (const b of buttons) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "jspsych-numpad-button";
      btn.dataset.key = b.key;
      btn.style.gridRow = `${b.rowStart + 1} / ${b.rowEnd + 2}`;
      btn.style.gridColumn = `${b.colStart + 1} / ${b.colEnd + 2}`;

      const label = document.createElement("span");
      label.className = "jspsych-numpad-label";
      if (b.key in labels) {
        btn.classList.add(`jspsych-numpad-button-${b.key}`);
        btn.id = `jspsych-numpad-${b.key}`;
        label.textContent = labels[b.key];
      } else {
        btn.classList.add("jspsych-numpad-button-digit");
        btn.dataset.digit = b.key;
        label.textContent = b.key;
      }
      btn.appendChild(label);
      btn.addEventListener("click", () => this.pressKey(b.key, true));
      grid.appendChild(btn);
    }

    this.updatePreview();
    this.startTime = performance.now();

    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => this.endTrial(true), trial.trial_duration);
    }

    if (trial.allow_keyboard) {
      // typed key -> numpad key it presses. multi-digit keys like "00" can only be clicked.
      const typedKeys = new Map<string, string>();
      for (const key of keys) {
        if (/^\d$/.test(key)) typedKeys.set(key, key);
      }
      if (keys.includes("negative")) typedKeys.set("-", "negative");
      if (keys.includes("decimal")) typedKeys.set(trial.decimal_character, "decimal");
      if (keys.includes("separator")) typedKeys.set(trial.separator_character, "separator");

      this.keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: (info) => {
          if (this.jsPsych.pluginAPI.compareKeys(info.key, trial.delete_key)) {
            this.pressKey("delete", false);
          } else if (this.jsPsych.pluginAPI.compareKeys(info.key, trial.continue_key)) {
            this.pressKey("continue", false);
          } else if (typedKeys.has(info.key)) {
            this.pressKey(typedKeys.get(info.key), false);
          }
        },
        valid_responses: [...typedKeys.keys(), trial.delete_key, trial.continue_key],
        persist: true,
      });
    }
  }

  private endTrial(timedOut = false) {
    if (this.keyboardListener !== null) {
      this.jsPsych.pluginAPI.cancelKeyboardResponse(this.keyboardListener);
    }
    const input = this.formatInput();
    this.jsPsych.finishTrial({
      response: input === "" ? null : input,
      raw_number: this.getRawNumber(),
      rt: timedOut ? null : Math.round(performance.now() - this.startTime),
      key_presses: this.keyPresses,
    });
  }

  /** the input as a number, built from the digits and decimal marker rather than the formatted text. */
  private getRawNumber() {
    const digits = this.input
      .filter((c) => c !== "separator")
      .map((c) => (c === "decimal" ? "." : c))
      .join("");
    if (digits === "") return null;
    const value = Number((this.negative ? "-" : "") + digits);
    // "-0" would otherwise be recorded as -0
    return value === 0 ? 0 : value;
  }

  /**
   * checks the layout and returns one button per distinct key, spanning every cell that key
   * occupies. identical keys merge, so each key's cells must form one filled rectangle.
   *
   * validate numpad layout and returns the amount of rows, columns, and list of buttons.
   * ensures a square 2D array, valid buttons, and
   */
  private parseLayout(layout) {
    if (!Array.isArray(layout) || layout.length === 0) {
      throw new Error(
        "plugin-numpad: numpad_layout must be a non-empty 2D array (an array of rows)."
      );
    }
    const cols = Array.isArray(layout[0]) ? layout[0].length : 0;
    layout.forEach((row, r) => {
      if (!Array.isArray(row)) {
        throw new Error(
          `plugin-numpad: numpad_layout must be a 2D array, but row ${r} is not an array.`
        );
      }
      if (row.length === 0 || row.length !== cols) {
        throw new Error(
          `plugin-numpad: every row of numpad_layout must have the same, non-zero number of cells. Row 0 has ${cols}, row ${r} has ${row.length}.`
        );
      }
    });

    // validate individual cells
    const cells = layout.map((row, r) => row.map((cell, c) => this.parseCell(cell, r, c)));

    // find the bounding box of each key, in order of first appearance
    const buttons = new Map();
    cells.forEach((row, r) =>
      row.forEach((key, c) => {
        if (key === null) return;
        const b = buttons.get(key);
        if (!b) {
          buttons.set(key, { key, rowStart: r, rowEnd: r, colStart: c, colEnd: c, count: 1 });
        } else {
          b.rowStart = Math.min(b.rowStart, r);
          b.rowEnd = Math.max(b.rowEnd, r);
          b.colStart = Math.min(b.colStart, c);
          b.colEnd = Math.max(b.colEnd, c);
          b.count++;
        }
      })
    );

    // validate all keys are adjacent (bounding box key area must equal amount of instances of key)
    for (const b of buttons.values()) {
      if ((b.rowEnd - b.rowStart + 1) * (b.colEnd - b.colStart + 1) !== b.count) {
        throw new Error(
          `plugin-numpad: the "${b.key}" key appears in cells that do not form a single filled rectangle. ` +
            `Identical keys merge into one button, so each key must occupy one rectangular block of cells.`
        );
      }
    }

    return { rows: cells.length, cols, buttons: [...buttons.values()] };
  }

  /** validates a cell's contents and returns it as a string, or `null` if the cell is `null`. */
  private parseCell(cell, row: number, col: number): string | null {
    if (cell === null) return null;
    if (typeof cell === "number" && Number.isSafeInteger(cell) && cell >= 0) return String(cell);
    if (typeof cell === "string") {
      if (/^\d+$/.test(cell)) return cell;
      if (["delete", "continue", "negative", "decimal", "separator"].includes(cell)) return cell;
    }
    throw new Error(
      `plugin-numpad: numpad_layout[${row}][${col}] is ${JSON.stringify(
        cell
      )}, which is not a valid key. ` +
        `Use a non-negative integer, a string of digits, null, or one of: "delete", "continue", "negative", "decimal", "separator".`
    );
  }

  /** ensures parameters produce a valid trial with a given array of keys, otherwise throwing an error */
  private validateParameters(keys: string[]) {
    const trial = this.params;
    const pattern = trial.separate_pattern;

    if (keys.includes("separator") && pattern !== "none") {
      throw new Error(
        `plugin-numpad: numpad_layout contains a "separator" key, but separate_pattern is "${pattern}", which inserts separators automatically. Remove the key or set separate_pattern to "none".`
      );
    }

    const usesDecimal = keys.includes("decimal");
    const usesSeparator = keys.includes("separator") || pattern !== "none";
    if (usesDecimal) this.checkCharacter("decimal_character");
    if (usesSeparator) this.checkCharacter("separator_character");
    if (usesDecimal && usesSeparator && trial.decimal_character === trial.separator_character) {
      throw new Error(
        `plugin-numpad: decimal_character and separator_character are both "${trial.decimal_character}"; they must differ.`
      );
    }

    this.checkDigitCount("min_digits", 0, false);
    this.checkDigitCount("max_digits", 1, true);
    if (trial.max_digits !== null && trial.min_digits > trial.max_digits) {
      throw new Error(
        `plugin-numpad: min_digits (${trial.min_digits}) is greater than max_digits (${trial.max_digits}), so the trial can never be completed.`
      );
    }
    if (!keys.includes("continue") && !trial.allow_keyboard) {
      throw new Error(
        `plugin-numpad: numpad_layout has no "continue" key and allow_keyboard is false, so the trial can never be completed.`
      );
    }
  }

  /** throws if a character parameter the numpad relies on is missing or unusable. */
  private checkCharacter(name: string) {
    const value = this.params[name];
    if (value === null) {
      throw new Error(`plugin-numpad: ${name} cannot be null when it is used by the numpad.`);
    }
    if (typeof value !== "string" || value.length === 0 || /[\d-]/.test(value)) {
      throw new Error(
        `plugin-numpad: ${name} must be a non-empty string that contains no digits or "-".`
      );
    }
  }

  /** throws if a digit-count parameter is not an integer of at least `min` (or null, if `nullable`). */
  private checkDigitCount(name: string, min: number, nullable: boolean) {
    const value = this.params[name];
    if (nullable && value === null) return;
    if (!Number.isInteger(value) || value < min) {
      throw new Error(
        `plugin-numpad: ${name} must be ${
          nullable ? "null or " : ""
        }an integer of at least ${min}, but was ${JSON.stringify(value)}.`
      );
    }
  }

  /** logs and applies a numpad key press, from either a click (`isNumpad`) or the keyboard. */
  private pressKey(key: string, isNumpad: boolean) {
    this.keyPresses.push({
      time: Math.round(performance.now() - this.startTime),
      key_pressed: key,
      is_numpad: isNumpad,
    });

    if (key === "continue") {
      this.handleContinue();
      return;
    }

    const last = this.input[this.input.length - 1];
    if (key === "delete") {
      if (this.input.length > 0) this.input.pop();
      else this.negative = false;
    } else if (key === "negative") {
      this.negative = !this.negative;
    } else if (key === "decimal") {
      // only one decimal, never straight after a separator; a leading decimal becomes "0."
      if (this.input.includes("decimal") || last === "separator") return;
      if (this.digitCount() === 0) {
        if (!this.canAddDigits(1)) return;
        this.input.push("0");
      }
      this.input.push("decimal");
    } else if (key === "separator") {
      // only straight after a digit in the whole-number part
      if (this.input.includes("decimal") || last === undefined || last === "separator") return;
      this.input.push("separator");
    } else {
      // a multi-digit key is ignored entirely if it would go over max_digits
      if (!this.canAddDigits(key.length)) return;
      this.input.push(...key.split(""));
    }

    this.updatePreview();
    this.errorDiv.textContent = "";
  }

  private handleContinue() {
    const trial = this.params;
    const last = this.input[this.input.length - 1];
    const incomplete =
      (this.negative && this.digitCount() === 0) || last === "decimal" || last === "separator";

    if (this.digitCount() < trial.min_digits) {
      this.showError("min_digits");
    } else if (incomplete) {
      this.showError("format");
    } else if (trial.validate_fn !== null && !trial.validate_fn(this.formatInput())) {
      this.showError("validate_fn");
    } else {
      this.endTrial();
    }
  }

  private showError(reason: string) {
    this.errorDiv.textContent = String(this.params.error_message(this.formatInput(), reason));
  }

  private digitCount() {
    return this.input.filter((c) => c !== "decimal" && c !== "separator").length;
  }

  private canAddDigits(n: number) {
    return this.params.max_digits === null || this.digitCount() + n <= this.params.max_digits;
  }

  /** the input as shown to the participant, e.g. "-1,234.5". */
  private formatInput() {
    const trial = this.params;
    const decimalIndex = this.input.indexOf("decimal");
    const whole = decimalIndex === -1 ? this.input : this.input.slice(0, decimalIndex);

    let wholePart: string;
    if (trial.separate_pattern === "none") {
      wholePart = whole.map((c) => (c === "separator" ? trial.separator_character : c)).join("");
    } else {
      wholePart = this.groupDigits(whole.join(""));
    }
    const fractionPart =
      decimalIndex === -1
        ? ""
        : trial.decimal_character + this.input.slice(decimalIndex + 1).join("");

    return (this.negative ? "-" : "") + wholePart + fractionPart;
  }

  /** inserts separators into a string of digits */
  private groupDigits(digits: string) {
    if (digits.length <= 3) return digits;
    const size = this.params.separate_pattern === "thousands" ? 3 : 2;
    const groups = [digits.slice(-3)];
    let rest = digits.slice(0, -3);
    while (rest.length > size) {
      groups.unshift(rest.slice(-size));
      rest = rest.slice(0, -size);
    }
    if (rest.length > 0) groups.unshift(rest);
    return groups.join(this.params.separator_character);
  }

  /** shows the input through `format_function`, shrinking the font until it fits. */
  private updatePreview() {
    if (!this.preview) return;
    this.preview.textContent = String(this.params.format_function(this.formatInput()));
    let fontSize = 1.6;
    this.preview.style.fontSize = `${fontSize}em`;
    while (this.preview.scrollWidth > this.preview.clientWidth && fontSize > 0.5) {
      fontSize = Math.round((fontSize - 0.05) * 100) / 100;
      this.preview.style.fontSize = `${fontSize}em`;
    }
  }

  private getCss() {
    return `
      .jspsych-numpad-container {
        --jspsych-numpad-cols: 3;
        --jspsych-numpad-rows: 4;
        --jspsych-numpad-cell: 100px;
        --jspsych-numpad-gap: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 16px;
        box-sizing: border-box;
        width: 100%;
        margin: 0 auto;
        /* the rendered column width: full size, or an equal share of the window minus padding and gaps */
        --jspsych-numpad-cell-width: min(
          var(--jspsych-numpad-cell),
          (100vw - 32px - (var(--jspsych-numpad-cols) - 1) * var(--jspsych-numpad-gap)) /
            var(--jspsych-numpad-cols)
        );
      }
      /* holds the preview, error, and grid; never wider than the grid, so they always line up */
      .jspsych-numpad-body {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
        max-width: calc(
          var(--jspsych-numpad-cols) * var(--jspsych-numpad-cell) +
            (var(--jspsych-numpad-cols) - 1) * var(--jspsych-numpad-gap)
        );
      }
      .jspsych-numpad-preamble {
        text-align: center;
        font-size: 1.1em;
      }
      .jspsych-numpad-preview {
        height: 52px;
        padding: 10px 16px;
        overflow: hidden;
        font-size: 1.6em;
        text-align: center;
        border: 2px solid #aaa;
        border-radius: 6px;
        background: #f9f9f9;
        box-sizing: border-box;
        letter-spacing: 0.15em;
        white-space: nowrap;
      }
      /* always reserves two lines (enough for the default messages), so showing an error doesn't shift the numpad */
      .jspsych-numpad-error {
        color: #c0392b;
        font-size: 0.9em;
        line-height: 1.4;
        min-height: 2.8em;
        text-align: center;
      }
      .jspsych-numpad-grid {
        display: grid;
        /* columns are up to --jspsych-numpad-cell wide but may shrink to fit narrow screens */
        grid-template-columns: repeat(var(--jspsych-numpad-cols), minmax(0, var(--jspsych-numpad-cell)));
        grid-template-rows: repeat(var(--jspsych-numpad-rows), auto);
        justify-content: center;
        gap: var(--jspsych-numpad-gap);
      }
      /* an invisible square in the first column of each row, making every row as tall as a column is wide */
      .jspsych-numpad-row-sizer {
        grid-column: 1 / 2;
        aspect-ratio: 1 / 1;
        visibility: hidden;
        pointer-events: none;
      }
      .jspsych-numpad-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        min-width: 0;
        min-height: 0;
        overflow: hidden;
        line-height: 1.1;
        font-size: 1em;
        font-family: inherit;
        border: 1px solid #ccc;
        border-radius: 6px;
        background: #fff;
        cursor: pointer;
        transition: background 0.1s, transform 0.08s;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
      }
      /* labels shrink with the column width so they fit on narrow screens */
      .jspsych-numpad-label {
        font-size: min(1.4em, var(--jspsych-numpad-cell-width) * 0.3);
      }
      .jspsych-numpad-button-delete .jspsych-numpad-label,
      .jspsych-numpad-button-continue .jspsych-numpad-label {
        font-size: min(1em, var(--jspsych-numpad-cell-width) * 0.17);
      }
      .jspsych-numpad-button:hover {
        background: #e8e8e8;
      }
      .jspsych-numpad-button:active {
        background: #d0d0d0;
        transform: scale(0.95);
      }
      .jspsych-numpad-button-delete {
        background: #fdf0f0;
        border-color: #e0a0a0;
      }
      .jspsych-numpad-button-delete:hover {
        background: #f8d7d7;
      }
      .jspsych-numpad-button-continue {
        background: #eaf4ea;
        border-color: #8bc48b;
      }
      .jspsych-numpad-button-continue:hover {
        background: #cde8cd;
      }
    `;
  }
}

export default NumpadPlugin;
