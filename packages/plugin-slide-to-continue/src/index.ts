import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "slide-to-continue",
  version: version,
  parameters: {
    /**
     * The color of the slider track and handle.
     */
    color: {
      type: ParameterType.STRING,
      pretty_name: "Color",
      default: "purple",
    },
    /**
     * The direction of sliding (left-to-right or right-to-left).
     */
    direction: {
      type: ParameterType.SELECT,
      pretty_name: "Direction",
      options: ["left-to-right", "right-to-left"],
      default: "left-to-right",
    },
    /**
     * The shape of the sliding object.
     */
    object_sliding: {
      type: ParameterType.SELECT,
      pretty_name: "Object sliding",
      options: ["round", "square"],
      default: "round",
    },
    /**
     * The length of the slider in pixels.
     */
    length: {
      type: ParameterType.INT,
      pretty_name: "Length",
      default: 300,
    },
    /**
     * The orientation of the slider.
     */
    orientation: {
      type: ParameterType.SELECT,
      pretty_name: "Orientation",
      options: ["horizontal", "vertical"],
      default: "horizontal",
    },
    /**
     * The width/height of the slider track in pixels.
     */
    width: {
      type: ParameterType.INT,
      pretty_name: "Width",
      default: 60,
    },
    /**
    /**
     * Any content here will be displayed above the slider.
     */
    prompt: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Prompt",
      default: null,
    },
    /**
     * Text displayed on the slider.
     */
    slider_text: {
      type: ParameterType.STRING,
      pretty_name: "Slider text",
      default: "Slide to continue",
    },
    /**
     * The font size of the slider text in pixels.
     */
    text_size: {
      type: ParameterType.INT,
      pretty_name: "Text size",
      default: 16,
    },
    /**
     * How long to show trial before it ends.
     */
    duration: {
      type: ParameterType.INT,
      pretty_name: "Trial duration",
      default: null,
    },
  },
  data: {
    /** The response time in milliseconds for the participant to complete the slide. */
    rt: {
      type: ParameterType.INT,
    },
    /** Whether the slider was completed. */
    response: {
      type: ParameterType.BOOL,
    },
    /** The final position of the slider (0-100). */
    final_position: {
      type: ParameterType.INT,
    },
  },
};

type Info = typeof info;

/**
 * **slider-response**
 *
 * jsPsych plugin for displaying a slider that must be dragged to continue, similar to iPhone call pickup.
 *
 */
class SliderResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;

  private startTime: number;
  private isDragging: boolean = false;
  private sliderHandle: HTMLElement;
  private sliderTrack: HTMLElement;
  private currentPosition: number = 0;
  private completed: boolean = false;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // Record start time
    this.startTime = performance.now();

    // Create HTML structure
    let html =
      '<div id="jspsych-slider-response-wrapper" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">';

    // Add prompt if provided
    if (trial.prompt !== null) {
      html += `<div id="jspsych-slider-response-prompt" style="margin-bottom: 30px;">${trial.prompt}</div>`;
    }

    // Create slider container
    const isHorizontal = trial.orientation === "horizontal";
    const containerStyle = `
      position: relative;
      ${isHorizontal ? "width" : "height"}: ${trial.length}px;
      ${isHorizontal ? "height" : "width"}: ${trial.width}px;
    `;

    html += `<div id="jspsych-slider-response-container" style="${containerStyle}">`;

    // Create slider track
    const trackStyle = `
      position: absolute;
      ${isHorizontal ? "width" : "height"}: 100%;
      ${isHorizontal ? "height" : "width"}: 100%;
      background-color: ${this.hexToRgba(trial.color, 0.3)};
      border-radius: ${trial.width / 2}px;
      overflow: hidden;
    `;

    html += `<div id="jspsych-slider-response-track" style="${trackStyle}">`;

    // Add slider text with multi-line support
    const textLines = trial.slider_text.split(",").map((line) => line.trim());
    const textStyle = `
      position: absolute;
      ${isHorizontal ? "left" : "top"}: 50%;
      ${isHorizontal ? "top" : "left"}: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-weight: bold;
      user-select: none;
      pointer-events: none;
      z-index: 1;
      text-align: center;
      line-height: 1.2;
      max-width: 90%;
      overflow: hidden;
    `;

    const textContent = textLines.map((line) => `<div>${line}</div>`).join("");
    html += `<div id="jspsych-slider-response-text" style="${textStyle}; font-size: ${trial.text_size}px;">${textContent}</div>`;

    // Create progress fill
    // Create progress fill
    const fillStyle = `
      position: absolute;
      ${isHorizontal ? "top" : "left"}: 0;
      ${isHorizontal ? "height" : "width"}: 100%;
      background-color: ${this.hexToRgba(trial.color, 0.6)};
      ${
        trial.direction === "left-to-right"
          ? `${isHorizontal ? "left" : "top"}: 0; ${isHorizontal ? "width" : "height"}: 0;`
          : `${isHorizontal ? "right" : "bottom"}: 0; ${isHorizontal ? "width" : "height"}: 0;`
      }
      transition: none;
    `;

    html += `<div id="jspsych-slider-response-fill" style="${fillStyle}"></div>`;

    // Create slider handle
    const handleSize = trial.width - 8;
    const initialPos = trial.direction === "left-to-right" ? 4 : trial.length - handleSize - 4;
    const handleStyle = `
      position: absolute;
      ${isHorizontal ? "left" : "top"}: ${initialPos}px;
      ${isHorizontal ? "top" : "left"}: 4px;
      width: ${handleSize}px;
      height: ${handleSize}px;
      background-color: ${trial.color};
      border-radius: ${trial.object_sliding === "round" ? "50%" : "4px"};
      cursor: grab;
      z-index: 2;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      tranistion: none;
    `;

    html += `<div id="jspsych-slider-response-handle" style="${handleStyle}"></div>`;

    html += "</div></div></div>"; // Close track, container, and wrapper

    // Display HTML
    display_element.innerHTML = html;

    // Get elements
    this.sliderHandle = display_element.querySelector("#jspsych-slider-response-handle");
    this.sliderTrack = display_element.querySelector("#jspsych-slider-response-track");
    const sliderFill = display_element.querySelector<HTMLElement>("#jspsych-slider-response-fill");
    const sliderText = display_element.querySelector<HTMLElement>("#jspsych-slider-response-text");

    // Set up event handlers
    const handleStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!this.completed) {
        this.isDragging = true;
        this.sliderHandle.style.cursor = "grabbing";
      }
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!this.isDragging || this.completed) return;
      this.sliderHandle.style.transition = "none";
      sliderFill.style.transition = "none";

      const rect = this.sliderTrack.getBoundingClientRect();
      let pos: number;

      if (e instanceof MouseEvent) {
        pos = isHorizontal ? e.clientX - rect.left : e.clientY - rect.top;
      } else {
        pos = isHorizontal ? e.touches[0].clientX - rect.left : e.touches[0].clientY - rect.top;
      }

      // Calculate position based on direction
      const maxPos = (isHorizontal ? rect.width : rect.height) - handleSize - 8;

      if (trial.direction === "left-to-right") {
        pos = Math.max(4, Math.min(pos - handleSize / 2, maxPos));
        this.currentPosition = ((pos - 4) / (maxPos - 4)) * 100;
      } else {
        pos = Math.max(4, Math.min(pos - handleSize / 2, maxPos));
        this.currentPosition = 100 - ((pos - 4) / (maxPos - 4)) * 100;
      }

      // Update handle position
      if (isHorizontal) {
        this.sliderHandle.style.left = `${pos}px`;
      } else {
        this.sliderHandle.style.top = `${pos}px`;
      }

      // Update fill to follow the handle
      if (trial.direction === "left-to-right") {
        if (isHorizontal) {
          sliderFill.style.width = `${pos + handleSize / 2}px`;
        } else {
          sliderFill.style.height = `${pos + handleSize / 2}px`;
        }
      } else {
        if (isHorizontal) {
          sliderFill.style.left = `${pos + handleSize / 2}px`;
          sliderFill.style.width = `${trial.length - pos - handleSize / 2}px`;
        } else {
          sliderFill.style.top = `${pos + handleSize / 2}px`;
          sliderFill.style.height = `${trial.length - pos - handleSize / 2}px`;
        }
      }

      // Fade text based on progress
      sliderText.style.opacity = `${1 - this.currentPosition / 100}`;

      // Note: Completion check moved to handleEnd - only triggers when user releases
    };

    const handleEnd = () => {
      if (!this.completed && this.isDragging) {
        this.isDragging = false;
        this.sliderHandle.style.cursor = "grab";

        // Check if completed on release
        if (this.currentPosition >= 95) {
          this.completed = true;
          this.animateToCompletion(trial, isHorizontal, sliderFill, sliderText);
        } else {
          // Enable transition for smooth snap-back
          this.sliderHandle.style.transition = "all 0.2s ease-out";
          sliderFill.style.transition = "all 0.2s ease-out";
          // Snap back if not completed
          const initialPos = trial.direction === "left-to-right" ? 4 : maxPos;
          if (isHorizontal) {
            this.sliderHandle.style.left = `${initialPos}px`;
            sliderFill.style.width = "0px";
            if (trial.direction === "right-to-left") {
              sliderFill.style.left = "";
              sliderFill.style.right = "0";
            }
          } else {
            this.sliderHandle.style.top = `${initialPos}px`;
            sliderFill.style.height = "0px";
            if (trial.direction === "right-to-left") {
              sliderFill.style.top = "";
              sliderFill.style.bottom = "0";
            }
          }
          sliderText.style.opacity = "1";
          this.currentPosition = 0;
        }
      }
    };

    // Calculate max position for snap back
    const rect = this.sliderTrack.getBoundingClientRect();
    const maxPos = (isHorizontal ? rect.width : rect.height) - handleSize - 8;

    // Add event listeners
    this.sliderHandle.addEventListener("mousedown", handleStart);
    this.sliderHandle.addEventListener("touchstart", handleStart);
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("touchmove", handleMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchend", handleEnd);

    // End trial if duration is set
    if (trial.duration !== null && typeof trial.duration === "number") {
      this.jsPsych.pluginAPI.setTimeout(() => {
        this.endTrial();
      }, trial.duration);
    }
  }

  private hexToRgba(color: string, alpha: number): string {
    // Check if it's already a hex color
    if (color.startsWith("#")) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
      if (result) {
        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
    }

    // For named colors, use CSS color values directly and convert to rgba
    // Create a temporary element to get computed color
    const tempElement = document.createElement("div");
    tempElement.style.color = color;
    document.body.appendChild(tempElement);

    const computedColor = window.getComputedStyle(tempElement).color;
    document.body.removeChild(tempElement);

    // Extract RGB values from computed color
    const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Default fallback to purple
    return `rgba(128, 0, 128, ${alpha})`;
  }

  private animateToCompletion(
    trial: TrialType<Info>,
    isHorizontal: boolean,
    sliderFill: HTMLElement,
    sliderText: HTMLElement
  ) {
    // Add smooth transition for completion
    this.sliderHandle.style.transition = "all 0.3s ease-out";
    sliderFill.style.transition = "all 0.3s ease-out";

    // Animate slider to 100% completion
    const handleSize = trial.width - 8;
    const maxPos = (isHorizontal ? trial.length : trial.length) - handleSize - 8;
    const completionPos = trial.direction === "left-to-right" ? maxPos : 4;

    // Set completion animation
    if (isHorizontal) {
      this.sliderHandle.style.left = `${completionPos}px`;
      if (trial.direction === "left-to-right") {
        sliderFill.style.width = `${trial.length - 4}px`;
      } else {
        sliderFill.style.left = "4px";
        sliderFill.style.right = "auto";
        sliderFill.style.width = `${trial.length - 8}px`;
      }
    } else {
      this.sliderHandle.style.top = `${completionPos}px`;
      if (trial.direction === "left-to-right") {
        sliderFill.style.height = `${trial.length - 4}px`;
      } else {
        sliderFill.style.top = "4px";
        sliderFill.style.bottom = "auto";
        sliderFill.style.height = `${trial.length - 8}px`;
      }
    }

    // Fade out text completely
    sliderText.style.opacity = "0";

    // Update position to 100%
    this.currentPosition = 100;

    // Wait for animation to complete, then end trial
    setTimeout(() => {
      this.endTrial();
    }, 200);
  }

  private endTrial() {
    // Calculate RT
    const rt = Math.round(performance.now() - this.startTime);

    // Gather trial data
    const trial_data = {
      rt: rt,
      response: this.completed,
      final_position: Math.round(this.currentPosition),
    };

    // Clear display
    const display_element = this.jsPsych.getDisplayElement();
    display_element.innerHTML = "";

    // Finish trial
    this.jsPsych.finishTrial(trial_data);
  }

  simulate(
    trial: TrialType<Info>,
    simulation_mode,
    simulation_options: any,
    load_callback: () => void
  ) {
    if (simulation_mode == "data-only") {
      load_callback();
      this.simulate_data_only(trial, simulation_options);
    }
    if (simulation_mode == "visual") {
      this.simulate_visual(trial, simulation_options, load_callback);
    }
  }

  private create_simulation_data(trial: TrialType<Info>, simulation_options) {
    const default_data = {
      rt: this.jsPsych.randomization.sampleExGaussian(2000, 400, 1 / 150, true),
      response: true,
      final_position: 100,
    };

    const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);

    this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);

    return data;
  }

  private simulate_data_only(trial: TrialType<Info>, simulation_options) {
    const data = this.create_simulation_data(trial, simulation_options);

    this.jsPsych.finishTrial(data);
  }

  private simulate_visual(trial: TrialType<Info>, simulation_options, load_callback: () => void) {
    const data = this.create_simulation_data(trial, simulation_options);

    const display_element = this.jsPsych.getDisplayElement();

    this.trial(display_element, trial);
    load_callback();

    // Simulate sliding motion
    if (data.response) {
      const duration = data.rt;
      const steps = 50;
      const stepDuration = duration / steps;

      let step = 0;
      const simulateSlide = () => {
        if (step < steps) {
          const progress = (step / steps) * 100;
          // Simulate mouse move at this position
          const rect = this.sliderTrack.getBoundingClientRect();
          const isHorizontal = trial.orientation === "horizontal";

          let pos;
          if (trial.direction === "left-to-right") {
            pos = rect.left + (rect.width * progress) / 100;
          } else {
            pos = rect.right - (rect.width * progress) / 100;
          }

          const event = new MouseEvent("mousemove", {
            clientX: isHorizontal ? pos : rect.left + rect.width / 2,
            clientY: isHorizontal ? rect.top + rect.height / 2 : pos,
          });

          this.isDragging = true;
          document.dispatchEvent(event);

          step++;
          setTimeout(simulateSlide, stepDuration);
        }
      };

      // Start dragging
      setTimeout(() => {
        const event = new MouseEvent("mousedown", {});
        this.sliderHandle.dispatchEvent(event);
        simulateSlide();
      }, 100);
    }
  }
}

export default SliderResponsePlugin;
