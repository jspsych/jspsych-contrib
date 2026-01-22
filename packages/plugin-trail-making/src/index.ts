import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "trail-making",
  version: version,
  parameters: {
    /**
     * The type of trail making test to run.
     * "A" = numbers only (1-2-3-4...)
     * "B" = alternating numbers and letters (1-A-2-B-3-C...)
     */
    test_type: {
      type: ParameterType.STRING,
      default: "A",
    },
    /**
     * The number of targets to display. For type "B", this should be an even number
     * to have equal numbers and letters.
     */
    num_targets: {
      type: ParameterType.INT,
      default: 25,
    },
    /**
     * The width of the display area in pixels.
     */
    canvas_width: {
      type: ParameterType.INT,
      default: 600,
    },
    /**
     * The height of the display area in pixels.
     */
    canvas_height: {
      type: ParameterType.INT,
      default: 600,
    },
    /**
     * The radius of each target circle in pixels.
     */
    target_radius: {
      type: ParameterType.INT,
      default: 25,
    },
    /**
     * The minimum distance between target centers in pixels.
     */
    min_separation: {
      type: ParameterType.INT,
      default: 80,
    },
    /**
     * The color of unvisited target circles.
     */
    target_color: {
      type: ParameterType.STRING,
      default: "#ffffff",
    },
    /**
     * The border color of target circles.
     */
    target_border_color: {
      type: ParameterType.STRING,
      default: "#000000",
    },
    /**
     * The color of visited (correctly clicked) target circles.
     */
    visited_color: {
      type: ParameterType.STRING,
      default: "#90EE90",
    },
    /**
     * The color of the line connecting targets.
     */
    line_color: {
      type: ParameterType.STRING,
      default: "#000000",
    },
    /**
     * The width of the connecting line in pixels.
     */
    line_width: {
      type: ParameterType.INT,
      default: 2,
    },
    /**
     * The color to flash when an error is made.
     */
    error_color: {
      type: ParameterType.STRING,
      default: "#FF6B6B",
    },
    /**
     * Duration in milliseconds to show error feedback.
     */
    error_duration: {
      type: ParameterType.INT,
      default: 500,
    },
    /**
     * Optional array of {x, y, label} objects to specify exact target positions.
     * If provided, overrides num_targets and random positioning.
     * Coordinates are in pixels from top-left of canvas.
     */
    targets: {
      type: ParameterType.COMPLEX,
      default: null,
    },
    /**
     * Text prompt displayed above the canvas.
     */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /**
     * Random seed for reproducible target layouts. If null, uses random seed.
     */
    seed: {
      type: ParameterType.INT,
      default: null,
    },
  },
  data: {
    /** The type of trail making test ("A" or "B"). */
    test_type: {
      type: ParameterType.STRING,
    },
    /** Array of target objects with x, y, and label properties. */
    targets: {
      type: ParameterType.COMPLEX,
      array: true,
    },
    /** Array of click events with target_index, label, time, x, y, and correct properties. */
    clicks: {
      type: ParameterType.COMPLEX,
      array: true,
    },
    /** Total time in milliseconds from first click to last correct click. */
    completion_time: {
      type: ParameterType.INT,
    },
    /** Number of errors (incorrect clicks). */
    num_errors: {
      type: ParameterType.INT,
    },
    /** Total path distance in pixels (sum of distances between consecutive correct targets). */
    total_path_distance: {
      type: ParameterType.FLOAT,
    },
    /** Array of response times between consecutive correct clicks. */
    inter_click_times: {
      type: ParameterType.INT,
      array: true,
    },
  },
};

type Info = typeof info;

interface Target {
  x: number;
  y: number;
  label: string;
}

interface ClickEvent {
  target_index: number | null;
  label: string | null;
  time: number;
  x: number;
  y: number;
  correct: boolean;
}

/**
 * **trail-making**
 *
 * A jsPsych plugin for the Trail Making Test (TMT), a neuropsychological test of
 * visual attention and task switching. Participants connect circles in sequence
 * as quickly as possible.
 *
 * Part A: Connect numbers in order (1-2-3-4...)
 * Part B: Alternate between numbers and letters (1-A-2-B-3-C...)
 *
 * @author Josh de Leeuw
 * @see {@link https://github.com/jspsych/jspsych-contrib/tree/main/packages/plugin-trail-making}
 */
class TrailMakingPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // Generate or use provided targets
    const targets = trial.targets ? (trial.targets as Target[]) : this.generateTargets(trial);

    // Determine the correct sequence
    const sequence = this.getCorrectSequence(trial.test_type, targets);

    // State variables
    let currentTargetIndex = 0;
    let startTime: number | null = null;
    let lastClickTime: number | null = null;
    const clicks: ClickEvent[] = [];
    const interClickTimes: number[] = [];
    let numErrors = 0;
    let isShowingError = false;

    // Create display
    const container = document.createElement("div");
    container.style.cssText = "display: flex; flex-direction: column; align-items: center;";

    if (trial.prompt) {
      const promptDiv = document.createElement("div");
      promptDiv.innerHTML = trial.prompt;
      promptDiv.style.marginBottom = "10px";
      container.appendChild(promptDiv);
    }

    const canvas = document.createElement("canvas");
    canvas.width = trial.canvas_width;
    canvas.height = trial.canvas_height;
    canvas.style.cssText = "border: 1px solid #ccc; cursor: pointer; touch-action: none;";
    container.appendChild(canvas);

    display_element.appendChild(container);

    const ctx = canvas.getContext("2d")!;

    // Draw initial state
    this.drawCanvas(ctx, targets, [], trial);

    // Handle clicks/taps
    const handleClick = (e: MouseEvent | TouchEvent) => {
      if (isShowingError) return;

      const rect = canvas.getBoundingClientRect();
      let clientX: number, clientY: number;

      if (e instanceof TouchEvent) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const now = performance.now();

      // Start timing on first click
      if (startTime === null) {
        startTime = now;
      }

      // Find clicked target
      const clickedTargetIndex = this.findClickedTarget(x, y, targets, trial.target_radius);
      const expectedLabel = sequence[currentTargetIndex];

      const clickEvent: ClickEvent = {
        target_index: clickedTargetIndex,
        label: clickedTargetIndex !== null ? targets[clickedTargetIndex].label : null,
        time: Math.round(now - startTime),
        x: Math.round(x),
        y: Math.round(y),
        correct: false,
      };

      if (clickedTargetIndex !== null && targets[clickedTargetIndex].label === expectedLabel) {
        // Correct click
        clickEvent.correct = true;

        if (lastClickTime !== null) {
          interClickTimes.push(Math.round(now - lastClickTime));
        }
        lastClickTime = now;

        currentTargetIndex++;
        clicks.push(clickEvent);

        // Redraw with updated visited targets
        const visitedLabels = sequence.slice(0, currentTargetIndex);
        this.drawCanvas(ctx, targets, visitedLabels, trial);

        // Check if complete
        if (currentTargetIndex >= sequence.length) {
          this.endTrial(targets, clicks, startTime, now, numErrors, interClickTimes, trial);
        }
      } else {
        // Error
        clickEvent.correct = false;
        clicks.push(clickEvent);
        numErrors++;

        // Show error feedback
        isShowingError = true;
        const visitedLabels = sequence.slice(0, currentTargetIndex);
        this.drawCanvas(ctx, targets, visitedLabels, trial, true);

        this.jsPsych.pluginAPI.setTimeout(() => {
          isShowingError = false;
          this.drawCanvas(ctx, targets, visitedLabels, trial);
        }, trial.error_duration);
      }
    };

    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchend", handleClick);
  }

  private generateTargets(trial: TrialType<Info>): Target[] {
    const labels = this.generateLabels(trial.test_type, trial.num_targets);
    const targets: Target[] = [];
    const padding = trial.target_radius + 10;
    const maxAttempts = 1000;

    // Simple seeded random for reproducibility
    let seed = trial.seed ?? Math.floor(Math.random() * 1000000);
    const random = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };

    for (const label of labels) {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < maxAttempts) {
        const x = padding + random() * (trial.canvas_width - 2 * padding);
        const y = padding + random() * (trial.canvas_height - 2 * padding);

        // Check distance from all existing targets
        let validPosition = true;
        for (const target of targets) {
          const dist = Math.sqrt((x - target.x) ** 2 + (y - target.y) ** 2);
          if (dist < trial.min_separation) {
            validPosition = false;
            break;
          }
        }

        if (validPosition) {
          targets.push({ x: Math.round(x), y: Math.round(y), label });
          placed = true;
        }

        attempts++;
      }

      if (!placed) {
        // Fallback: place with reduced separation requirement
        const x = padding + random() * (trial.canvas_width - 2 * padding);
        const y = padding + random() * (trial.canvas_height - 2 * padding);
        targets.push({ x: Math.round(x), y: Math.round(y), label });
      }
    }

    return targets;
  }

  private generateLabels(type: string, numTargets: number): string[] {
    const labels: string[] = [];

    if (type === "A") {
      for (let i = 1; i <= numTargets; i++) {
        labels.push(i.toString());
      }
    } else if (type === "B") {
      const numbers = [];
      const letters = [];
      const numPairs = Math.floor(numTargets / 2);

      for (let i = 1; i <= numPairs; i++) {
        numbers.push(i.toString());
      }
      for (let i = 0; i < numPairs; i++) {
        letters.push(String.fromCharCode(65 + i)); // A, B, C, ...
      }

      // Interleave: 1, A, 2, B, 3, C, ...
      for (let i = 0; i < numPairs; i++) {
        labels.push(numbers[i]);
        labels.push(letters[i]);
      }

      // If odd number, add one more number
      if (numTargets % 2 === 1) {
        labels.push((numPairs + 1).toString());
      }
    }

    return labels;
  }

  private getCorrectSequence(type: string, targets: Target[]): string[] {
    // The correct sequence is the labels in order
    if (type === "A") {
      // Sort by numeric value
      return targets.map((t) => t.label).sort((a, b) => parseInt(a) - parseInt(b));
    } else {
      // For type B, sequence is 1, A, 2, B, 3, C, ...
      const numbers = targets
        .filter((t) => /^\d+$/.test(t.label))
        .map((t) => t.label)
        .sort((a, b) => parseInt(a) - parseInt(b));
      const letters = targets
        .filter((t) => /^[A-Z]$/.test(t.label))
        .map((t) => t.label)
        .sort();

      const sequence: string[] = [];
      const maxLen = Math.max(numbers.length, letters.length);
      for (let i = 0; i < maxLen; i++) {
        if (i < numbers.length) sequence.push(numbers[i]);
        if (i < letters.length) sequence.push(letters[i]);
      }
      return sequence;
    }
  }

  private findClickedTarget(
    x: number,
    y: number,
    targets: Target[],
    radius: number
  ): number | null {
    // Add a small cushion (5px) around each target to make clicking easier
    const hitRadius = radius + 5;
    for (let i = 0; i < targets.length; i++) {
      const dist = Math.sqrt((x - targets[i].x) ** 2 + (y - targets[i].y) ** 2);
      if (dist <= hitRadius) {
        return i;
      }
    }
    return null;
  }

  private drawCanvas(
    ctx: CanvasRenderingContext2D,
    targets: Target[],
    visitedLabels: string[],
    trial: TrialType<Info>,
    showError: boolean = false
  ) {
    const width = trial.canvas_width;
    const height = trial.canvas_height;

    // Clear canvas
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, width, height);

    // Draw lines between visited targets in sequence order
    if (visitedLabels.length > 1) {
      ctx.strokeStyle = trial.line_color;
      ctx.lineWidth = trial.line_width;
      ctx.beginPath();

      for (let i = 0; i < visitedLabels.length; i++) {
        const target = targets.find((t) => t.label === visitedLabels[i]);
        if (target) {
          if (i === 0) {
            ctx.moveTo(target.x, target.y);
          } else {
            ctx.lineTo(target.x, target.y);
          }
        }
      }
      ctx.stroke();
    }

    // Draw targets
    for (const target of targets) {
      const isVisited = visitedLabels.includes(target.label);

      // Set fill color before drawing
      if (showError && !isVisited) {
        ctx.fillStyle = trial.error_color;
      } else if (isVisited) {
        ctx.fillStyle = trial.visited_color;
      } else {
        ctx.fillStyle = trial.target_color;
      }

      // Circle
      ctx.beginPath();
      ctx.arc(target.x, target.y, trial.target_radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = trial.target_border_color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = "#000000";
      ctx.font = `bold ${Math.round(trial.target_radius * 0.8)}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(target.label, target.x, target.y);
    }
  }

  private endTrial(
    targets: Target[],
    clicks: ClickEvent[],
    startTime: number,
    endTime: number,
    numErrors: number,
    interClickTimes: number[],
    trial: TrialType<Info>
  ) {
    // Calculate total path distance
    const correctClicks = clicks.filter((c) => c.correct);
    let totalPathDistance = 0;

    for (let i = 1; i < correctClicks.length; i++) {
      const prev = targets.find((t) => t.label === correctClicks[i - 1].label);
      const curr = targets.find((t) => t.label === correctClicks[i].label);
      if (prev && curr) {
        totalPathDistance += Math.sqrt((curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2);
      }
    }

    const trial_data = {
      test_type: trial.test_type,
      targets: targets,
      clicks: clicks,
      completion_time: Math.round(endTime - startTime),
      num_errors: numErrors,
      total_path_distance: Math.round(totalPathDistance * 100) / 100,
      inter_click_times: interClickTimes,
    };

    this.jsPsych.finishTrial(trial_data);
  }
}

export default TrailMakingPlugin;
