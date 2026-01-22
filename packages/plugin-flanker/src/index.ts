import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

// Default arrow SVGs (48x48)
const DEFAULT_LEFT_ARROW = `<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48"><path fill="currentColor" d="M24 40 8 24 24 8l2.1 2.1-12.4 12.4H40v3H13.7l12.4 12.4Z"/></svg>`;
const DEFAULT_RIGHT_ARROW = `<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48"><path fill="currentColor" d="m24 40-2.1-2.15L34.25 25.5H8v-3h26.25L21.9 10.15 24 8l16 16Z"/></svg>`;
const DEFAULT_NEUTRAL_STIMULUS = `<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48"><rect x="12" y="22.5" width="24" height="3" fill="currentColor"/></svg>`;

const info = <const>{
  name: "flanker",
  version: version,
  parameters: {
    /** Direction of the target stimulus: 'left' or 'right' */
    target_direction: {
      type: ParameterType.STRING,
      default: "left",
    },
    /** Congruency condition: 'congruent', 'incongruent', or 'neutral' */
    congruency: {
      type: ParameterType.STRING,
      default: "congruent",
    },
    /** Custom stimulus for 'left' target. If null, uses default left arrow SVG */
    left_stimulus: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /** Custom stimulus for 'right' target. If null, uses default right arrow SVG */
    right_stimulus: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /** Custom stimulus for neutral flankers. If null, uses default neutral (dash) SVG */
    neutral_stimulus: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /** Stimulus Onset Asynchrony in milliseconds. Negative = flankers first, 0 = simultaneous, positive = target first */
    soa: {
      type: ParameterType.INT,
      default: 0,
    },
    /** Duration to display the stimulus array (ms). If null, waits for response */
    stimulus_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** Maximum time allowed for response (ms) */
    response_timeout: {
      type: ParameterType.INT,
      default: 1500,
    },
    /** Response mode: 'keyboard' or 'buttons' */
    response_mode: {
      type: ParameterType.STRING,
      default: "keyboard",
    },
    /** Keys accepted for left response (keyboard mode only) */
    response_keys_left: {
      type: ParameterType.KEYS,
      default: ["arrowleft"],
    },
    /** Keys accepted for right response (keyboard mode only) */
    response_keys_right: {
      type: ParameterType.KEYS,
      default: ["arrowright"],
    },
    /** Label for left button (button mode only) */
    button_label_left: {
      type: ParameterType.STRING,
      default: "Left",
    },
    /** Label for right button (button mode only) */
    button_label_right: {
      type: ParameterType.STRING,
      default: "Right",
    },
    /** Size of each stimulus item (width and height) */
    stimulus_size: {
      type: ParameterType.STRING,
      default: "48px",
    },
    /** Separation between target and flankers */
    target_flanker_separation: {
      type: ParameterType.STRING,
      default: "10px",
    },
    /** Height of stimulus container */
    container_height: {
      type: ParameterType.STRING,
      default: "100px",
    },
    /** Arrangement of flanker array: 'horizontal' or 'vertical' */
    flanker_arrangement: {
      type: ParameterType.STRING,
      default: "horizontal",
    },
    /** Number of flanker items (4 creates 5-item array, 6 creates 7-item array) */
    num_flankers: {
      type: ParameterType.INT,
      default: 4,
    },
  },
  data: {
    /** Target direction */
    target_direction: {
      type: ParameterType.STRING,
    },
    /** Congruency condition */
    congruency: {
      type: ParameterType.STRING,
    },
    /** SOA value used */
    soa: {
      type: ParameterType.INT,
    },
    /** Response mode used */
    response_mode: {
      type: ParameterType.STRING,
    },
    /** Response time in milliseconds */
    rt: {
      type: ParameterType.INT,
    },
    /** Response key or button ('left' or 'right') */
    response: {
      type: ParameterType.STRING,
    },
    /** Whether the response was correct */
    correct: {
      type: ParameterType.BOOL,
    },
  },
  citations: "__CITATIONS__",
};

type Info = typeof info;

/**
 * **plugin-flanker**
 *
 * Generic flanker task plugin supporting arrows, letters, numbers, or custom stimuli.
 * Implements precise SOA (Stimulus Onset Asynchrony) timing using requestAnimationFrame.
 * Supports both keyboard and mobile-friendly button responses.
 *
 * @author Josh de Leeuw
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-flanker}
 */
class FlankerPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  async trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // Validate parameters
    if (!["left", "right"].includes(trial.target_direction)) {
      throw new Error(`target_direction must be 'left' or 'right', got: ${trial.target_direction}`);
    }
    if (!["congruent", "incongruent", "neutral"].includes(trial.congruency)) {
      throw new Error(
        `congruency must be 'congruent', 'incongruent', or 'neutral', got: ${trial.congruency}`
      );
    }
    if (!["keyboard", "buttons"].includes(trial.response_mode)) {
      throw new Error(`response_mode must be 'keyboard' or 'buttons', got: ${trial.response_mode}`);
    }
    if (!["horizontal", "vertical"].includes(trial.flanker_arrangement)) {
      throw new Error(
        `flanker_arrangement must be 'horizontal' or 'vertical', got: ${trial.flanker_arrangement}`
      );
    }
    if (![4, 6].includes(trial.num_flankers)) {
      throw new Error(`num_flankers must be 4 or 6, got: ${trial.num_flankers}`);
    }

    // Determine stimuli to use (custom or default)
    const leftStim = trial.left_stimulus || DEFAULT_LEFT_ARROW;
    const rightStim = trial.right_stimulus || DEFAULT_RIGHT_ARROW;
    const neutralStim = trial.neutral_stimulus || DEFAULT_NEUTRAL_STIMULUS;

    // Determine target and flanker stimuli based on trial parameters
    const targetStim = trial.target_direction === "left" ? leftStim : rightStim;
    let flankerStim: string;
    if (trial.congruency === "congruent") {
      flankerStim = targetStim;
    } else if (trial.congruency === "incongruent") {
      flankerStim = trial.target_direction === "left" ? rightStim : leftStim;
    } else {
      // neutral
      flankerStim = neutralStim;
    }

    // Build flanker array items
    const flankersPerSide = trial.num_flankers / 2;
    const items: { content: string; isTarget: boolean; id: string }[] = [];

    for (let i = 0; i < flankersPerSide; i++) {
      items.push({ content: flankerStim, isTarget: false, id: `flanker-left-${i}` });
    }
    items.push({ content: targetStim, isTarget: true, id: "target" });
    for (let i = 0; i < flankersPerSide; i++) {
      items.push({ content: flankerStim, isTarget: false, id: `flanker-right-${i}` });
    }

    // Create display
    const flexDirection = trial.flanker_arrangement === "horizontal" ? "row" : "column";
    const marginProp =
      trial.flanker_arrangement === "horizontal" ? "margin-right" : "margin-bottom";

    let html = `<div id="flanker-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: ${trial.container_height};">`;
    html += `<div id="flanker-array" style="display: flex; flex-direction: ${flexDirection}; align-items: center; justify-content: center;">`;

    items.forEach((item, index) => {
      const margin =
        index < items.length - 1 ? `${marginProp}: ${trial.target_flanker_separation};` : "";
      html += `<div id="${item.id}" class="flanker-item ${item.isTarget ? "target" : "flanker"}"
                    style="width: ${trial.stimulus_size}; height: ${
        trial.stimulus_size
      }; ${margin} display: flex; align-items: center; justify-content: center; visibility: hidden;">
                 ${item.content}
               </div>`;
    });

    html += `</div>`; // close flanker-array

    // Add buttons if in button mode
    if (trial.response_mode === "buttons") {
      html += `<div id="flanker-buttons" style="margin-top: 20px; display: flex; gap: 20px;">`;
      html += `<button id="flanker-btn-left" class="jspsych-btn" style="font-size: 18px; padding: 12px 24px;" disabled>${trial.button_label_left}</button>`;
      html += `<button id="flanker-btn-right" class="jspsych-btn" style="font-size: 18px; padding: 12px 24px;" disabled>${trial.button_label_right}</button>`;
      html += `</div>`;
    }

    html += `</div>`; // close flanker-container

    display_element.innerHTML = html;

    // RAF-based timing helper
    const waitForDuration = (duration: number): Promise<void> => {
      return new Promise((resolve) => {
        const startTime = performance.now();
        const checkTime = () => {
          if (performance.now() - startTime >= duration) {
            resolve();
          } else {
            requestAnimationFrame(checkTime);
          }
        };
        requestAnimationFrame(checkTime);
      });
    };

    // Helper functions for showing/hiding stimuli
    const showFlankers = () => {
      items.forEach((item) => {
        if (!item.isTarget) {
          const elem = document.getElementById(item.id);
          if (elem) elem.style.visibility = "visible";
        }
      });
    };

    const showTarget = () => {
      const targetElem = document.getElementById("target");
      if (targetElem) targetElem.style.visibility = "visible";
    };

    const showAll = () => {
      items.forEach((item) => {
        const elem = document.getElementById(item.id);
        if (elem) elem.style.visibility = "visible";
      });
    };

    const hideAll = () => {
      items.forEach((item) => {
        const elem = document.getElementById(item.id);
        if (elem) elem.style.visibility = "hidden";
      });
    };

    // Phase 1: SOA timing with RAF
    const trialStartTime = performance.now();

    if (trial.soa < 0) {
      // Negative SOA: flankers first, then target
      showFlankers();
      await waitForDuration(Math.abs(trial.soa));
      showTarget();
    } else if (trial.soa === 0) {
      // Zero SOA: simultaneous presentation
      showAll();
    } else {
      // Positive SOA: target first, then flankers
      showTarget();
      await waitForDuration(trial.soa);
      showFlankers();
    }

    // Phase 2: Response collection
    const responseStartTime = performance.now();
    let response: { key: string; rt: number } | null = null;
    let responseMade = false;

    const finishTrial = () => {
      if (responseMade) return;
      responseMade = true;

      // Calculate correctness
      let correct = false;
      if (response) {
        const responseDirection =
          response.key === "left" ||
          response.key.toLowerCase() === "arrowleft" ||
          (trial.response_mode === "buttons" && response.key === "left")
            ? "left"
            : "right";
        correct = responseDirection === trial.target_direction;
      }

      // End trial
      this.jsPsych.finishTrial({
        congruency: trial.congruency,
        rt: response ? response.rt : null,
        response: response ? response.key : null,
        correct: correct,
      });
    };

    // Setup response collection based on mode
    if (trial.response_mode === "keyboard") {
      const allKeys = [...trial.response_keys_left, ...trial.response_keys_right];

      const keyboardListener = (info: { key: string; rt: number }) => {
        const responseDirection = trial.response_keys_left.includes(info.key.toLowerCase())
          ? "left"
          : "right";
        response = {
          key: responseDirection,
          rt: info.rt,
        };
        finishTrial();
      };

      this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: keyboardListener,
        valid_responses: allKeys,
        rt_method: "performance",
        persist: false,
        allow_held_key: false,
      });
    } else {
      // Button mode
      const leftBtn = document.getElementById("flanker-btn-left") as HTMLButtonElement;
      const rightBtn = document.getElementById("flanker-btn-right") as HTMLButtonElement;

      leftBtn.disabled = false;
      rightBtn.disabled = false;

      const handleButtonClick = (direction: string) => {
        const rt = performance.now() - responseStartTime;
        response = { key: direction, rt: rt };
        leftBtn.disabled = true;
        rightBtn.disabled = true;
        finishTrial();
      };

      leftBtn.addEventListener("click", () => handleButtonClick("left"));
      rightBtn.addEventListener("click", () => handleButtonClick("right"));
    }

    // Phase 3: Handle stimulus duration
    if (trial.stimulus_duration !== null) {
      await waitForDuration(trial.stimulus_duration);
      hideAll();
    }

    // Phase 4: Handle response timeout
    await waitForDuration(trial.response_timeout);
    finishTrial();
  }
}

export default FlankerPlugin;
