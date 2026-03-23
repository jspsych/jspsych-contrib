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
    /** Capacity of each peg (max number of balls). Array of 3 numbers. Classic TOL uses [3, 2, 1]. */
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
    /** Width of the display in pixels */
    canvas_width: {
      type: ParameterType.INT,
      default: 500,
    },
    /** Height of the display in pixels */
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
    /** Background color of the display */
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
    /** Duration of ball movement animation in milliseconds. Set to 0 to disable. */
    animation_duration: {
      type: ParameterType.INT,
      default: 300,
    },
    /** Text displayed when the puzzle is solved. Set to null to disable. */
    solved_text: {
      type: ParameterType.STRING,
      default: "Solved!",
    },
    /** Label text for the goal inset. */
    goal_label: {
      type: ParameterType.STRING,
      default: "Goal",
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

const SVG_NS = "http://www.w3.org/2000/svg";

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

  private svg: SVGSVGElement;
  private state: PuzzleState;
  private selectedPeg: number | null = null;
  private moves: Move[] = [];
  private startTime: number;
  private trialParams: TrialType<Info>;
  private display_element: HTMLElement;
  private isAnimating = false;

  // Layout constants derived from trial params
  private pegSpacing: number;
  private baseY: number;
  private ballSlotHeight: number;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.display_element = display_element;
    this.trialParams = trial;
    this.moves = [];
    this.selectedPeg = null;
    this.isAnimating = false;

    const width = trial.canvas_width as number;
    const height = trial.canvas_height as number;

    // Precompute layout
    this.pegSpacing = width / 4;
    this.baseY = height - 30;
    this.ballSlotHeight = (trial.ball_radius as number) * 2 + 5;

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
    html += `<div id="jspsych-tower-of-london-svg-container"></div>`;
    html += "</div>";

    if (trial.done_button_text) {
      html += `<button id="jspsych-tower-of-london-done" class="jspsych-btn">${trial.done_button_text}</button>`;
    }

    html += "</div>";

    display_element.innerHTML = html;

    // Create SVG
    this.svg = document.createElementNS(SVG_NS, "svg");
    this.svg.setAttribute("width", String(width));
    this.svg.setAttribute("height", String(height));
    this.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    this.svg.id = "jspsych-tower-of-london-svg";
    document.getElementById("jspsych-tower-of-london-svg-container")!.appendChild(this.svg);

    // Draw initial state
    this.draw();

    // Event listeners
    this.svg.addEventListener("click", (e: MouseEvent) => {
      if (this.isAnimating) return;
      const rect = this.svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      this.handleInteraction(x);
    });

    this.svg.addEventListener("touchend", (e: TouchEvent) => {
      e.preventDefault();
      if (this.isAnimating) return;
      const rect = this.svg.getBoundingClientRect();
      const x = e.changedTouches[0].clientX - rect.left;
      this.handleInteraction(x);
    });

    if (trial.done_button_text) {
      document
        .getElementById("jspsych-tower-of-london-done")!
        .addEventListener("click", () => this.endTrial());
    }

    if (trial.time_limit) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        this.endTrial();
      }, trial.time_limit);
    }

    this.startTime = performance.now();
  }

  private draw() {
    const trial = this.trialParams;
    const width = trial.canvas_width as number;
    const height = trial.canvas_height as number;

    // Clear SVG
    this.svg.innerHTML = "";

    // Background
    const bg = document.createElementNS(SVG_NS, "rect");
    bg.setAttribute("width", String(width));
    bg.setAttribute("height", String(height));
    bg.setAttribute("fill", trial.background_color as string);
    this.svg.appendChild(bg);

    // Base
    const base = document.createElementNS(SVG_NS, "rect");
    base.setAttribute("x", "20");
    base.setAttribute("y", String(this.baseY));
    base.setAttribute("width", String(width - 40));
    base.setAttribute("height", "20");
    base.setAttribute("fill", trial.peg_color as string);
    base.setAttribute("rx", "3");
    this.svg.appendChild(base);

    // Draw pegs and balls
    for (let i = 0; i < 3; i++) {
      const pegX = this.pegSpacing * (i + 1);
      const capacity = (trial.peg_capacities as number[])[i];
      const pegHeight = 20 + capacity * this.ballSlotHeight;
      const pegWidth = 15;

      // Peg
      const peg = document.createElementNS(SVG_NS, "rect");
      peg.setAttribute("x", String(pegX - pegWidth / 2));
      peg.setAttribute("y", String(this.baseY - pegHeight));
      peg.setAttribute("width", String(pegWidth));
      peg.setAttribute("height", String(pegHeight));
      peg.setAttribute("fill", trial.peg_color as string);
      peg.setAttribute("rx", "4");
      this.svg.appendChild(peg);

      // Selection highlight
      if (this.selectedPeg === i) {
        const highlight = document.createElementNS(SVG_NS, "rect");
        highlight.setAttribute("x", String(pegX - 50));
        highlight.setAttribute("y", String(this.baseY - pegHeight - 10));
        highlight.setAttribute("width", "100");
        highlight.setAttribute("height", String(pegHeight + 5));
        highlight.setAttribute("fill", "none");
        highlight.setAttribute("stroke", "#f1c40f");
        highlight.setAttribute("stroke-width", "3");
        highlight.setAttribute("rx", "8");
        highlight.setAttribute("stroke-dasharray", "8 4");
        this.svg.appendChild(highlight);
      }

      // Balls
      const balls = this.state[i];
      for (let j = 0; j < balls.length; j++) {
        const ball = balls[j];
        const ballX = pegX;
        const ballY = this.baseY - 30 - j * this.ballSlotHeight;
        const color = (trial.ball_colors as Record<string, string>)[ball] || ball;

        this.drawBall(ballX, ballY, trial.ball_radius as number, color);
      }
    }

    // Goal inset
    if (trial.show_goal) {
      this.drawGoalInset();
    }
  }

  private drawBall(cx: number, cy: number, r: number, color: string): SVGCircleElement {
    const circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttribute("cx", String(cx));
    circle.setAttribute("cy", String(cy));
    circle.setAttribute("r", String(r));
    circle.setAttribute("fill", color);
    circle.setAttribute("stroke", "#333");
    circle.setAttribute("stroke-width", "2");
    this.svg.appendChild(circle);
    return circle;
  }

  private drawGoalInset() {
    const trial = this.trialParams;
    const goalState = trial.goal_state as PuzzleState;
    const width = trial.canvas_width as number;
    const height = trial.canvas_height as number;

    const scale = 0.3;
    const insetWidth = Math.floor(width * scale);
    const insetHeight = Math.floor(height * scale);
    const padding = 10;
    const insetX = width - insetWidth - padding;
    const insetY = padding;

    // Group for inset
    const g = document.createElementNS(SVG_NS, "g");

    // Background
    const bgRect = document.createElementNS(SVG_NS, "rect");
    bgRect.setAttribute("x", String(insetX));
    bgRect.setAttribute("y", String(insetY));
    bgRect.setAttribute("width", String(insetWidth));
    bgRect.setAttribute("height", String(insetHeight));
    bgRect.setAttribute("fill", "#ffffff");
    bgRect.setAttribute("stroke", "#999");
    bgRect.setAttribute("stroke-width", "1");
    bgRect.setAttribute("rx", "4");
    g.appendChild(bgRect);

    // "Goal" label
    const label = document.createElementNS(SVG_NS, "text");
    label.setAttribute("x", String(insetX + 8));
    label.setAttribute("y", String(insetY + 16));
    label.setAttribute("font-size", String(Math.round(insetHeight * 0.12)));
    label.setAttribute("font-family", "Arial, sans-serif");
    label.setAttribute("font-weight", "bold");
    label.setAttribute("fill", "#666");
    label.textContent = trial.goal_label as string;
    g.appendChild(label);

    // Goal pegs and balls
    const ballRadius = (trial.ball_radius as number) * scale;
    const pegWidth = 6;
    const pegSpacing = insetWidth / 4;
    const baseY = insetY + insetHeight - 10;
    const ballSlotHeight = ballRadius * 2 + 2;

    // Base
    const base = document.createElementNS(SVG_NS, "rect");
    base.setAttribute("x", String(insetX + 8));
    base.setAttribute("y", String(baseY));
    base.setAttribute("width", String(insetWidth - 16));
    base.setAttribute("height", "6");
    base.setAttribute("fill", trial.peg_color as string);
    base.setAttribute("rx", "2");
    g.appendChild(base);

    for (let i = 0; i < 3; i++) {
      const pegX = insetX + pegSpacing * (i + 1);
      const capacity = (trial.peg_capacities as number[])[i];
      const pegHeight = 10 + capacity * ballSlotHeight;

      // Peg
      const peg = document.createElementNS(SVG_NS, "rect");
      peg.setAttribute("x", String(pegX - pegWidth / 2));
      peg.setAttribute("y", String(baseY - pegHeight));
      peg.setAttribute("width", String(pegWidth));
      peg.setAttribute("height", String(pegHeight));
      peg.setAttribute("fill", trial.peg_color as string);
      peg.setAttribute("rx", "2");
      g.appendChild(peg);

      // Balls
      const balls = goalState[i];
      for (let j = 0; j < balls.length; j++) {
        const ball = balls[j];
        const ballX = pegX;
        const ballY = baseY - 10 - j * ballSlotHeight;
        const color = (trial.ball_colors as Record<string, string>)[ball] || ball;

        const circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttribute("cx", String(ballX));
        circle.setAttribute("cy", String(ballY));
        circle.setAttribute("r", String(ballRadius));
        circle.setAttribute("fill", color);
        circle.setAttribute("stroke", "#333");
        circle.setAttribute("stroke-width", "1");
        g.appendChild(circle);
      }
    }

    this.svg.appendChild(g);
  }

  private handleInteraction(x: number) {
    // Determine which peg was clicked
    let clickedPeg: number | null = null;
    for (let i = 0; i < 3; i++) {
      const pegX = this.pegSpacing * (i + 1);
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
      if (clickedPeg === this.selectedPeg) {
        // Deselect
        this.selectedPeg = null;
        this.draw();
      } else {
        // Attempt move
        const fromPeg = this.selectedPeg;
        const success = this.tryMove(fromPeg, clickedPeg);
        this.selectedPeg = null;

        if (success && (this.trialParams.animation_duration as number) > 0) {
          this.animateMove(fromPeg, clickedPeg);
        } else {
          this.draw();
          if (success) {
            this.afterMove();
          }
        }
      }
    }
  }

  private animateMove(from: number, to: number) {
    this.isAnimating = true;
    const trial = this.trialParams;
    const duration = trial.animation_duration as number;
    const ballRadius = trial.ball_radius as number;

    // The ball has already been moved in state by tryMove.
    // We need to draw the state *without* the top ball on the destination,
    // then animate it from the source to the destination.
    const ball = this.state[to][this.state[to].length - 1];
    const color = (trial.ball_colors as Record<string, string>)[ball] || ball;

    // Source position: where the ball was (top of source peg, which now has one fewer)
    const fromX = this.pegSpacing * (from + 1);
    const fromSlot = this.state[from].length; // ball was at this index before pop
    const fromY = this.baseY - 30 - fromSlot * this.ballSlotHeight;

    // Destination position
    const toX = this.pegSpacing * (to + 1);
    const toSlot = this.state[to].length - 1;
    const toY = this.baseY - 30 - toSlot * this.ballSlotHeight;

    // Lift height: above the tallest peg
    const maxCapacity = Math.max(...(trial.peg_capacities as number[]));
    const liftY = this.baseY - 20 - maxCapacity * this.ballSlotHeight - ballRadius - 10;

    // Draw state without the moving ball
    const tempState = JSON.parse(JSON.stringify(this.state));
    tempState[to].pop();
    const savedState = this.state;
    this.state = tempState;
    this.draw();
    this.state = savedState;

    // Create the animated ball
    const circle = this.drawBall(fromX, fromY, ballRadius, color);

    // Build the animation path: lift -> move horizontally -> drop
    const animX = document.createElementNS(SVG_NS, "animate");
    animX.setAttribute("attributeName", "cx");
    animX.setAttribute("values", `${fromX};${fromX};${toX};${toX}`);
    animX.setAttribute("keyTimes", "0;0.3;0.7;1");
    animX.setAttribute("dur", `${duration}ms`);
    animX.setAttribute("fill", "freeze");
    circle.appendChild(animX);

    const animY = document.createElementNS(SVG_NS, "animate");
    animY.setAttribute("attributeName", "cy");
    animY.setAttribute("values", `${fromY};${liftY};${liftY};${toY}`);
    animY.setAttribute("keyTimes", "0;0.3;0.7;1");
    animY.setAttribute("dur", `${duration}ms`);
    animY.setAttribute("fill", "freeze");
    circle.appendChild(animY);

    animX.beginElement();
    animY.beginElement();

    this.jsPsych.pluginAPI.setTimeout(() => {
      this.isAnimating = false;
      this.draw();
      this.afterMove();
    }, duration);
  }

  private afterMove() {
    // Update move counter
    const counter = document.getElementById("move-count");
    if (counter) {
      counter.textContent = this.moves.length.toString();
    }

    // Check for max moves
    if (this.trialParams.max_moves && this.moves.length >= (this.trialParams.max_moves as number)) {
      this.endTrial();
      return;
    }

    // Check for goal state (auto-complete if no done button)
    if (!this.trialParams.done_button_text && this.checkGoal()) {
      this.showSuccess();
      this.endTrial();
    }
  }

  private tryMove(from: number, to: number): boolean {
    const fromPeg = this.state[from];
    const toPeg = this.state[to];
    const capacity = (this.trialParams.peg_capacities as number[])[to];

    if (fromPeg.length === 0) return false;
    if (toPeg.length >= capacity) return false;

    const ball = fromPeg.pop()!;
    toPeg.push(ball);

    this.moves.push({
      from,
      to,
      ball,
      time: performance.now() - this.startTime,
    });

    return true;
  }

  private showSuccess() {
    const trial = this.trialParams;
    if (!trial.solved_text) return;

    const width = trial.canvas_width as number;
    const height = trial.canvas_height as number;
    const inset = 4;

    // Green border overlay
    const border = document.createElementNS(SVG_NS, "rect");
    border.setAttribute("x", String(inset));
    border.setAttribute("y", String(inset));
    border.setAttribute("width", String(width - inset * 2));
    border.setAttribute("height", String(height - inset * 2));
    border.setAttribute("fill", "none");
    border.setAttribute("stroke", "#27ae60");
    border.setAttribute("stroke-width", "6");
    border.setAttribute("rx", "8");
    border.setAttribute("opacity", "0");
    this.svg.appendChild(border);

    // Fade in
    const fadeIn = document.createElementNS(SVG_NS, "animate");
    fadeIn.setAttribute("attributeName", "opacity");
    fadeIn.setAttribute("from", "0");
    fadeIn.setAttribute("to", "1");
    fadeIn.setAttribute("dur", "300ms");
    fadeIn.setAttribute("fill", "freeze");
    border.appendChild(fadeIn);
    fadeIn.beginElement();

    // "Solved!" text
    const text = document.createElementNS(SVG_NS, "text");
    text.setAttribute("x", String(width / 2));
    text.setAttribute("y", "30");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", "24");
    text.setAttribute("font-family", "Arial, sans-serif");
    text.setAttribute("font-weight", "bold");
    text.setAttribute("fill", "#27ae60");
    text.setAttribute("opacity", "0");
    text.textContent = trial.solved_text as string;
    this.svg.appendChild(text);

    const textFade = document.createElementNS(SVG_NS, "animate");
    textFade.setAttribute("attributeName", "opacity");
    textFade.setAttribute("from", "0");
    textFade.setAttribute("to", "1");
    textFade.setAttribute("dur", "300ms");
    textFade.setAttribute("fill", "freeze");
    text.appendChild(textFade);
    textFade.beginElement();
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

    const finishTrial = () => {
      this.display_element.innerHTML = "";
      this.jsPsych.finishTrial(trial_data);
    };

    const endDelay = this.trialParams.end_delay as number;
    if (endDelay > 0) {
      this.jsPsych.pluginAPI.setTimeout(finishTrial, endDelay);
    } else {
      finishTrial();
    }
  }
}

export default TowerOfLondonPlugin;
