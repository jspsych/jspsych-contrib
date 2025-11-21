import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "bart",
  version: version,
  parameters: {
    /** The number of pumps that will cause the balloon to pop. */
    pop_threshold: {
      type: ParameterType.INT,
      default: undefined,
    },
    /** Whether to show the current balloon value during the trial. */
    show_balloon_value: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** Whether to show the total points accumulated. */
    show_total_points: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** The total points accumulated before this trial. This value is displayed but not modified by the plugin. */
    starting_total_points: {
      type: ParameterType.INT,
      default: 0,
    },
    /** The number of points earned per pump. */
    points_per_pump: {
      type: ParameterType.INT,
      default: 1,
    },
    /** Text label for the pump button. */
    pump_button_label: {
      type: ParameterType.STRING,
      default: "Pump",
    },
    /** Text label for the collect button. */
    collect_button_label: {
      type: ParameterType.STRING,
      default: "Collect",
    },
    /** Starting size of the balloon (SVG scale factor). */
    balloon_starting_size: {
      type: ParameterType.FLOAT,
      default: 0.5,
    },
    /** Size increment per pump (SVG scale factor). */
    balloon_size_increment: {
      type: ParameterType.FLOAT,
      default: 0.05,
    },
    /** Duration of pump animation in milliseconds. */
    pump_animation_duration: {
      type: ParameterType.INT,
      default: 200,
    },
    /** Duration of pop animation in milliseconds. */
    pop_animation_duration: {
      type: ParameterType.INT,
      default: 300,
    },
    /** Base color of the balloon (CSS color). */
    balloon_color: {
      type: ParameterType.STRING,
      default: "#ff0000",
    },
  },
  data: {
    /** Number of times the balloon was pumped. */
    pumps: {
      type: ParameterType.INT,
    },
    /** Whether the balloon popped (true) or was collected (false). */
    popped: {
      type: ParameterType.BOOL,
    },
    /** Points earned on this trial. */
    points_earned: {
      type: ParameterType.INT,
    },
    /** Total points after this trial. */
    total_points: {
      type: ParameterType.INT,
    },
    /** Array of reaction times for each pump in milliseconds. */
    pump_times: {
      type: ParameterType.COMPLEX,
    },
    /** Reaction time for the collect action in milliseconds, or null if balloon popped. */
    collect_time: {
      type: ParameterType.INT,
    },
  },
  // When you run build on your plugin, citations will be generated here based on the information in the CITATION.cff file.
  citations: "__CITATIONS__",
};

type Info = typeof info;

/**
 * **bart**
 *
 * The Balloon Analogue Risk Task (BART). Displays an animated SVG balloon that grows with each pump.
 * The participant can choose to pump the balloon to earn points or collect their current winnings.
 * If the balloon is pumped beyond the pop threshold, it pops and all points for that trial are lost.
 *
 * @author Josh de Leeuw
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-bart/README.md}}
 */
class BartPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    let pumps = 0;
    let balloon_value = 0;
    let is_animating = false;
    let trial_start_time = performance.now();
    const pump_times: number[] = [];

    // Create HTML structure
    const html = `
      <div id="jspsych-bart-container" style="text-align: center; padding: 20px;">
        <div id="jspsych-bart-balloon-container" style="margin: 30px auto; height: 400px; display: flex; align-items: center; justify-content: center;">
          <svg id="jspsych-bart-balloon-svg" width="300" height="400" viewBox="0 0 300 400">
            <defs>
              <radialGradient id="balloonGradient" cx="40%" cy="40%">
                <stop offset="0%" style="stop-color: ${trial.balloon_color}; stop-opacity: 0.8" />
                <stop offset="70%" style="stop-color: ${trial.balloon_color}; stop-opacity: 1" />
                <stop offset="100%" style="stop-color: #8b0000; stop-opacity: 1" />
              </radialGradient>
            </defs>
            <g id="jspsych-bart-balloon-group" transform="translate(150, 200) scale(${
              trial.balloon_starting_size
            })">
              <ellipse id="jspsych-bart-balloon" cx="0" cy="0" rx="80" ry="100" fill="url(#balloonGradient)" stroke="#8b0000" stroke-width="2"/>
              <path id="jspsych-bart-balloon-tie" d="M -5 95 Q 0 105, 5 95" fill="none" stroke="#8b0000" stroke-width="2"/>
              <line id="jspsych-bart-balloon-string" x1="0" y1="105" x2="0" y2="150" stroke="#666" stroke-width="1"/>
            </g>
          </svg>
        </div>
        <div id="jspsych-bart-info-container" style="display: flex; justify-content: center; gap: 20px; margin-bottom: 20px;">
          ${
            trial.show_balloon_value
              ? `<div id="jspsych-bart-balloon-value" style="border: 2px solid #333; border-radius: 8px; padding: 12px 24px; background-color: #f0f0f0; min-width: 180px;">
              <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Balloon Value</div>
              <div style="font-size: 24px; font-weight: bold; color: #333;"><span id="jspsych-bart-balloon-value-number">0</span> points</div>
            </div>`
              : ""
          }
          ${
            trial.show_total_points
              ? `<div id="jspsych-bart-total-points" style="border: 2px solid #333; border-radius: 8px; padding: 12px 24px; background-color: #f0f0f0; min-width: 180px;">
              <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Total Points</div>
              <div style="font-size: 24px; font-weight: bold; color: #333;"><span id="jspsych-bart-total-points-value">${trial.starting_total_points}</span></div>
            </div>`
              : ""
          }
        </div>
        <div id="jspsych-bart-button-container" style="margin-top: 10px;">
          <button id="jspsych-bart-pump-button" class="jspsych-btn" style="font-size: 18px; padding: 15px 30px; margin: 0 10px;">${
            trial.pump_button_label
          }</button>
          <button id="jspsych-bart-collect-button" class="jspsych-btn" style="font-size: 18px; padding: 15px 30px; margin: 0 10px;">${
            trial.collect_button_label
          }</button>
        </div>
      </div>
    `;

    display_element.innerHTML = html;

    const balloon_group = display_element.querySelector(
      "#jspsych-bart-balloon-group"
    ) as SVGGElement;
    const pump_button = display_element.querySelector(
      "#jspsych-bart-pump-button"
    ) as HTMLButtonElement;
    const collect_button = display_element.querySelector(
      "#jspsych-bart-collect-button"
    ) as HTMLButtonElement;

    // Update balloon value display
    const update_balloon_value = () => {
      if (trial.show_balloon_value) {
        const value_element = display_element.querySelector(
          "#jspsych-bart-balloon-value-number"
        ) as HTMLElement;
        value_element.textContent = balloon_value.toString();
      }
    };

    // Update total points display
    const update_total_points = (total: number) => {
      if (trial.show_total_points) {
        const total_element = display_element.querySelector(
          "#jspsych-bart-total-points-value"
        ) as HTMLElement;
        total_element.textContent = total.toString();
      }
    };

    // Animate balloon pump
    const animate_pump = (callback: () => void) => {
      const current_scale = trial.balloon_starting_size + pumps * trial.balloon_size_increment;
      const new_scale = current_scale + trial.balloon_size_increment;

      balloon_group.style.transition = `transform ${trial.pump_animation_duration}ms ease-out`;
      balloon_group.style.transform = `translate(150px, 200px) scale(${new_scale})`;

      this.jsPsych.pluginAPI.setTimeout(() => {
        balloon_group.style.transition = "";
        callback();
      }, trial.pump_animation_duration);
    };

    // Animate balloon pop
    const animate_pop = (callback: () => void) => {
      // Create pop effect with multiple fragments
      const svg = display_element.querySelector("#jspsych-bart-balloon-svg") as SVGSVGElement;
      const num_fragments = 12;
      const num_particles = 20;

      // Get current balloon scale for realistic fragment sizing
      const current_scale = trial.balloon_starting_size + pumps * trial.balloon_size_increment;

      // Create balloon fragments (larger pieces)
      for (let i = 0; i < num_fragments; i++) {
        const angle = (i * 360) / num_fragments;
        const rad = (angle * Math.PI) / 180;
        const fragment_size = 25 * current_scale;

        // Create irregular fragment shape
        const fragment = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const x1 = 150 + fragment_size * Math.cos(rad);
        const y1 = 200 + fragment_size * Math.sin(rad);
        const x2 = 150 + fragment_size * 0.7 * Math.cos(rad + 0.4);
        const y2 = 200 + fragment_size * 0.7 * Math.sin(rad + 0.4);
        const x3 = 150 + fragment_size * 0.9 * Math.cos(rad - 0.3);
        const y3 = 200 + fragment_size * 0.9 * Math.sin(rad - 0.3);

        fragment.setAttribute("d", `M 150 200 L ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} Z`);
        fragment.setAttribute("fill", trial.balloon_color);
        fragment.setAttribute("opacity", "0.9");
        fragment.setAttribute("stroke", "#8b0000");
        fragment.setAttribute("stroke-width", "1");

        svg.appendChild(fragment);

        // Animate fragment - flying outward with rotation
        const distance = 120 + Math.random() * 40;
        const tx = distance * Math.cos(rad) + (Math.random() - 0.5) * 30;
        const ty = distance * Math.sin(rad) + (Math.random() - 0.5) * 30 + 20; // slight downward bias
        const rotation = (Math.random() - 0.5) * 720; // random spin

        fragment.style.transition = `transform ${trial.pop_animation_duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${trial.pop_animation_duration}ms ease-out`;
        setTimeout(() => {
          fragment.style.transform = `translate(${tx}px, ${ty}px) rotate(${rotation}deg)`;
          fragment.style.opacity = "0";
        }, 10);
      }

      // Create small particles for confetti effect
      for (let i = 0; i < num_particles; i++) {
        const angle = Math.random() * 360;
        const rad = (angle * Math.PI) / 180;
        const particle_size = 3 + Math.random() * 4;

        const particle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        particle.setAttribute("cx", "150");
        particle.setAttribute("cy", "200");
        particle.setAttribute("r", particle_size.toString());
        particle.setAttribute(
          "fill",
          i % 3 === 0 ? "#fff" : i % 3 === 1 ? trial.balloon_color : "#ff6666"
        );
        particle.setAttribute("opacity", "1");

        svg.appendChild(particle);

        // Animate particles - faster, more chaotic
        const distance = 60 + Math.random() * 80;
        const tx = distance * Math.cos(rad);
        const ty = distance * Math.sin(rad) + Math.random() * 30; // downward drift
        const duration = trial.pop_animation_duration * (0.7 + Math.random() * 0.5);

        particle.style.transition = `transform ${duration}ms cubic-bezier(0.33, 1, 0.68, 1), opacity ${duration}ms ease-out`;
        setTimeout(() => {
          particle.style.transform = `translate(${tx}px, ${ty}px)`;
          particle.style.opacity = "0";
        }, 10);
      }

      // Add a flash effect
      const flash = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      flash.setAttribute("cx", "150");
      flash.setAttribute("cy", "200");
      flash.setAttribute("r", "0");
      flash.setAttribute("fill", "#ffffff");
      flash.setAttribute("opacity", "0.8");
      svg.appendChild(flash);

      flash.style.transition = `r 100ms ease-out, opacity 100ms ease-out`;
      setTimeout(() => {
        flash.setAttribute("r", (80 * current_scale).toString());
        flash.setAttribute("opacity", "0");
      }, 10);

      // Hide original balloon with a quick shrink
      balloon_group.style.transition = `opacity 50ms ease-out, transform 50ms ease-out`;
      balloon_group.style.opacity = "0";
      balloon_group.style.transform = `translate(150px, 200px) scale(${current_scale * 1.1})`;

      this.jsPsych.pluginAPI.setTimeout(() => {
        callback();
      }, trial.pop_animation_duration);
    };

    // Handle pump button click
    const handle_pump = () => {
      if (is_animating) return;

      is_animating = true;
      pump_button.disabled = true;
      collect_button.disabled = true;

      const pump_time = Math.round(performance.now() - trial_start_time);
      pump_times.push(pump_time);

      pumps++;
      balloon_value += trial.points_per_pump;
      update_balloon_value();

      if (pumps >= trial.pop_threshold) {
        // Balloon pops!
        animate_pop(() => {
          end_trial(true);
        });
      } else {
        // Continue pumping
        animate_pump(() => {
          is_animating = false;
          pump_button.disabled = false;
          collect_button.disabled = false;
        });
      }
    };

    // Handle collect button click
    const handle_collect = () => {
      if (is_animating) return;

      const collect_time = Math.round(performance.now() - trial_start_time);
      end_trial(false, collect_time);
    };

    // End trial
    const end_trial = (popped: boolean, collect_time: number | null = null) => {
      const points_earned = popped ? 0 : balloon_value;
      const total_points = trial.starting_total_points + points_earned;

      if (!popped) {
        update_total_points(total_points);
      }

      const trial_data = {
        pumps: pumps,
        popped: popped,
        points_earned: points_earned,
        total_points: total_points,
        pump_times: pump_times,
        collect_time: collect_time,
      };

      // Small delay to show final state
      this.jsPsych.pluginAPI.setTimeout(() => {
        this.jsPsych.finishTrial(trial_data);
      }, 500);
    };

    // Add event listeners
    pump_button.addEventListener("click", handle_pump);
    collect_button.addEventListener("click", handle_collect);
  }
}

export default BartPlugin;
