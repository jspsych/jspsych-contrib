import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "tower-of-london",
  version: version,
  parameters: {
    /** Starting configuration of balls on pegs. Array of 3 arrays, each containing ball colors from bottom to top. e.g., [["red", "green", "blue"], [], []] */
    start_state: {
      type: ParameterType.COMPLEX,
      default: [["red", "green", "blue"], [], []],
    },
    /** Goal configuration that participant must achieve. Same format as start_state. */
    goal_state: {
      type: ParameterType.COMPLEX,
      default: [["blue"], ["green"], ["red"]],
    },
    /** Capacity of each peg (max number of balls). Array of 3 numbers. Classic TOL uses [1, 2, 3]. */
    peg_capacities: {
      type: ParameterType.INT,
      array: true,
      default: [3, 3, 3],
    },
    /** Minimum number of moves for optimal solution. Used for scoring. Set to null to skip optimality check. */
    optimal_moves: {
      type: ParameterType.INT,
      default: null,
    },
    /** Maximum moves allowed before trial ends. Set to null for unlimited. */
    max_moves: {
      type: ParameterType.INT,
      default: null,
    },
    /** Time limit in milliseconds. Set to null for unlimited. */
    time_limit: {
      type: ParameterType.INT,
      default: null,
    },
    /** Width of the canvas in pixels */
    canvas_width: {
      type: ParameterType.INT,
      default: 500,
    },
    /** Height of the canvas in pixels */
    canvas_height: {
      type: ParameterType.INT,
      default: 400,
    },
    /** Ball radius in pixels */
    ball_radius: {
      type: ParameterType.INT,
      default: 30,
    },
    /** Colors for the balls. Object mapping ball names to CSS colors. */
    ball_colors: {
      type: ParameterType.COMPLEX,
      default: {
        red: "#e74c3c",
        green: "#27ae60",
        blue: "#3498db",
      },
    },
    /** Color of the pegs */
    peg_color: {
      type: ParameterType.STRING,
      default: "#8B4513",
    },
    /** Background color of the canvas */
    background_color: {
      type: ParameterType.STRING,
      default: "#f5f5f5",
    },
    /** Whether to show the goal state display */
    show_goal: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** Whether to show a move counter */
    show_move_counter: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** HTML prompt displayed above the puzzle */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /** Text for the done button. Set to null to auto-complete when goal is reached. */
    done_button_text: {
      type: ParameterType.STRING,
      default: null,
    },
    /** Delay in milliseconds to show the final configuration before ending trial. */
    end_delay: {
      type: ParameterType.INT,
      default: 1000,
    },
  },
  data: {
    /** Whether the participant solved the puzzle */
    solved: {
      type: ParameterType.BOOL,
    },
    /** Number of moves made */
    num_moves: {
      type: ParameterType.INT,
    },
    /** Whether solution was optimal (if optimal_moves was specified) */
    optimal: {
      type: ParameterType.BOOL,
    },
    /** Response time in milliseconds */
    rt: {
      type: ParameterType.INT,
    },
    /** Array of moves made: [{from: pegIndex, to: pegIndex, ball: color, time: ms}] */
    moves: {
      type: ParameterType.COMPLEX,
    },
    /** Final state of the puzzle */
    final_state: {
      type: ParameterType.COMPLEX,
    },
    /** The starting configuration */
    start_state: {
      type: ParameterType.COMPLEX,
    },
    /** The goal configuration */
    goal_state: {
      type: ParameterType.COMPLEX,
    },
  },
  citations: "__CITATIONS__",
};

type Info = typeof info;

type BallColor = string;
type PegState = BallColor[];
type PuzzleState = [PegState, PegState, PegState];

interface Move {
  from: number;
  to: number;
  ball: BallColor;
  time: number;
}

/**
 * **tower-of-london**
 *
 * A jsPsych plugin for Tower of London/Hanoi style puzzle tasks. Participants
 * move colored balls between pegs to match a goal configuration.
 *
 * @author Josh de Leeuw
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-tower-of-london/README.md}
 */
class TowerOfLondonPlugin implements JsPsychPlugin<Info> {
  static info = info;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: PuzzleState;
  private selectedPeg: number | null = null;
  private moves: Move[] = [];
  private startTime: number;
  private trialParams: TrialType<Info>;
  private display_element: HTMLElement;
  private clickHandler: (e: MouseEvent) => void;
  private touchHandler: (e: TouchEvent) => void;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.display_element = display_element;
    this.trialParams = trial;
    this.moves = [];
    this.selectedPeg = null;

    // Deep copy the start state
    this.state = JSON.parse(JSON.stringify(trial.start_state)) as PuzzleState;

    // Build the display
    let html = '<div class="jspsych-tower-of-london-container">';

    if (trial.prompt) {
      html += `<div class="jspsych-tower-of-london-prompt">${trial.prompt}</div>`;
    }

    if (trial.show_move_counter) {
      html +=
        '<div class="jspsych-tower-of-london-counter">Moves: <span id="move-count">0</span></div>';
    }

    html += '<div class="jspsych-tower-of-london-main">';

    // Main puzzle canvas
    html += `<canvas id="jspsych-tower-of-london-canvas" width="${trial.canvas_width}" height="${trial.canvas_height}"></canvas>`;

    // Goal display
    if (trial.show_goal) {
      const goalWidth = Math.floor((trial.canvas_width as number) * 0.4);
      const goalHeight = Math.floor((trial.canvas_height as number) * 0.4);
      html += `<div class="jspsych-tower-of-london-goal">`;
      html += `<div class="jspsych-tower-of-london-goal-label">Goal:</div>`;
      html += `<canvas id="jspsych-tower-of-london-goal-canvas" width="${goalWidth}" height="${goalHeight}"></canvas>`;
      html += `</div>`;
    }

    html += "</div>"; // main

    if (trial.done_button_text) {
      html += `<button id="jspsych-tower-of-london-done" class="jspsych-btn">${trial.done_button_text}</button>`;
    }

    html += "</div>"; // container

    display_element.innerHTML = html;

    // Get canvas contexts
    this.canvas = document.getElementById("jspsych-tower-of-london-canvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;

    // Draw initial state
    this.draw();

    // Draw goal if shown
    if (trial.show_goal) {
      this.drawGoal();
    }

    // Set up event listeners with bound handlers
    this.clickHandler = this.handleClick.bind(this);
    this.touchHandler = this.handleTouch.bind(this);
    this.canvas.addEventListener("click", this.clickHandler);
    this.canvas.addEventListener("touchend", this.touchHandler);

    if (trial.done_button_text) {
      document
        .getElementById("jspsych-tower-of-london-done")!
        .addEventListener("click", () => this.endTrial());
    }

    // Set time limit if specified
    if (trial.time_limit) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        this.endTrial();
      }, trial.time_limit);
    }

    this.startTime = performance.now();
  }

  private draw() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const trial = this.trialParams;

    // Clear canvas
    ctx.fillStyle = trial.background_color as string;
    ctx.fillRect(0, 0, width, height);

    const pegWidth = 15;
    const pegSpacing = width / 4;
    const baseY = height - 30;
    const pegHeight = height - 80;

    // Draw base
    ctx.fillStyle = trial.peg_color as string;
    ctx.fillRect(20, baseY, width - 40, 20);

    // Draw pegs and balls
    for (let i = 0; i < 3; i++) {
      const pegX = pegSpacing * (i + 1);

      // Draw peg
      ctx.fillStyle = trial.peg_color as string;
      ctx.fillRect(pegX - pegWidth / 2, baseY - pegHeight, pegWidth, pegHeight);

      // Draw capacity indicator (subtle dots)
      const capacity = (trial.peg_capacities as number[])[i];
      ctx.fillStyle = "#ccc";
      for (let c = 0; c < capacity; c++) {
        const dotY = baseY - 30 - c * ((trial.ball_radius as number) * 2 + 5);
        ctx.beginPath();
        ctx.arc(pegX + 30, dotY, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw balls on this peg
      const balls = this.state[i];
      for (let j = 0; j < balls.length; j++) {
        const ball = balls[j];
        const ballY = baseY - 30 - j * ((trial.ball_radius as number) * 2 + 5);
        const ballX = pegX;

        ctx.fillStyle = (trial.ball_colors as Record<string, string>)[ball] || ball;
        ctx.beginPath();
        ctx.arc(ballX, ballY, trial.ball_radius as number, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Highlight selected peg
      if (this.selectedPeg === i) {
        ctx.strokeStyle = "#f1c40f";
        ctx.lineWidth = 4;
        ctx.strokeRect(pegX - 50, baseY - pegHeight - 20, 100, pegHeight + 15);
      }
    }
  }

  private drawGoal() {
    const goalCanvas = document.getElementById(
      "jspsych-tower-of-london-goal-canvas"
    ) as HTMLCanvasElement;
    if (!goalCanvas) return;

    const ctx = goalCanvas.getContext("2d")!;
    const width = goalCanvas.width;
    const height = goalCanvas.height;
    const trial = this.trialParams;
    const goalState = trial.goal_state as PuzzleState;

    const scale = 0.4;
    const ballRadius = (trial.ball_radius as number) * scale;
    const pegWidth = 8;
    const pegSpacing = width / 4;
    const baseY = height - 15;
    const pegHeight = height - 40;

    // Clear
    ctx.fillStyle = trial.background_color as string;
    ctx.fillRect(0, 0, width, height);

    // Draw base
    ctx.fillStyle = trial.peg_color as string;
    ctx.fillRect(10, baseY, width - 20, 10);

    // Draw pegs and balls
    for (let i = 0; i < 3; i++) {
      const pegX = pegSpacing * (i + 1);

      // Draw peg
      ctx.fillStyle = trial.peg_color as string;
      ctx.fillRect(pegX - pegWidth / 2, baseY - pegHeight, pegWidth, pegHeight);

      // Draw balls
      const balls = goalState[i];
      for (let j = 0; j < balls.length; j++) {
        const ball = balls[j];
        const ballY = baseY - 15 - j * (ballRadius * 2 + 2);
        const ballX = pegX;

        ctx.fillStyle = (trial.ball_colors as Record<string, string>)[ball] || ball;
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  private handleClick(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    this.handleInteraction(x);
  }

  private handleTouch(e: TouchEvent) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const touch = e.changedTouches[0];
    const x = touch.clientX - rect.left;
    this.handleInteraction(x);
  }

  private handleInteraction(x: number) {
    const width = this.canvas.width;
    const pegSpacing = width / 4;

    // Determine which peg was clicked
    let clickedPeg: number | null = null;
    for (let i = 0; i < 3; i++) {
      const pegX = pegSpacing * (i + 1);
      if (Math.abs(x - pegX) < 50) {
        clickedPeg = i;
        break;
      }
    }

    if (clickedPeg === null) return;

    if (this.selectedPeg === null) {
      // Select a peg (must have balls)
      if (this.state[clickedPeg].length > 0) {
        this.selectedPeg = clickedPeg;
        this.draw();
      }
    } else {
      // Try to move to the clicked peg
      if (clickedPeg === this.selectedPeg) {
        // Deselect
        this.selectedPeg = null;
        this.draw();
      } else {
        // Attempt move
        const success = this.tryMove(this.selectedPeg, clickedPeg);
        this.selectedPeg = null;
        this.draw();

        if (success) {
          // Update move counter
          const counter = document.getElementById("move-count");
          if (counter) {
            counter.textContent = this.moves.length.toString();
          }

          // Check for max moves
          if (
            this.trialParams.max_moves &&
            this.moves.length >= (this.trialParams.max_moves as number)
          ) {
            this.endTrial();
            return;
          }

          // Check for goal state (auto-complete if no done button)
          if (!this.trialParams.done_button_text && this.checkGoal()) {
            this.endTrial();
          }
        }
      }
    }
  }

  private tryMove(from: number, to: number): boolean {
    const fromPeg = this.state[from];
    const toPeg = this.state[to];
    const capacity = (this.trialParams.peg_capacities as number[])[to];

    // Check if move is valid
    if (fromPeg.length === 0) return false;
    if (toPeg.length >= capacity) return false;

    // Make the move
    const ball = fromPeg.pop()!;
    toPeg.push(ball);

    // Record the move
    this.moves.push({
      from,
      to,
      ball,
      time: performance.now() - this.startTime,
    });

    return true;
  }

  private checkGoal(): boolean {
    const goal = this.trialParams.goal_state as PuzzleState;
    for (let i = 0; i < 3; i++) {
      if (this.state[i].length !== goal[i].length) return false;
      for (let j = 0; j < this.state[i].length; j++) {
        if (this.state[i][j] !== goal[i][j]) return false;
      }
    }
    return true;
  }

  private endTrial() {
    const rt = performance.now() - this.startTime;
    const solved = this.checkGoal();
    const optimal =
      this.trialParams.optimal_moves !== null
        ? solved && this.moves.length <= (this.trialParams.optimal_moves as number)
        : null;

    const trial_data = {
      solved,
      num_moves: this.moves.length,
      optimal,
      rt: Math.round(rt),
      moves: this.moves,
      final_state: JSON.parse(JSON.stringify(this.state)),
      start_state: this.trialParams.start_state,
      goal_state: this.trialParams.goal_state,
    };

    // Clean up event listeners immediately to prevent further interaction
    this.canvas.removeEventListener("click", this.clickHandler);
    this.canvas.removeEventListener("touchend", this.touchHandler);

    const finishTrial = () => {
      this.display_element.innerHTML = "";
      this.jsPsych.finishTrial(trial_data);
    };

    // Show final state for end_delay duration before ending trial
    const endDelay = this.trialParams.end_delay as number;
    if (endDelay > 0) {
      this.jsPsych.pluginAPI.setTimeout(finishTrial, endDelay);
    } else {
      finishTrial();
    }
  }
}

export default TowerOfLondonPlugin;
