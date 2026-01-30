import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "pursuit-rotor",
  version: version,
  parameters: {
    /** Duration of the trial in milliseconds */
    trial_duration: {
      type: ParameterType.INT,
      default: 15000,
    },
    /** Radius of the circular path in pixels */
    path_radius: {
      type: ParameterType.INT,
      default: 150,
    },
    /** Radius of the target circle in pixels */
    target_radius: {
      type: ParameterType.INT,
      default: 25,
    },
    /** Speed of rotation in rotations per second */
    rotation_speed: {
      type: ParameterType.FLOAT,
      default: 0.125,
    },
    /** Direction of rotation: 'clockwise' or 'counterclockwise' */
    rotation_direction: {
      type: ParameterType.STRING,
      default: "clockwise",
    },
    /** Starting angle in degrees (0 = right, 90 = bottom, etc.) */
    start_angle: {
      type: ParameterType.INT,
      default: 0,
    },
    /** Width of the canvas in pixels */
    canvas_width: {
      type: ParameterType.INT,
      default: 500,
    },
    /** Height of the canvas in pixels */
    canvas_height: {
      type: ParameterType.INT,
      default: 500,
    },
    /** Color of the target when cursor is on it */
    target_color_on: {
      type: ParameterType.STRING,
      default: "#27ae60",
    },
    /** Color of the target when cursor is off it */
    target_color_off: {
      type: ParameterType.STRING,
      default: "#e74c3c",
    },
    /** Color of the circular path guide (set to null to hide) */
    path_color: {
      type: ParameterType.STRING,
      default: "#ddd",
    },
    /** Background color of the canvas */
    background_color: {
      type: ParameterType.STRING,
      default: "#f5f5f5",
    },
    /** Whether to show the path guide circle */
    show_path: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** HTML prompt displayed above the canvas */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /** Sampling interval in milliseconds for recording data */
    sample_interval: {
      type: ParameterType.INT,
      default: 16,
    },
    /** Whether to require holding mouse button down (true) or just track cursor position (false) */
    require_mouse_down: {
      type: ParameterType.BOOL,
      default: false,
    },
  },
  data: {
    /** Total time the cursor was on the target in milliseconds */
    time_on_target: {
      type: ParameterType.INT,
    },
    /** Percentage of trial time cursor was on target */
    percent_on_target: {
      type: ParameterType.FLOAT,
    },
    /** Mean deviation from target center in pixels */
    mean_deviation: {
      type: ParameterType.FLOAT,
    },
    /** Total duration of the trial in milliseconds */
    trial_duration: {
      type: ParameterType.INT,
    },
    /** Array of sampled data points */
    samples: {
      type: ParameterType.COMPLEX,
    },
  },
  citations: "__CITATIONS__",
};

type Info = typeof info;

interface Sample {
  time: number;
  target_x: number;
  target_y: number;
  cursor_x: number | null;
  cursor_y: number | null;
  on_target: boolean;
  deviation: number | null;
}

/**
 * **pursuit-rotor**
 *
 * Motor tracking task requiring continuous tracking of a moving target with
 * mouse or touch input. The target moves in a circular path and participants
 * must keep their cursor on the target.
 *
 * @author Josh de Leeuw
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-pursuit-rotor/README.md}
 */
class PursuitRotorPlugin implements JsPsychPlugin<Info> {
  static info = info;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number;
  private startTime: number;
  private trialParams: TrialType<Info>;
  private display_element: HTMLElement;
  private cursorX: number | null = null;
  private cursorY: number | null = null;
  private isMouseDown: boolean = false;
  private samples: Sample[] = [];
  private lastSampleTime: number = 0;
  private timeOnTarget: number = 0;
  private totalDeviation: number = 0;
  private deviationCount: number = 0;
  private centerX: number;
  private centerY: number;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.display_element = display_element;
    this.trialParams = trial;
    this.samples = [];
    this.cursorX = null;
    this.cursorY = null;
    this.isMouseDown = false;
    this.timeOnTarget = 0;
    this.totalDeviation = 0;
    this.deviationCount = 0;
    this.lastSampleTime = 0;

    this.centerX = (trial.canvas_width as number) / 2;
    this.centerY = (trial.canvas_height as number) / 2;

    // Build the display
    let html = '<div class="jspsych-pursuit-rotor-container" style="text-align: center;">';

    if (trial.prompt) {
      html += `<div class="jspsych-pursuit-rotor-prompt">${trial.prompt}</div>`;
    }

    html += `<canvas id="jspsych-pursuit-rotor-canvas" width="${trial.canvas_width}" height="${trial.canvas_height}" style="touch-action: none; cursor: crosshair;"></canvas>`;
    html += "</div>";

    display_element.innerHTML = html;

    // Get canvas context
    this.canvas = document.getElementById("jspsych-pursuit-rotor-canvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;

    // Set up event listeners
    this.setupEventListeners();

    // Start animation
    this.startTime = performance.now();
    this.animate();

    // Set trial timeout
    this.jsPsych.pluginAPI.setTimeout(() => {
      this.endTrial();
    }, trial.trial_duration as number);
  }

  private setupEventListeners() {
    // Mouse events
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.canvas.addEventListener("mouseleave", this.handleMouseLeave.bind(this));

    // Touch events
    this.canvas.addEventListener("touchmove", this.handleTouchMove.bind(this));
    this.canvas.addEventListener("touchstart", this.handleTouchStart.bind(this));
    this.canvas.addEventListener("touchend", this.handleTouchEnd.bind(this));
  }

  private handleMouseMove(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    this.cursorX = e.clientX - rect.left;
    this.cursorY = e.clientY - rect.top;
  }

  private handleMouseDown(e: MouseEvent) {
    this.isMouseDown = true;
    this.handleMouseMove(e);
  }

  private handleMouseUp() {
    this.isMouseDown = false;
  }

  private handleMouseLeave() {
    this.cursorX = null;
    this.cursorY = null;
    this.isMouseDown = false;
  }

  private handleTouchMove(e: TouchEvent) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    this.cursorX = touch.clientX - rect.left;
    this.cursorY = touch.clientY - rect.top;
  }

  private handleTouchStart(e: TouchEvent) {
    this.isMouseDown = true;
    this.handleTouchMove(e);
  }

  private handleTouchEnd() {
    this.isMouseDown = false;
    this.cursorX = null;
    this.cursorY = null;
  }

  private getTargetPosition(elapsed: number): { x: number; y: number } {
    const trial = this.trialParams;
    const speed = trial.rotation_speed as number;
    const direction = trial.rotation_direction === "counterclockwise" ? -1 : 1;
    const startAngle = ((trial.start_angle as number) * Math.PI) / 180;

    const angle = startAngle + ((direction * elapsed) / 1000) * 2 * Math.PI * speed;

    const x = this.centerX + (trial.path_radius as number) * Math.cos(angle);
    const y = this.centerY + (trial.path_radius as number) * Math.sin(angle);

    return { x, y };
  }

  private isOnTarget(
    cursorX: number | null,
    cursorY: number | null,
    targetX: number,
    targetY: number
  ): boolean {
    if (cursorX === null || cursorY === null) return false;
    if (this.trialParams.require_mouse_down && !this.isMouseDown) return false;

    const distance = Math.sqrt(Math.pow(cursorX - targetX, 2) + Math.pow(cursorY - targetY, 2));
    return distance <= (this.trialParams.target_radius as number);
  }

  private getDeviation(
    cursorX: number | null,
    cursorY: number | null,
    targetX: number,
    targetY: number
  ): number | null {
    if (cursorX === null || cursorY === null) return null;
    if (this.trialParams.require_mouse_down && !this.isMouseDown) return null;

    return Math.sqrt(Math.pow(cursorX - targetX, 2) + Math.pow(cursorY - targetY, 2));
  }

  private animate() {
    const now = performance.now();
    const elapsed = now - this.startTime;

    // Get target position
    const target = this.getTargetPosition(elapsed);

    // Check if on target
    const onTarget = this.isOnTarget(this.cursorX, this.cursorY, target.x, target.y);
    const deviation = this.getDeviation(this.cursorX, this.cursorY, target.x, target.y);

    // Sample data at interval
    if (elapsed - this.lastSampleTime >= (this.trialParams.sample_interval as number)) {
      const sample: Sample = {
        time: Math.round(elapsed),
        target_x: Math.round(target.x),
        target_y: Math.round(target.y),
        cursor_x: this.cursorX !== null ? Math.round(this.cursorX) : null,
        cursor_y: this.cursorY !== null ? Math.round(this.cursorY) : null,
        on_target: onTarget,
        deviation: deviation !== null ? Math.round(deviation * 100) / 100 : null,
      };
      this.samples.push(sample);

      // Track time on target
      if (onTarget) {
        this.timeOnTarget += this.trialParams.sample_interval as number;
      }

      // Track deviation
      if (deviation !== null) {
        this.totalDeviation += deviation;
        this.deviationCount++;
      }

      this.lastSampleTime = elapsed;
    }

    // Draw
    this.draw(target.x, target.y, onTarget);

    // Continue animation
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private draw(targetX: number, targetY: number, onTarget: boolean) {
    const ctx = this.ctx;
    const trial = this.trialParams;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Clear canvas
    ctx.fillStyle = trial.background_color as string;
    ctx.fillRect(0, 0, width, height);

    // Draw path guide
    if (trial.show_path && trial.path_color) {
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, trial.path_radius as number, 0, Math.PI * 2);
      ctx.strokeStyle = trial.path_color as string;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw target
    ctx.beginPath();
    ctx.arc(targetX, targetY, trial.target_radius as number, 0, Math.PI * 2);
    ctx.fillStyle = onTarget
      ? (trial.target_color_on as string)
      : (trial.target_color_off as string);
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw center dot on target
    ctx.beginPath();
    ctx.arc(targetX, targetY, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
  }

  private endTrial() {
    // Stop animation
    cancelAnimationFrame(this.animationId);

    const trialDuration = this.trialParams.trial_duration as number;
    const percentOnTarget = (this.timeOnTarget / trialDuration) * 100;
    const meanDeviation =
      this.deviationCount > 0 ? this.totalDeviation / this.deviationCount : null;

    const trial_data = {
      time_on_target: this.timeOnTarget,
      percent_on_target: Math.round(percentOnTarget * 100) / 100,
      mean_deviation: meanDeviation !== null ? Math.round(meanDeviation * 100) / 100 : null,
      trial_duration: trialDuration,
      samples: this.samples,
    };

    // Clean up
    this.display_element.innerHTML = "";
    this.jsPsych.finishTrial(trial_data);
  }
}

export default PursuitRotorPlugin;
