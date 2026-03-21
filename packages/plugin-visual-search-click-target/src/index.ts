import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "visual-search-click-target",
  version: version,
  parameters: {
    /** Array of image URLs to display in the search array */
    images: {
      type: ParameterType.STRING,
      array: true,
      default: undefined,
    },
    /** Whether a target is present in the display */
    target_present: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** Index of the target in the images array (if target_present is true) */
    target_index: {
      type: ParameterType.INT,
      default: 0,
    },
    /** Size of images as percentage of viewport minimum dimension (vmin) */
    image_size: {
      type: ParameterType.FLOAT,
      default: 10,
    },
    /** Width of the search area as percentage of viewport width */
    search_area_width: {
      type: ParameterType.FLOAT,
      default: 90,
    },
    /** Height of the search area as percentage of viewport height */
    search_area_height: {
      type: ParameterType.FLOAT,
      default: 80,
    },
    /** Background color of the search display */
    background_color: {
      type: ParameterType.STRING,
      default: "#ffffff",
    },
    /** Array of {x, y} objects specifying the position of each image as percentages (0-100)
     * of the search area dimensions. x and y specify the center of the image.
     * If null, positions are generated randomly with non-overlapping placement.
     * The array must have the same length as `images`. */
    image_positions: {
      type: ParameterType.COMPLEX,
      array: true,
      default: null,
      nested: {
        x: {
          type: ParameterType.FLOAT,
        },
        y: {
          type: ParameterType.FLOAT,
        },
      },
    },
  },
  data: {
    /** Response time in milliseconds from display onset */
    rt: {
      type: ParameterType.INT,
    },
    /** Type of response: 'target' if an image was clicked, 'absent' if absent box was clicked */
    response: {
      type: ParameterType.STRING,
    },
    /** Whether the response was correct */
    correct: {
      type: ParameterType.BOOL,
    },
    /** Index of the clicked image in the images array (null if absent box was clicked) */
    clicked_index: {
      type: ParameterType.INT,
    },
    /** The images displayed in the search array */
    images: {
      type: ParameterType.STRING,
      array: true,
    },
    /** The x and y positions of each image as percentages of the search area */
    image_positions: {
      type: ParameterType.COMPLEX,
      array: true,
    },
  },
  citations: "__CITATIONS__",
};

type Info = typeof info;

/**
 * **visual-search-click-target**
 *
 * Visual search trial with click response. Displays images in a random scatter
 * pattern with an "absent" button. Participant clicks on a target image or the
 * absent button if no target is present.
 *
 * @author Josh de Leeuw
 */
class VisualSearchClickTargetPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    const startTime = performance.now();

    // Create container for the entire display
    const container = document.createElement("div");
    container.style.cssText = `
      display: flex;
      width: 100vw;
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      background: ${trial.background_color};
    `;

    // Create absent box container (left side)
    const absentContainer = document.createElement("div");
    absentContainer.style.cssText = `
      width: ${100 - trial.search_area_width}vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding-left: 1vw;
    `;

    // Create absent button
    const absentButton = document.createElement("button");
    absentButton.textContent = "Absent";
    absentButton.className = "jspsych-btn";
    absentButton.style.cssText = `
      padding: 2vmin 4vmin;
      font-size: 2vmin;
      cursor: pointer;
    `;
    absentContainer.appendChild(absentButton);

    // Create search area container (right side)
    const searchArea = document.createElement("div");
    searchArea.style.cssText = `
      width: ${trial.search_area_width}vw;
      height: ${trial.search_area_height}vh;
      position: relative;
      margin: ${(100 - trial.search_area_height) / 2}vh 0;
    `;

    // Determine image positions: use custom positions if provided, otherwise generate random
    let positions: Array<{ x: number; y: number }>;

    if (trial.image_positions != null) {
      if (trial.image_positions.length !== trial.images.length) {
        throw new Error(
          `visual-search-click-target plugin: image_positions array length (${trial.image_positions.length}) ` +
            `must match images array length (${trial.images.length}).`
        );
      }
      positions = trial.image_positions;
    } else {
      positions = this.generatePositions(
        trial.images.length,
        trial.image_size,
        trial.search_area_width,
        trial.search_area_height
      );
    }

    // Create image elements
    const imageElements: HTMLImageElement[] = [];
    trial.images.forEach((imgSrc, index) => {
      const img = document.createElement("img");
      img.src = imgSrc;
      img.dataset.index = index.toString();
      img.style.cssText = `
        position: absolute;
        width: ${trial.image_size}vmin;
        height: ${trial.image_size}vmin;
        object-fit: contain;
        left: ${positions[index].x}%;
        top: ${positions[index].y}%;
        transform: translate(-50%, -50%);
        cursor: pointer;
      `;
      imageElements.push(img);
      searchArea.appendChild(img);
    });

    // Assemble display
    container.appendChild(absentContainer);
    container.appendChild(searchArea);
    display_element.appendChild(container);

    // Handle response
    const endTrial = (response: "target" | "absent", clickedIndex: number | null) => {
      const endTime = performance.now();
      const rt = Math.round(endTime - startTime);

      // Determine correctness
      let correct: boolean;
      if (trial.target_present) {
        // Target was present - correct if clicked on target
        correct = response === "target" && clickedIndex === trial.target_index;
      } else {
        // Target was absent - correct if clicked absent
        correct = response === "absent";
      }

      // Clear display
      display_element.innerHTML = "";

      // Save data and finish trial
      this.jsPsych.finishTrial({
        rt: rt,
        response: response,
        correct: correct,
        clicked_index: clickedIndex,
        images: trial.images,
        image_positions: positions,
      });
    };

    // Add click handlers to images
    imageElements.forEach((img) => {
      img.addEventListener("click", () => {
        const clickedIndex = parseInt(img.dataset.index!, 10);
        endTrial("target", clickedIndex);
      });
    });

    // Add click handler to absent button
    absentButton.addEventListener("click", () => {
      endTrial("absent", null);
    });
  }

  /**
   * Generate random non-overlapping positions for images within the search area.
   * Positions are returned as percentages of the search area dimensions.
   */
  private generatePositions(
    count: number,
    imageSize: number,
    areaWidth: number,
    areaHeight: number
  ): Array<{ x: number; y: number }> {
    const positions: Array<{ x: number; y: number }> = [];

    // Convert image size from vmin to approximate percentage of area
    // This is an approximation since vmin depends on viewport dimensions
    const imageSizePercent = (imageSize / areaWidth) * 100;
    const imageSizePercentY = (imageSize / areaHeight) * 100;

    // Minimum spacing between image centers (as percentage of area)
    const minSpacing = Math.max(imageSizePercent, imageSizePercentY) * 1.2;

    // Maximum attempts to place each image
    const maxAttempts = 1000;

    for (let i = 0; i < count; i++) {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < maxAttempts) {
        // Generate random center position (leaving margin for half image size on each side)
        const halfW = imageSizePercent / 2;
        const halfH = imageSizePercentY / 2;
        const x = halfW + Math.random() * (100 - imageSizePercent);
        const y = halfH + Math.random() * (100 - imageSizePercentY);

        // Check for overlap with existing positions
        let overlaps = false;
        for (const pos of positions) {
          const dx = x - pos.x;
          const dy = y - pos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < minSpacing) {
            overlaps = true;
            break;
          }
        }

        if (!overlaps) {
          positions.push({ x, y });
          placed = true;
        }

        attempts++;
      }

      // If we couldn't place without overlap, place anyway (fallback)
      if (!placed) {
        const halfW = imageSizePercent / 2;
        const halfH = imageSizePercentY / 2;
        const x = halfW + Math.random() * (100 - imageSizePercent);
        const y = halfH + Math.random() * (100 - imageSizePercentY);
        positions.push({ x, y });
      }
    }

    return positions;
  }
}

export default VisualSearchClickTargetPlugin;
