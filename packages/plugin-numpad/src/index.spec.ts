import { clickTarget, pressKey, startTimeline } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

import jsPsychNumpad from ".";

jest.useFakeTimers();

// trials left unfinished by a test would otherwise stay in the DOM and shadow the next test's numpad
beforeEach(() => {
  document.body.innerHTML = "";
});

const key = (k: string) => document.querySelector(`.jspsych-numpad-button[data-key='${k}']`);
const click = (...keys: string[]) => keys.forEach((k) => clickTarget(key(k)));
const preview = () => document.querySelector("#jspsych-numpad-preview").textContent;
/** Runs a single numpad trial and expects it to throw a validation error containing `message`. */
const expectInvalid = async (params: Record<string, unknown>, message: string) => {
  await expect(initJsPsych().run([{ type: jsPsychNumpad, ...params }])).rejects.toThrow(message);
};
const errorText = () => {
  const el = document.querySelector<HTMLElement>("#jspsych-numpad-error");
  return el.textContent === "" ? null : el.textContent;
};

describe("plugin-numpad", () => {
  describe("basic input", () => {
    it("records response and rt after pressing 1 then continue", async () => {
      const { expectFinished, getData } = await startTimeline([{ type: jsPsychNumpad }]);

      click("1");
      jest.advanceTimersByTime(1000);
      click("continue");

      await expectFinished();
      const data = getData().values()[0];
      expect(data.response).toBe("1");
      expect(data.rt).toBeGreaterThan(0);
    });

    it("preserves leading zeros in the response", async () => {
      const { expectFinished, getData } = await startTimeline([{ type: jsPsychNumpad }]);

      click("0", "0", "7", "continue");

      await expectFinished();
      expect(getData().values()[0].response).toBe("007");
      expect(getData().values()[0].raw_number).toBe(7);
    });

    it("deletes the last character", async () => {
      const { expectRunning } = await startTimeline([{ type: jsPsychNumpad }]);

      click("1", "2", "delete");
      expect(preview()).toBe("1");
      await expectRunning();
    });
  });

  describe("numpad_layout", () => {
    it("accepts numbers and digit strings, including multi-digit keys", async () => {
      const { expectFinished, getData } = await startTimeline([
        {
          type: jsPsychNumpad,
          numpad_layout: [
            ["1", 2, "00"],
            ["delete", "000", "continue"],
          ],
        },
      ]);

      click("1", "000", "2", "00", "continue");

      await expectFinished();
      expect(getData().values()[0].response).toBe("1000200");
    });

    it("throws when rows have different lengths", async () => {
      await expectInvalid(
        { numpad_layout: [[1, 2, 3], [4, 5], ["continue"]] },
        "same, non-zero number of cells"
      );
    });

    it("throws on invalid keys", async () => {
      await expectInvalid({ numpad_layout: [[1, "X", "C"]] }, "not a valid key");
      await expectInvalid({ numpad_layout: [[1, -1, "continue"]] }, "not a valid key");
      await expectInvalid({ numpad_layout: [[1, "1.5", "continue"]] }, "not a valid key");
    });

    it("leaves null cells empty", async () => {
      await startTimeline([
        {
          type: jsPsychNumpad,
          numpad_layout: [
            [1, null, 2],
            [null, "continue", null],
          ],
        },
      ]);

      expect(document.querySelectorAll(".jspsych-numpad-button")).toHaveLength(3);
    });

    it("merges adjacent identical keys into one button spanning their cells", async () => {
      await startTimeline([
        {
          type: jsPsychNumpad,
          numpad_layout: [
            [7, 8, 9, "delete"],
            [4, 5, 6, "delete"],
            [1, 2, 3, "continue"],
            [0, 0, "decimal", "continue"],
          ],
        },
      ]);

      expect(document.querySelectorAll(".jspsych-numpad-button[data-key='0']")).toHaveLength(1);
      const zero = key("0") as HTMLElement;
      expect(zero.style.gridRow).toBe("4 / 5");
      expect(zero.style.gridColumn).toBe("1 / 3");
      const cont = key("continue") as HTMLElement;
      expect(cont.style.gridRow).toBe("3 / 5");
      expect(cont.style.gridColumn).toBe("4 / 5");
    });

    it("treats 7 and '7' as the same key when merging", async () => {
      await startTimeline([{ type: jsPsychNumpad, numpad_layout: [[7, "7", "continue"]] }]);
      expect(document.querySelectorAll(".jspsych-numpad-button[data-key='7']")).toHaveLength(1);
    });

    it("throws when a key's cells do not form a rectangle", async () => {
      // L-shape
      await expectInvalid(
        {
          numpad_layout: [
            [0, 1],
            [0, 0],
            [2, "continue"],
          ],
        },
        '"0" key appears in cells that do not form a single filled rectangle'
      );
      // same key in two separate places
      await expectInvalid(
        { numpad_layout: [["continue", 1, "continue"]] },
        "single filled rectangle"
      );
    });
  });

  describe("negative, decimal, and separator keys", () => {
    const layout = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      ["negative", 0, "decimal"],
      ["separator", "delete", "continue"],
    ];

    it("toggles a leading minus sign", async () => {
      const { expectFinished, getData } = await startTimeline([
        { type: jsPsychNumpad, numpad_layout: layout },
      ]);

      click("5", "negative");
      expect(preview()).toBe("-5");
      click("negative");
      expect(preview()).toBe("5");
      click("negative", "continue");

      await expectFinished();
      expect(getData().values()[0].response).toBe("-5");
      expect(getData().values()[0].raw_number).toBe(-5);
    });

    it("records a negative zero as 0 in raw_number", async () => {
      const { expectFinished, getData } = await startTimeline([
        { type: jsPsychNumpad, numpad_layout: layout },
      ]);

      click("negative", "0", "decimal", "0", "continue");

      await expectFinished();
      expect(getData().values()[0].response).toBe("-0.0");
      expect(Object.is(getData().values()[0].raw_number, 0)).toBe(true);
    });

    it("allows only one decimal and adds a leading zero when empty", async () => {
      const { expectRunning } = await startTimeline([
        { type: jsPsychNumpad, numpad_layout: layout },
      ]);

      click("decimal");
      expect(preview()).toBe("0.");
      click("5", "decimal", "2");
      expect(preview()).toBe("0.52");
      await expectRunning();
    });

    it("uses decimal_character and separator_character", async () => {
      const { expectFinished, getData } = await startTimeline([
        {
          type: jsPsychNumpad,
          numpad_layout: layout,
          decimal_character: ",",
          separator_character: ".",
        },
      ]);

      click("1", "separator", "2", "3", "4", "decimal", "5", "continue");

      await expectFinished();
      expect(getData().values()[0].response).toBe("1.234,5");
      expect(getData().values()[0].raw_number).toBe(1234.5);
    });

    it("only allows a separator directly after a digit in the whole-number part", async () => {
      const { expectRunning } = await startTimeline([
        { type: jsPsychNumpad, numpad_layout: layout },
      ]);

      click("separator");
      expect(preview()).toBe("");
      click("1", "separator", "separator");
      expect(preview()).toBe("1,");
      click("decimal");
      expect(preview()).toBe("1,");
      click("2", "decimal", "3", "separator");
      expect(preview()).toBe("1,2.3");
      await expectRunning();
    });

    it("rejects responses ending in a minus, decimal, or separator", async () => {
      const { expectRunning } = await startTimeline([
        { type: jsPsychNumpad, numpad_layout: layout },
      ]);

      click("1", "separator", "continue");
      expect(errorText()).toContain("finish entering");
      click("delete", "decimal", "continue");
      expect(errorText()).toContain("finish entering");
      await expectRunning();
    });

    it("throws if a decimal key is present but decimal_character is null", async () => {
      await expectInvalid(
        { numpad_layout: layout, decimal_character: null },
        "decimal_character cannot be null"
      );
    });

    it("throws if a separator key is present but separator_character is null", async () => {
      await expectInvalid(
        { numpad_layout: layout, separator_character: null },
        "separator_character cannot be null"
      );
    });

    it("throws if decimal_character and separator_character are the same", async () => {
      await expectInvalid({ numpad_layout: layout, separator_character: "." }, "must differ");
    });
  });

  describe("separate_pattern", () => {
    const layout = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      ["decimal", 0, "continue"],
    ];

    it("groups by thousands", async () => {
      const { expectFinished, getData } = await startTimeline([
        { type: jsPsychNumpad, numpad_layout: layout, separate_pattern: "thousands" },
      ]);

      click("1", "2", "3", "4", "5", "6", "7", "decimal", "8", "9", "1", "2");
      expect(preview()).toBe("1,234,567.8912");
      click("continue");

      await expectFinished();
      expect(getData().values()[0].response).toBe("1,234,567.8912");
      expect(getData().values()[0].raw_number).toBe(1234567.8912);
    });

    it("groups by lakh and crore", async () => {
      const { expectRunning } = await startTimeline([
        { type: jsPsychNumpad, numpad_layout: layout, separate_pattern: "lakh_crore" },
      ]);

      click("1", "2", "3");
      expect(preview()).toBe("123");
      click("4");
      expect(preview()).toBe("1,234");
      click("5", "6", "7", "8");
      expect(preview()).toBe("1,23,45,678");
      await expectRunning();
    });

    it("throws if combined with a separator key", async () => {
      await expectInvalid(
        { numpad_layout: [["separator", 1, "continue"]], separate_pattern: "thousands" },
        "inserts separators automatically"
      );
    });

    it("throws if separator_character is null", async () => {
      await expectInvalid(
        { separate_pattern: "thousands", separator_character: null },
        "separator_character cannot be null"
      );
    });
  });

  describe("min_digits and max_digits", () => {
    it("counts only digits, not separators or the decimal", async () => {
      const { expectFinished, getData } = await startTimeline([
        {
          type: jsPsychNumpad,
          numpad_layout: [[1, "decimal", "negative", "continue"]],
          min_digits: 2,
          max_digits: 2,
        },
      ]);

      click("negative", "1", "decimal", "continue");
      expect(errorText()).toContain("minimum number of digits");
      click("1", "1");
      expect(preview()).toBe("-1.1");
      click("continue");

      await expectFinished();
      expect(getData().values()[0].response).toBe("-1.1");
    });

    it("ignores a multi-digit key press that would exceed max_digits", async () => {
      const { expectRunning } = await startTimeline([
        { type: jsPsychNumpad, numpad_layout: [[1, 10, "continue"]], max_digits: 2 },
      ]);

      click("1", "10");
      expect(preview()).toBe("1");
      click("1", "10");
      expect(preview()).toBe("11");
      await expectRunning();
    });

    it("allows an empty response when min_digits is 0", async () => {
      const { expectFinished, getData } = await startTimeline([
        { type: jsPsychNumpad, min_digits: 0 },
      ]);

      click("continue");

      await expectFinished();
      expect(getData().values()[0].response).toBeNull();
      expect(getData().values()[0].raw_number).toBeNull();
    });

    it("throws when min_digits is greater than max_digits", async () => {
      await expectInvalid(
        { min_digits: 5, max_digits: 4 },
        "min_digits (5) is greater than max_digits (4)"
      );
    });

    it("throws on negative, null, or non-integer counts", async () => {
      await expectInvalid({ min_digits: -1 }, "min_digits must be an integer of at least 0");
      await expectInvalid({ min_digits: null }, "min_digits must be an integer of at least 0");
      await expectInvalid({ max_digits: 0 }, "max_digits must be null or an integer of at least 1");
    });

    it("throws when there is no way to continue", async () => {
      await expectInvalid(
        { numpad_layout: [[1, 2, 3]], allow_keyboard: false },
        'no "continue" key'
      );
    });
  });

  describe("validate_fn and error_message", () => {
    it("rejects input that fails validate_fn, after digit checks", async () => {
      const validate_fn = jest.fn((input: string) => Number(input) <= 100);
      const { expectFinished, expectRunning, getData } = await startTimeline([
        { type: jsPsychNumpad, validate_fn, min_digits: 2 },
      ]);

      click("5", "continue");
      expect(validate_fn).not.toHaveBeenCalled();
      expect(errorText()).toContain("minimum number of digits");

      click("0", "0", "continue");
      expect(validate_fn).toHaveBeenCalledWith("500");
      expect(errorText()).toContain("valid response");
      await expectRunning();

      click("delete", "continue");
      await expectFinished();
      expect(getData().values()[0].response).toBe("50");
    });

    it("calls error_message with the input and the reason", async () => {
      const error_message = jest.fn((input: string, reason: string) => `${reason}: ${input}`);
      const { expectRunning } = await startTimeline([
        { type: jsPsychNumpad, min_digits: 2, validate_fn: () => false, error_message },
      ]);

      click("7", "continue");
      expect(errorText()).toBe("min_digits: 7");
      click("8", "continue");
      expect(errorText()).toBe("validate_fn: 78");
      expect(error_message).toHaveBeenCalledTimes(2);
      await expectRunning();
    });

    it("hides the error after further input", async () => {
      const { expectRunning } = await startTimeline([{ type: jsPsychNumpad }]);

      click("continue");
      expect(errorText()).not.toBeNull();
      click("1");
      expect(errorText()).toBeNull();
      await expectRunning();
    });
  });

  describe("keyboard", () => {
    it("types digits, deletes, and continues", async () => {
      const { expectFinished, getData } = await startTimeline([{ type: jsPsychNumpad }]);

      await pressKey("1");
      await pressKey("2");
      await pressKey("Backspace");
      await pressKey("3");
      expect(preview()).toBe("13");
      await pressKey("Enter");

      await expectFinished();
      expect(getData().values()[0].response).toBe("13");
    });

    it("types digits defined as strings", async () => {
      const { expectRunning } = await startTimeline([
        { type: jsPsychNumpad, numpad_layout: [["1", "2", "continue"]] },
      ]);

      await pressKey("1");
      await pressKey("2");
      expect(preview()).toBe("12");
      await expectRunning();
    });

    it("types negative, decimal, and separator keys", async () => {
      const { expectRunning } = await startTimeline([
        {
          type: jsPsychNumpad,
          numpad_layout: [[1, "negative", "decimal", "separator", "continue"]],
          decimal_character: ",",
          separator_character: " ",
        },
      ]);

      await pressKey("1");
      await pressKey(" ");
      await pressKey("1");
      await pressKey(",");
      await pressKey("1");
      await pressKey("-");
      expect(preview()).toBe("-1 1,1");
      await expectRunning();
    });

    it("ignores keys that are not on the numpad", async () => {
      const { expectRunning } = await startTimeline([
        { type: jsPsychNumpad, numpad_layout: [[1, "00", "continue"]] },
      ]);

      await pressKey("2");
      await pressKey("0");
      await pressKey("-");
      await pressKey(".");
      expect(preview()).toBe("");
      await expectRunning();
    });

    it("ignores the keyboard when allow_keyboard is false", async () => {
      const { expectRunning } = await startTimeline([
        { type: jsPsychNumpad, allow_keyboard: false },
      ]);

      await pressKey("1");
      expect(preview()).toBe("");
      await expectRunning();
    });
  });

  describe("focus", () => {
    it("keeps focus off keys when they are clicked", async () => {
      await startTimeline([{ type: jsPsychNumpad }]);

      const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
      key("5").dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });

    it("leaves Enter to a key focused with Tab instead of also continuing", async () => {
      const { expectRunning, getData } = await startTimeline([{ type: jsPsychNumpad }]);

      click("5");
      (key("5") as HTMLElement).focus();
      await pressKey("Enter");

      expect(errorText()).toBeNull();
      await expectRunning();
      (document.activeElement as HTMLElement).blur();
      await pressKey("Enter");
      expect(
        getData()
          .values()[0]
          .key_presses.map((p) => p.key_pressed)
      ).toEqual(["5", "continue"]);
    });
  });

  describe("key_presses", () => {
    it("logs every press with its time and whether it came from the numpad", async () => {
      const { expectFinished, getData } = await startTimeline([
        { type: jsPsychNumpad, max_digits: 1 },
      ]);

      jest.advanceTimersByTime(100);
      click("1");
      jest.advanceTimersByTime(100);
      await pressKey("2"); // ignored: over max_digits, but still logged
      click("delete");
      await pressKey("Backspace");
      click("continue"); // rejected: no digits
      await pressKey("3");
      await pressKey("Enter");

      await expectFinished();
      const data = getData().values()[0];
      expect(data.key_presses).toEqual([
        { time: 100, key_pressed: "1", is_numpad: true },
        { time: 200, key_pressed: "2", is_numpad: false },
        { time: 200, key_pressed: "delete", is_numpad: true },
        { time: 200, key_pressed: "delete", is_numpad: false },
        { time: 200, key_pressed: "continue", is_numpad: true },
        { time: 200, key_pressed: "3", is_numpad: false },
        { time: 200, key_pressed: "continue", is_numpad: false },
      ]);
      expect(data.response).toBe("3");
    });

    it("is empty if nothing was pressed", async () => {
      const { expectFinished, getData } = await startTimeline([
        { type: jsPsychNumpad, trial_duration: 500 },
      ]);

      jest.advanceTimersByTime(500);

      await expectFinished();
      expect(getData().values()[0].key_presses).toEqual([]);
    });
  });

  describe("format_function", () => {
    it("formats the preview but not the response", async () => {
      const validate_fn = jest.fn(() => true);
      const { expectFinished, getData } = await startTimeline([
        {
          type: jsPsychNumpad,
          numpad_layout: [[1, 2, "decimal", "continue"]],
          separate_pattern: "thousands",
          format_function: (input: string) => `$${input} USD`,
          validate_fn,
        },
      ]);

      expect(preview()).toBe("$ USD");
      click("1", "2", "1", "2", "decimal", "1");
      expect(preview()).toBe("$1,212.1 USD");
      click("continue");

      await expectFinished();
      expect(validate_fn).toHaveBeenCalledWith("1,212.1");
      expect(getData().values()[0].response).toBe("1,212.1");
    });
  });

  describe("trial_duration", () => {
    it("ends the trial with the current input, unchecked, and a null rt", async () => {
      const { expectRunning, expectFinished, getData } = await startTimeline([
        {
          type: jsPsychNumpad,
          numpad_layout: [[1, "decimal", "continue"]],
          min_digits: 3,
          trial_duration: 1000,
        },
      ]);

      click("1", "decimal");
      jest.advanceTimersByTime(999);
      await expectRunning();
      jest.advanceTimersByTime(1);

      await expectFinished();
      const data = getData().values()[0];
      expect(data.response).toBe("1.");
      expect(data.raw_number).toBe(1);
      expect(data.rt).toBeNull();
      expect(data.key_presses).toHaveLength(2);
    });

    it("does not end the trial early if the participant continues first", async () => {
      const { expectFinished, getData } = await startTimeline([
        { type: jsPsychNumpad, trial_duration: 1000 },
      ]);

      jest.advanceTimersByTime(300);
      click("1", "continue");

      await expectFinished();
      expect(getData().values()[0].rt).toBe(300);
      jest.advanceTimersByTime(1000);
      expect(getData().values()).toHaveLength(1);
    });
  });
});
