import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "plugin-columbia-card-task",
  version: version,
  parameters: {
    /** Number of cards to display in the grid */
    num_cards: {
      type: ParameterType.INT,
      default: 32,
    },
    /** Number of columns in the card grid */
    grid_columns: {
      type: ParameterType.INT,
      default: 8,
    },
    /** Card width in pixels */
    card_width: {
      type: ParameterType.INT,
      default: 60,
    },
    /** Card height in pixels */
    card_height: {
      type: ParameterType.INT,
      default: 80,
    },
    /** Duration of card flip animation in milliseconds */
    flip_duration: {
      type: ParameterType.INT,
      default: 300,
    },
    /** Number of loss cards in the deck */
    num_loss_cards: {
      type: ParameterType.INT,
      default: 3,
    },
    /** Points lost when selecting a loss card */
    loss_value: {
      type: ParameterType.INT,
      default: -250,
    },
    /** Points gained when selecting a gain card */
    gain_value: {
      type: ParameterType.INT,
      default: 10,
    },
    /** Text for the main instructions */
    instructions: {
      type: ParameterType.STRING,
      default:
        "Tap the cards to flip them over. Gain cards give you points, loss cards lose points!",
    },
    /** Text label for gain cards */
    gain_cards_label: {
      type: ParameterType.STRING,
      default: "Gain Cards",
    },
    /** Text label for loss cards */
    loss_cards_label: {
      type: ParameterType.STRING,
      default: "Loss Cards",
    },
    /** Text label for the score display */
    score_label: {
      type: ParameterType.STRING,
      default: "Points:",
    },
    /** Text for the continue button */
    continue_button_text: {
      type: ParameterType.STRING,
      default: "Stop",
    },
    /** Symbol displayed on card fronts */
    card_front_symbol: {
      type: ParameterType.STRING,
      default: "?",
    },
    /** Starting score for the trial */
    starting_score: {
      type: ParameterType.INT,
      default: 0,
    },
  },
  data: {
    /** Array of card indices that were clicked */
    cards_clicked: {
      type: ParameterType.OBJECT,
    },
    /** Order in which cards were clicked */
    click_order: {
      type: ParameterType.OBJECT,
    },
    /** Total number of cards clicked */
    total_clicks: {
      type: ParameterType.INT,
    },
    /** Response time for each card click */
    response_times: {
      type: ParameterType.OBJECT,
    },
    /** Array of values for each card (gain/loss values) */
    card_values: {
      type: ParameterType.OBJECT,
    },
    /** Total points earned/lost during the trial */
    total_points: {
      type: ParameterType.INT,
    },
    /** Array of points gained/lost for each clicked card */
    points_per_click: {
      type: ParameterType.OBJECT,
    },
  },
  // When you run build on your plugin, citations will be generated here based on the information in the CITATION.cff file.
  citations: "__CITATIONS__",
};

type Info = typeof info;

/**
 * **plugin-columbia-card-task**
 *
 * The Columbia Card Task measures risk preferences through choices in a card game.
 *
 * @author Josh de Leeuw
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-columbia-card-task/README.md}}
 */
class ColumbiaCardTaskPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    const start_time = performance.now();
    const cards_clicked: number[] = [];
    const click_order: number[] = [];
    const response_times: number[] = [];
    const points_per_click: number[] = [];
    let click_count = 0;
    let total_points = trial.starting_score;

    // Create card values array
    const card_values: number[] = new Array(trial.num_cards);

    // Randomly assign loss cards
    const loss_card_indices = new Set<number>();
    while (loss_card_indices.size < trial.num_loss_cards) {
      const random_index = Math.floor(Math.random() * trial.num_cards);
      loss_card_indices.add(random_index);
    }

    // Assign values to cards
    for (let i = 0; i < trial.num_cards; i++) {
      card_values[i] = loss_card_indices.has(i) ? trial.loss_value : trial.gain_value;
    }

    // Create CSS styles
    const css = `
      <style>
        .cct-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          user-select: none;
        }
        .cct-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 800px;
          margin-bottom: 20px;
          gap: 20px;
        }
        .cct-info-panel {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 30px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 10px;
          border: 2px solid #dee2e6;
          flex-wrap: wrap;
        }
        .cct-info-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: bold;
        }
        .cct-mini-card {
          width: 30px;
          height: 40px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          color: white;
          border: 1px solid #333;
        }
        .cct-mini-card.gain {
          background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
        }
        .cct-mini-card.loss {
          background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
        }
        .cct-score {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
          padding: 15px;
          border-radius: 10px;
          background-color: #f0f0f0;
          border: 2px solid #dee2e6;
          height: 76px;
          box-sizing: border-box;
        }
        .cct-score span {
          margin-left: 10px;
        }
        .cct-instructions {
          text-align: center;
          margin-bottom: 20px;
          font-size: 16px;
        }
        .cct-grid {
          display: grid;
          grid-template-columns: repeat(${trial.grid_columns}, 1fr);
          gap: 8px;
          width: 100%;
          max-width: 800px;
          margin-bottom: 20px;
        }
        .cct-card {
          width: ${trial.card_width}px;
          height: ${trial.card_height}px;
          perspective: 1000px;
          cursor: pointer;
          touch-action: manipulation;
          transform-origin: center center;
        }
        .cct-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform ${trial.flip_duration}ms;
          transform-style: preserve-3d;
          transform-origin: center center;
        }
        .cct-card.flipped .cct-card-inner {
          transform: rotateY(180deg);
        }
        .cct-card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          border: 2px solid #333;
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-size: 14px;
        }
        .cct-card-front {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .cct-card-back {
          color: white;
          transform: rotateY(180deg);
        }
        .cct-card-back.gain {
          background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
        }
        .cct-card-back.loss {
          background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
        }
        
        @media (max-width: 768px) {
          .cct-top-row {
            flex-direction: column;
            align-items: stretch;
            gap: 15px;
          }
          .cct-info-panel {
            gap: 15px;
            padding: 10px;
          }
          .cct-info-item {
            font-size: 12px;
          }
          .cct-mini-card {
            width: 25px;
            height: 32px;
            font-size: 8px;
          }
          .cct-score {
            text-align: center;
            padding: 10px;
            font-size: 16px;
          }
          .cct-card {
            width: ${Math.max(40, trial.card_width * 0.8)}px;
            height: ${Math.max(50, trial.card_height * 0.8)}px;
          }
          .cct-grid {
            gap: 4px;
            padding: 0 10px;
          }
          .cct-card-face {
            font-size: 12px;
          }
        }
      </style>
    `;

    // Create HTML structure
    let html = css;
    html += '<div class="cct-container">';

    // Add top row with info panel and score
    html += '<div class="cct-top-row">';
    html += `
      <div class="cct-info-panel">
        <div class="cct-info-item">
          <div class="cct-mini-card gain">+${trial.gain_value}</div>
          <span>${trial.num_cards - trial.num_loss_cards} ${trial.gain_cards_label}</span>
        </div>
        <div class="cct-info-item">
          <div class="cct-mini-card loss">${trial.loss_value}</div>
          <span>${trial.num_loss_cards} ${trial.loss_cards_label}</span>
        </div>
      </div>
    `;
    html += `<div class="cct-score">${trial.score_label + " "} <span id="score-display">${
      trial.starting_score
    }</span></div>`;
    html += "</div>";

    // Add instructions
    html += `<div class="cct-instructions">${trial.instructions}</div>`;

    // Add card grid
    html += '<div class="cct-grid">';

    for (let i = 0; i < trial.num_cards; i++) {
      const is_loss_card = loss_card_indices.has(i);
      const card_class = is_loss_card ? "loss" : "gain";
      const display_value = is_loss_card ? trial.loss_value : `+${trial.gain_value}`;

      html += `
        <div class="cct-card" data-card-index="${i}">
          <div class="cct-card-inner">
            <div class="cct-card-face cct-card-front">${trial.card_front_symbol}</div>
            <div class="cct-card-face cct-card-back ${card_class}">${display_value}</div>
          </div>
        </div>
      `;
    }

    html += "</div>";
    // Add continue button
    html += `<button class="jspsych-btn">${trial.continue_button_text}</button>`;
    html += "</div>";

    display_element.innerHTML = html;

    const score_display = display_element.querySelector("#score-display") as HTMLElement;

    // Add event listeners for card clicks
    const card_elements = display_element.querySelectorAll(".cct-card");
    card_elements.forEach((card_element) => {
      const handleCardClick = (e: Event) => {
        e.preventDefault();
        const card_index = parseInt((card_element as HTMLElement).dataset.cardIndex!);

        if (cards_clicked.includes(card_index)) {
          return; // Card already clicked
        }

        const click_time = performance.now();
        const card_value = card_values[card_index];

        cards_clicked.push(card_index);
        click_order.push(click_count);
        response_times.push(click_time - start_time);
        points_per_click.push(card_value);
        total_points += card_value;
        click_count++;

        // Update score display
        score_display.textContent = total_points.toString();

        // Add flip animation
        card_element.classList.add("flipped");

        // Disable further clicks on this card
        (card_element as HTMLElement).style.pointerEvents = "none";
      };

      card_element.addEventListener("click", handleCardClick);
      card_element.addEventListener("touchend", handleCardClick);
    });

    // Continue button handler
    const continue_button = display_element.querySelector(".jspsych-btn") as HTMLButtonElement;
    continue_button.addEventListener("click", () => {
      const trial_data = {
        cards_clicked: cards_clicked,
        click_order: click_order,
        total_clicks: cards_clicked.length,
        response_times: response_times,
        card_values: card_values,
        total_points: total_points,
        points_per_click: points_per_click,
      };

      this.jsPsych.finishTrial(trial_data);
    });
  }
}

export default ColumbiaCardTaskPlugin;
