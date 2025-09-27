import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "image-hotspots",
  version: version,
  parameters: {
    /** The image to display. Can be a path to an image file or a data URL. */
    stimulus: {
      type: ParameterType.IMAGE,
      default: undefined,
    },
    /** Array of hotspot regions with their coordinates and properties. Each hotspot should have x, y, width, height, and id properties. */
    hotspots: {
      type: ParameterType.COMPLEX,
      default: [],
    },
    /** How long to show the trial in milliseconds. If null, the trial will wait for a response. */
    trial_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** CSS string to style the hotspot highlight overlay. */
    hotspot_highlight_css: {
      type: ParameterType.STRING,
      default: "background-color: rgba(255, 255, 0, 0.3); border: 2px solid yellow;",
    },
  },
  data: {
    /** The ID of the clicked hotspot region. */
    hotspot_clicked: {
      type: ParameterType.STRING,
    },
    /** The response time in milliseconds. */
    rt: {
      type: ParameterType.INT,
    },
    /** The x coordinate of the click relative to the image. */
    click_x: {
      type: ParameterType.FLOAT,
    },
    /** The y coordinate of the click relative to the image. */
    click_y: {
      type: ParameterType.FLOAT,
    },
  },
  // When you run build on your plugin, citations will be generated here based on the information in the CITATION.cff file.
  citations: "__CITATIONS__",
};

type Info = typeof info;

/**
 * **plugin-image-hotspots**
 *
 * A plugin for displaying an image with clickable regions
 *
 * @author Claude
 * @see {@link /plugin-image-hotspots/README.md}}
 */
class ImageHotspotsPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    const start_time = performance.now();

    // Create the HTML structure
    const html = `
      <div id="jspsych-image-hotspots-container" style="position: relative; display: inline-block;">
        <img id="jspsych-image-hotspots-stimulus" src="${trial.stimulus}">
        <div id="jspsych-image-hotspots-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>
      </div>
    `;

    display_element.innerHTML = html;

    const img = display_element.querySelector(
      "#jspsych-image-hotspots-stimulus"
    ) as HTMLImageElement;
    const overlay = display_element.querySelector("#jspsych-image-hotspots-overlay") as HTMLElement;

    let trial_data = {
      hotspot_clicked: null as string | null,
      rt: null as number | null,
      click_x: null as number | null,
      click_y: null as number | null,
    };

    // Function to create hotspot elements
    const createHotspots = () => {
      const imgRect = img.getBoundingClientRect();
      const containerRect = img.parentElement!.getBoundingClientRect();

      trial.hotspots.forEach((hotspot: any) => {
        const hotspotElement = document.createElement("div");
        hotspotElement.className = "jspsych-image-hotspots-hotspot";
        hotspotElement.setAttribute("data-hotspot-id", hotspot.id);
        hotspotElement.style.cssText = `
          position: absolute;
          left: ${hotspot.x}px;
          top: ${hotspot.y}px;
          width: ${hotspot.width}px;
          height: ${hotspot.height}px;
          cursor: pointer;
          background-color: transparent;
          z-index: 10;
        `;

        // Mouse events
        hotspotElement.addEventListener("mousedown", () => {
          const highlight = document.createElement("div");
          highlight.className = "jspsych-image-hotspots-highlight";
          highlight.style.cssText = `
            position: absolute;
            left: ${hotspot.x}px;
            top: ${hotspot.y}px;
            width: ${hotspot.width}px;
            height: ${hotspot.height}px;
            pointer-events: none;
            z-index: 5;
            box-sizing: border-box;
            ${trial.hotspot_highlight_css}
          `;
          overlay.appendChild(highlight);

          const removeHighlight = () => {
            if (highlight.parentNode) {
              highlight.parentNode.removeChild(highlight);
            }
          };

          document.addEventListener("mouseup", removeHighlight, { once: true });
        });

        hotspotElement.addEventListener("click", (e) => {
          console.log("Hotspot clicked:", hotspot.id);
          const rect = img.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const clickY = e.clientY - rect.top;

          trial_data.hotspot_clicked = hotspot.id;
          trial_data.rt = Math.round(performance.now() - start_time);
          trial_data.click_x = Math.round(clickX);
          trial_data.click_y = Math.round(clickY);

          end_trial();
        });

        // Touch events
        hotspotElement.addEventListener("touchstart", (e) => {
          e.preventDefault();
          const highlight = document.createElement("div");
          highlight.className = "jspsych-image-hotspots-highlight";
          highlight.style.cssText = `
            position: absolute;
            left: ${hotspot.x}px;
            top: ${hotspot.y}px;
            width: ${hotspot.width}px;
            height: ${hotspot.height}px;
            pointer-events: none;
            z-index: 5;
            box-sizing: border-box;
            ${trial.hotspot_highlight_css}
          `;
          overlay.appendChild(highlight);

          const removeHighlight = () => {
            if (highlight.parentNode) {
              highlight.parentNode.removeChild(highlight);
            }
          };

          document.addEventListener("touchend", removeHighlight, { once: true });
        });

        hotspotElement.addEventListener("touchend", (e) => {
          e.preventDefault();
          const touch = e.changedTouches[0];
          const rect = img.getBoundingClientRect();
          const touchX = touch.clientX - rect.left;
          const touchY = touch.clientY - rect.top;

          trial_data.hotspot_clicked = hotspot.id;
          trial_data.rt = Math.round(performance.now() - start_time);
          trial_data.click_x = Math.round(touchX);
          trial_data.click_y = Math.round(touchY);

          end_trial();
        });

        overlay.appendChild(hotspotElement);
      });
    };

    // End trial function
    const end_trial = () => {
      this.jsPsych.finishTrial(trial_data);
    };

    // Wait for image to load before creating hotspots
    if (img.complete) {
      createHotspots();
    } else {
      img.addEventListener("load", createHotspots);
    }

    // Handle trial duration
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        end_trial();
      }, trial.trial_duration);
    }
  }
}

export default ImageHotspotsPlugin;
