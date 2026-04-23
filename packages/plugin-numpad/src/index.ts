import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "plugin-numpad",
  version: version,
  parameters: {
    /**
     * A 12-element array of numbers 0-9, alongside "X" and "C", corresponding to the delete and continue keys.
     * This parameter can be used to customize the layout of the numpad, where the 1st element corresponds to the
     * top left key, going left to right and then down.
     */
    numpad_layout: {
      type: ParameterType.COMPLEX,
      default: [1, 2, 3, 4, 5, 6, 7, 8, 9, "X", 0, "C"],
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
     * The minimum number of digits that must be entered in order to continue. If the participant tries to continue
     * before entering this number of digits, an error message will be displayed and they will not be allowed to
     * continue until they have entered enough digits.
     */
    min_digits: {
      type: ParameterType.INT,
      default: 1,
    },
    /**
     * The error message that will be displayed if the participant tries to continue before entering the minimum number of digits.
     */
    error_message: {
      type: ParameterType.STRING,
      default: "Please enter at least the minimum number of digits before continuing.",
    },
    /**
     * If true, a preview of the current input will be displayed above the numpad. If false, no preview will be displayed.
     */
    show_preview: {
      type: ParameterType.BOOL,
      default: true,
    },
    /**
     * An HTML string that will be displayed above the numpad and the preview if enabled.
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
     * If true, the user may use the keyboard to enter input in addition to clicking on the numpad.
     * If false, only clicking on the numpad will be allowed.
     */
    allow_keyboard: {
      type: ParameterType.BOOL,
      default: true,
    },
    /**
     * If allow_keyboard is true, this will be the key that the user can press to
     * delete the last digit they entered.
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
  },
  data: {
    /** The number that was entered by the participant, `null` if no response was given. */
    response: {
      type: ParameterType.INT,
    },
    /** The response time in milliseconds for the trial. */
    rt: {
      type: ParameterType.INT,
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

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    const style = document.createElement("style");
    style.id = "jspsych-numpad-styles";
    style.textContent = `
      .jspsych-numpad-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 16px;
        box-sizing: border-box;
        width: 100%;
        max-width: 360px;
        margin: 0 auto;
      }
      .jspsych-numpad-preamble {
        width: 100%;
        text-align: center;
        font-size: 1.1em;
      }
      .jspsych-numpad-preview {
        width: 100%;
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
      .jspsych-numpad-error {
        color: #c0392b;
        font-size: 0.9em;
        text-align: center;
        width: 100%;
      }
      .jspsych-numpad-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        width: 100%;
      }
      .jspsych-numpad-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        aspect-ratio: 1 / 1;
        font-size: 1.4em;
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
        font-size: 1em;
      }
      .jspsych-numpad-button-delete:hover {
        background: #f8d7d7;
      }
      .jspsych-numpad-button-continue {
        background: #eaf4ea;
        border-color: #8bc48b;
        font-size: 1em;
      }
      .jspsych-numpad-button-continue:hover {
        background: #cde8cd;
      }
    `;
    display_element.appendChild(style);

    // container
    const container = document.createElement("div");
    container.id = "jspsych-numpad-container";
    container.className = "jspsych-numpad-container";

    // preamble
    if (trial.preamble !== null) {
      const preamble = document.createElement("div");
      preamble.id = "jspsych-numpad-preamble";
      preamble.className = "jspsych-numpad-preamble";
      preamble.innerHTML = trial.preamble;
      container.appendChild(preamble);
    }

    // preview
    let preview: HTMLDivElement | null = null;
    if (trial.show_preview) {
      preview = document.createElement("div");
      preview.id = "jspsych-numpad-preview";
      preview.className = "jspsych-numpad-preview";
      container.appendChild(preview);
    }

    // error message
    const errorDiv = document.createElement("div");
    errorDiv.id = "jspsych-numpad-error";
    errorDiv.className = "jspsych-numpad-error";
    errorDiv.style.display = "none";
    errorDiv.textContent = trial.error_message;
    container.appendChild(errorDiv);

    // numpad grid
    const grid = document.createElement("div");
    grid.id = "jspsych-numpad-grid";
    grid.className = "jspsych-numpad-grid";

    for (const key of trial.numpad_layout) {
      const btn = document.createElement("button");
      btn.className = "jspsych-numpad-button";

      if (key === "X") {
        btn.classList.add("jspsych-numpad-button-delete");
        btn.id = "jspsych-numpad-delete";
        btn.textContent = trial.delete_button_text;
        btn.addEventListener("click", handleDelete);
      } else if (key === "C") {
        btn.classList.add("jspsych-numpad-button-continue");
        btn.id = "jspsych-numpad-continue";
        btn.textContent = trial.continue_button_text;
        btn.addEventListener("click", handleContinue);
      } else {
        btn.classList.add("jspsych-numpad-button-digit");
        btn.dataset.digit = String(key);
        btn.textContent = String(key);
        btn.addEventListener("click", () => handleDigit(String(key)));
      }

      grid.appendChild(btn);
    }

    container.appendChild(grid);
    display_element.appendChild(container);

    const startTime = performance.now();
    let currentInput = "";

    function updatePreview() {
      if (preview) {
        preview.textContent = currentInput;
        let fontSize = 1.6;
        preview.style.fontSize = `${fontSize}em`;
        while (preview.scrollWidth > preview.clientWidth && fontSize > 0.5) {
          fontSize = Math.round((fontSize - 0.05) * 100) / 100;
          preview.style.fontSize = `${fontSize}em`;
        }
      }
    }

    function handleDigit(digit: string) {
      if (trial.max_digits !== null && currentInput.length >= trial.max_digits) return;
      currentInput += digit;
      updatePreview();
      errorDiv.style.display = "none";
    }

    function handleDelete() {
      currentInput = currentInput.slice(0, -1);
      updatePreview();
      errorDiv.style.display = "none";
    }

    function handleContinue() {
      if (currentInput.length < trial.min_digits) {
        errorDiv.style.display = "block";
        return;
      } else {
        endTrial();
      }
    }

    if (trial.allow_keyboard) {
      const validDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
      this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: (info: { key: string }) => {
          if (info.key === trial.delete_key) {
            handleDelete();
          } else if (info.key === trial.continue_key) {
            handleContinue();
          } else if (validDigits.includes(info.key)) {
            handleDigit(info.key);
          }
        },
        valid_responses: [...validDigits, trial.delete_key, trial.continue_key],
        persist: true,
      });
    }

    const endTrial = () => {
      if (trial.allow_keyboard) {
        this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
      }
      const rt = Math.round(performance.now() - startTime);
      this.jsPsych.finishTrial({
        response: currentInput === "" ? null : parseInt(currentInput, 10),
        rt,
      });
    };
  }
}

export default NumpadPlugin;
