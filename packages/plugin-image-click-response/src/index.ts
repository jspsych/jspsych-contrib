import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "image-click-response",
  version: version,
  parameters: {
    /** Text that will appear above the image */
    preamble: {
      type: ParameterType.HTML_STRING, // BOOL, STRING, INT, FLOAT, FUNCTION, KEY, KEYS, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
      default: "<p>Click the image to add a point. Click a point to remove</p>",
      pretty_name: "Preamble",
    },
    /** The image that needs to be displayed */
    stimulus: {
      type: ParameterType.IMAGE,
      default: undefined,
      pretty_name: "Stimulus",
    },
    /** Radius of the dot on the image */
    dot_radius: {
      type: ParameterType.INT,
      default: 5,
      pretty_name: "Dot radius'",
    },
    /** Color of the dot on the image */
    dot_color: {
      type: ParameterType.STRING,
      default: "lightblue",
      pretty_name: "Dot color",
    },
    /** Text for the continue button */
    button_label: {
      type: ParameterType.STRING,
      default: "Continue",
      pretty_name: "Button label",
    },
    /** How many dots are required before the trial can be completed */
    minimum_dots_required: {
      type: ParameterType.INT,
      default: 0,
      pretty_name: "Minimum number of dots",
    },
  },
  data: {
    /** Image that was presented */
    stimulus: {
      type: ParameterType.IMAGE,
    },
    /** Time to complete the trial */
    rt: {
      type: ParameterType.INT,
    },
    /** Array of (x,y) values for each point in the image */
    points: {
      type: ParameterType.COMPLEX,
    },
  },
};

type Info = typeof info;

/**
 * **image-click-response**
 *
 * This plugin shows an image on which the user can place points by clicking/touching the image. The location of each point is recorded as data.
 *
 * @author Christophe Bossens
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-image-click-response/README.md}}
 */
class ImageClickResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // Callback functions
    function svgImageClicked(e) {
      if (e.target.tagName === "circle") return;

      // Get click coordinates
      let cx = e.offsetX;
      let cy = e.offsetY;

      // Create a circle
      let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("data-rt", (performance.now() - start_time).toString());

      // Style the circle
      circle.setAttribute("cx", cx);
      circle.setAttribute("cy", cy);
      circle.setAttribute("r", trial.dot_radius.toString());
      circle.setAttribute("fill", trial.dot_color);
      circle.setAttribute("stroke", trial.dot_color);
      circle.style.cursor = "pointer";
      circle.style.transition = "0.1s ease-in";

      // Add event listeners
      circle.addEventListener("mouseenter", (e) => {
        const target = e.target as HTMLElement;
        target.setAttribute("r", (trial.dot_radius + 1).toString());
      });

      circle.addEventListener("mouseup", (e) => {
        const target = e.target as HTMLElement;
        svg_container.removeChild(target);

        button.disabled =
          svg_container.querySelectorAll("circle").length < trial.minimum_dots_required;
      });
      circle.addEventListener("mouseleave", (e) => {
        const target = e.target as HTMLElement;
        target.setAttribute("r", trial.dot_radius.toString());
      });

      // Add circle
      svg_container.appendChild(circle);

      // Check mininum dot number requirement
      button.disabled =
        svg_container.querySelectorAll("circle").length < trial.minimum_dots_required;
    }

    // Create layout
    let html = "";
    let preamble_html = `<div id="image-click-preamble" class="jspsych-display-element">${trial.preamble}</div>`;
    let button_html = `<div><button id='image-click-response-button' class='jspsych-btn'>${trial.button_label}</button></div>`;
    let svg_html = `<div><svg id='image-click-response-svg' xmlns='http://www.w3.org/2000/svg'><image id='image-click-response-image' href='${trial.stimulus}' xlink:href='${trial.stimulus}' crossorigin="anonymous"></image></svg></div>`;
    display_element.innerHTML = preamble_html + svg_html + button_html;

    let svg_container = document.getElementById("image-click-response-svg") as HTMLElement;
    let button = document.getElementById("image-click-response-button") as HTMLButtonElement;

    // Style svg container
    svg_container.addEventListener("click", svgImageClicked);

    if (trial.minimum_dots_required > 0) {
      button.disabled = true;
    }

    // Load the image to set the svg container dimensions
    let image = new Image();
    image.onload = function () {
      svg_container.style.width = image.naturalWidth.toString() + "px";
      svg_container.style.height = image.naturalHeight.toString() + "px";
    };
    image.src = trial.stimulus;

    // data saving
    var trial_data = {
      stimulus: trial.stimulus,
      rt: undefined,
      points: [],
    };

    function collect_responses() {
      // measure rt
      let end_time = performance.now();
      trial_data.rt = Math.round(end_time - start_time);

      // get indicated points
      let points = svg_container.querySelectorAll("circle");
      let svgBoundingBox = svg_container.getBoundingClientRect();
      for (let point of points)
        trial_data.points.push({
          x: point.getBoundingClientRect().left - svgBoundingBox.left,
          y: point.getBoundingClientRect().top - svgBoundingBox.top,
          rt: parseFloat(point.getAttribute("data-rt")),
        });

      end_trial();
    }

    const end_trial = () => {
      this.jsPsych.finishTrial(trial_data);
    };

    display_element.querySelector("button").addEventListener("click", () => collect_responses());

    let start_time = performance.now();
  }
}

export default ImageClickResponsePlugin;
