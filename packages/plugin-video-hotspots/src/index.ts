import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "video-hotspots",
  version: version,
  parameters: {
    /** The video to display. Can be a path to a video file or a data URL. */
    stimulus: {
      type: ParameterType.VIDEO,
      default: undefined,
    },
    /** Array of hotspot regions with their coordinates and properties. Each hotspot should have x, y, width, height, and id properties. */
    hotspots: {
      type: ParameterType.COMPLEX,
      default: [],
    },
    /** How long to show the trial in milliseconds after video ends. If null, the trial will wait for a response. */
    trial_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** CSS string to style the hotspot highlight overlay. */
    hotspot_highlight_css: {
      type: ParameterType.STRING,
      default: "background-color: rgba(255, 255, 0, 0.3); border: 2px solid yellow;",
    },
    /** Whether to preload the video. */
    video_preload: {
      type: ParameterType.BOOL,
      default: true,
    },
  },
  data: {
    /** The ID of the clicked hotspot region. */
    hotspot_clicked: {
      type: ParameterType.STRING,
    },
    /** The response time in milliseconds from when video ended. */
    rt: {
      type: ParameterType.INT,
    },
    /** The x coordinate of the click relative to the video. */
    click_x: {
      type: ParameterType.FLOAT,
    },
    /** The y coordinate of the click relative to the video. */
    click_y: {
      type: ParameterType.FLOAT,
    },
    /** The duration of the video in milliseconds. */
    video_duration: {
      type: ParameterType.FLOAT,
    },
  },
  // When you run build on your plugin, citations will be generated here based on the information in the CITATION.cff file.
  citations: "__CITATIONS__",
};

type Info = typeof info;

/**
 * **plugin-video-hotspots**
 *
 * A plugin for displaying a video that freezes on the final frame with clickable hotspots
 *
 * @author Claude
 * @see {@link /plugin-video-hotspots/README.md}}
 */
class VideoHotspotsPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    let video_end_time: number | null = null;

    // Create the HTML structure
    const html = `
      <div id="jspsych-video-hotspots-container" style="position: relative; display: inline-block;">
        <video id="jspsych-video-hotspots-stimulus"
               src="${trial.stimulus}"
               autoplay           
               ${trial.video_preload ? 'preload="auto"' : 'preload="none"'}
               style="display: block;"
               oncontextmenu="return false;"
               controlslist="nodownload nofullscreen noremoteplayback">
        </video>
        <div id="jspsych-video-hotspots-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>
      </div>
    `;

    display_element.innerHTML = html;

    // Add CSS to ensure video controls are completely hidden
    let styleElement = document.getElementById(
      "jspsych-video-hotspots-style"
    ) as HTMLStyleElement | null;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "jspsych-video-hotspots-style";
      styleElement.textContent = `
        #jspsych-video-hotspots-stimulus::-webkit-media-controls {
          display: none !important;
        }
        #jspsych-video-hotspots-stimulus::-webkit-media-controls-panel {
          display: none !important;
        }
        #jspsych-video-hotspots-stimulus::-webkit-media-controls-play-button {
          display: none !important;
        }
        #jspsych-video-hotspots-stimulus::-webkit-media-controls-start-playback-button {
          display: none !important;
        }
        #jspsych-video-hotspots-stimulus {
          pointer-events: none;
        }
        #jspsych-video-hotspots-overlay {
          pointer-events: auto;
        }
      `;
      document.head.appendChild(styleElement);
    }

    const video = display_element.querySelector(
      "#jspsych-video-hotspots-stimulus"
    ) as HTMLVideoElement;
    const overlay = display_element.querySelector("#jspsych-video-hotspots-overlay") as HTMLElement;

    let trial_data = {
      hotspot_clicked: null as string | null,
      rt: null as number | null,
      click_x: null as number | null,
      click_y: null as number | null,
      video_duration: null as number | null,
    };

    // Function to create hotspot elements (only called after video ends)
    const createHotspots = () => {
      trial.hotspots.forEach((hotspot: any) => {
        const hotspotElement = document.createElement("div");
        hotspotElement.className = "jspsych-video-hotspots-hotspot";
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
          highlight.className = "jspsych-video-hotspots-highlight";
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
          if (video_end_time === null) return; // Prevent clicks before video ends

          const rect = video.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const clickY = e.clientY - rect.top;

          trial_data.hotspot_clicked = hotspot.id;
          trial_data.rt = Math.round(performance.now() - video_end_time);
          trial_data.click_x = Math.round(clickX);
          trial_data.click_y = Math.round(clickY);

          end_trial();
        });

        // Touch events
        hotspotElement.addEventListener("touchstart", (e) => {
          if (video_end_time === null) return; // Prevent touches before video ends

          e.preventDefault();
          const highlight = document.createElement("div");
          highlight.className = "jspsych-video-hotspots-highlight";
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
          if (video_end_time === null) return; // Prevent touches before video ends

          e.preventDefault();
          const touch = e.changedTouches[0];
          const rect = video.getBoundingClientRect();
          const touchX = touch.clientX - rect.left;
          const touchY = touch.clientY - rect.top;

          trial_data.hotspot_clicked = hotspot.id;
          trial_data.rt = Math.round(performance.now() - video_end_time);
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

    // Video event handlers
    video.addEventListener("ended", () => {
      video_end_time = performance.now();
      trial_data.video_duration = video.duration * 1000; // Convert to milliseconds

      // Create hotspots now that video has ended
      createHotspots();

      // Handle trial duration after video ends
      if (trial.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          end_trial();
        }, trial.trial_duration);
      }
    });

    // Handle case where video fails to load
    video.addEventListener("error", () => {
      end_trial();
    });
  }
}

export default VideoHotspotsPlugin;
