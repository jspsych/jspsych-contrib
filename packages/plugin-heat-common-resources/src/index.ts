import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "heat-common-resources",
  version: version,
  parameters: {
    /** Total number of players in the group including the participant. */
    num_players: {
      type: ParameterType.INT,
      default: 5,
    },
    /** Number of cooling tokens each player starts with. */
    initial_tokens: {
      type: ParameterType.INT,
      default: 10,
    },
    /** Minimum tokens required in group pot to deploy cooling station. */
    group_threshold: {
      type: ParameterType.INT,
      default: 25,
    },
    /** Tokens needed for personal survival without group cooling. */
    survival_tokens_no_cooling: {
      type: ParameterType.INT,
      default: 6,
    },
    /** Tokens needed for personal survival with group cooling deployed. */
    survival_tokens_with_cooling: {
      type: ParameterType.INT,
      default: 2,
    },
    /** Array of simulated player contributions. If fewer than num_players-1, remaining are randomized. */
    simulated_contributions: {
      type: ParameterType.INT,
      default: [],
      array: true,
    },
    /** Range for randomizing simulated player contributions [min, max]. */
    random_contribution_range: {
      type: ParameterType.INT,
      default: [4, 6],
      array: true,
    },
    /** Custom names for players. If fewer than num_players, remaining are 'Anonymous'. */
    player_names: {
      type: ParameterType.STRING,
      default: [],
      array: true,
    },
    /** Label for the human participant. */
    participant_label: {
      type: ParameterType.STRING,
      default: "You",
    },
    /** Whether to show token counts for other players during contribution phase. */
    show_other_tokens: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** Duration to show trial in milliseconds. If null, waits for response. */
    trial_duration: {
      type: ParameterType.INT,
      default: null,
    },
  },
  data: {
    /** Number of tokens contributed by the participant to the group pot. */
    tokens_contributed: {
      type: ParameterType.INT,
    },
    /** Number of tokens kept by the participant for personal cooling. */
    tokens_kept: {
      type: ParameterType.INT,
    },
    /** Total tokens in the group cooling pot from all players. */
    total_group_tokens: {
      type: ParameterType.INT,
    },
    /** Whether the group cooling station was deployed. */
    cooling_deployed: {
      type: ParameterType.BOOL,
    },
    /** Whether the participant survived the heatwave. */
    participant_survived: {
      type: ParameterType.BOOL,
    },
    /** Array of whether each player survived (including participant). */
    all_players_survived: {
      type: ParameterType.BOOL,
      array: true,
    },
    /** Array of contributions from all players (including participant). */
    all_contributions: {
      type: ParameterType.INT,
      array: true,
    },
    /** Response time from start to clicking done button in milliseconds. */
    rt: {
      type: ParameterType.INT,
    },
  },
  // When you run build on your plugin, citations will be generated here based on the information in the CITATION.cff file.
  citations: '__CITATIONS__',
};

type Info = typeof info;

/**
 * **plugin-heat-common-resources**
 *
 * A resource allocation game where participants decide how to distribute cooling tokens between personal and group cooling during a heatwave scenario, featuring configurable thresholds for survival and simulated co-players. Implements a climate-themed social dilemma with customizable parameters for group size, token amounts, and deployment thresholds.
 *
 * @author Abdullah Hunter Farhat
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-heat-common-resources/README.md}}
 */
class HeatCommonResourcesPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    const start_time = performance.now();
    let phase = 'contribution'; // 'contribution' or 'feedback'
    
    // Generate player names and randomize participant position
    const player_names = [...trial.player_names];
    while (player_names.length < trial.num_players) {
      player_names.push('Anonymous');
    }
    
    // Randomize participant position (0 to num_players-1)
    const participant_position = this.jsPsych.randomization.randomInt(0, trial.num_players - 1);
    player_names[participant_position] = trial.participant_label;
    
    // Generate simulated contributions
    const simulated_contributions = [...trial.simulated_contributions];
    while (simulated_contributions.length < trial.num_players - 1) {
      const [min, max] = trial.random_contribution_range;
      const randomContrib = this.jsPsych.randomization.randomInt(min, max);
      simulated_contributions.push(randomContrib);
    }
    
    // Track participant state
    let participant_tokens_remaining = trial.initial_tokens;
    let participant_contributed = 0;
    
    // Calculate total contributions and survival
    const calculateResults = () => {
      // Create contributions array with participant in correct position
      const all_contributions = new Array(trial.num_players);
      all_contributions[participant_position] = participant_contributed;
      
      // Fill in simulated contributions
      let sim_index = 0;
      for (let i = 0; i < trial.num_players; i++) {
        if (i !== participant_position) {
          all_contributions[i] = simulated_contributions[sim_index];
          sim_index++;
        }
      }
      
      const total_group_tokens = all_contributions.reduce((sum, contrib) => sum + contrib, 0);
      const cooling_deployed = total_group_tokens >= trial.group_threshold;
      
      const survival_threshold = cooling_deployed ? 
        trial.survival_tokens_with_cooling : 
        trial.survival_tokens_no_cooling;
      
      const all_players_survived = all_contributions.map((contrib, index) => {
        const tokens_kept = trial.initial_tokens - contrib;
        return tokens_kept >= survival_threshold;
      });
      
      return {
        all_contributions,
        total_group_tokens,
        cooling_deployed,
        all_players_survived,
        participant_survived: all_players_survived[participant_position]
      };
    };
    
    // Create contribution phase HTML
    const createContributionPhase = () => {
      const html = `
        <style>
          #heat-game-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2rem;
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
            font-family: Arial, sans-serif;
          }
          
          #heat-game-board {
            position: relative;
            width: 400px;
            height: 400px;
            margin: 0 auto;
          }
          
          #heat-players-container {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
          }
          
          .heat-player {
            position: absolute;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem;
            border: 2px solid #333;
            border-radius: 8px;
            background-color: #f9f9f9;
            min-width: 80px;
            text-align: center;
          }
          
          .heat-player[data-position="0"] { top: 10px; left: 50%; transform: translateX(-50%); }
          .heat-player[data-position="1"] { top: 30%; right: 10px; transform: translateY(-50%); }
          .heat-player[data-position="2"] { bottom: 30%; right: 10px; transform: translateY(50%); }
          .heat-player[data-position="3"] { bottom: 10px; left: 50%; transform: translateX(-50%); }
          .heat-player[data-position="4"] { bottom: 30%; left: 10px; transform: translateY(50%); }
          .heat-player[data-position="5"] { top: 30%; left: 10px; transform: translateY(-50%); }
          .heat-player[data-position="6"] { top: 15%; right: 20%; }
          .heat-player[data-position="7"] { bottom: 15%; right: 20%; }
          .heat-player[data-position="8"] { bottom: 15%; left: 20%; }
          .heat-player[data-position="9"] { top: 15%; left: 20%; }
          
          .heat-player-icon { font-size: 2rem; }
          .heat-player-name { font-weight: bold; font-size: 0.9rem; }
          .heat-player-tokens { font-size: 1.2rem; color: #0066cc; font-weight: bold; }
          
          #heat-pot-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
          }
          
          #heat-pot-outer {
            width: 120px;
            height: 120px;
            background-color: #3182ce;
            border: 3px solid #2c5aa0;
            border-radius: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          #heat-pot {
            width: 80px;
            height: 80px;
            background-color: #4a5568;
            border: 2px solid #2d3748;
            border-radius: 4px;
            cursor: pointer;
            user-select: none;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          #heat-pot:hover { background-color: #5a6578; }
          #heat-pot:active { background-color: #3a4558; }
          #heat-pot-symbol { font-size: 2rem; color: #63b3ed; }
          
          #heat-pot-tokens {
            font-size: 1.5rem;
            font-weight: bold;
            color: #cc6600;
            background-color: #fff3cd;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            border: 2px solid #cc6600;
          }
          
          #heat-done-btn {
            font-size: 1.2rem;
            padding: 0.75rem 2rem;
            margin-top: 1rem;
          }
          
          /* Feedback Phase */
          #heat-feedback-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2rem;
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
            font-family: Arial, sans-serif;
          }
          
          #heat-players-feedback {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
          }
          
          .heat-player-feedback {
            position: absolute;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem;
            border: 3px solid;
            border-radius: 8px;
            min-width: 120px;
            text-align: center;
          }
          
          .heat-player-feedback[data-position="0"] { top: 10px; left: 50%; transform: translateX(-50%); }
          .heat-player-feedback[data-position="1"] { top: 30%; right: 10px; transform: translateY(-50%); }
          .heat-player-feedback[data-position="2"] { bottom: 30%; right: 10px; transform: translateY(50%); }
          .heat-player-feedback[data-position="3"] { bottom: 10px; left: 50%; transform: translateX(-50%); }
          .heat-player-feedback[data-position="4"] { bottom: 30%; left: 10px; transform: translateY(50%); }
          .heat-player-feedback[data-position="5"] { top: 30%; left: 10px; transform: translateY(-50%); }
          .heat-player-feedback[data-position="6"] { top: 15%; right: 20%; }
          .heat-player-feedback[data-position="7"] { bottom: 15%; right: 20%; }
          .heat-player-feedback[data-position="8"] { bottom: 15%; left: 20%; }
          .heat-player-feedback[data-position="9"] { top: 15%; left: 20%; }
          
          .heat-player-feedback.survived {
            border-color: #28a745;
            background-color: #d4edda;
          }
          
          .heat-player-feedback.burned {
            border-color: #dc3545;
            background-color: #f8d7da;
          }
          
          .heat-player-status {
            font-weight: bold;
            font-size: 1rem;
          }
          
          .heat-player-feedback.survived .heat-player-status { color: #28a745; }
          .heat-player-feedback.burned .heat-player-status { color: #dc3545; }
          
          .heat-player-contrib {
            font-size: 0.9rem;
            color: #666;
          }
          
          #heat-pot-feedback {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
          }
          
          #heat-pot-feedback.cooling-deployed #heat-pot-outer {
            background-color: #17a2b8;
            border-color: #138496;
          }
          
          #heat-pot-feedback.no-cooling #heat-pot-outer {
            background-color: #dc3545;
            border-color: #c82333;
          }
          
          #heat-pot-feedback #heat-pot-display {
            width: 80px;
            height: 80px;
            background-color: #4a5568;
            border: 2px solid #2d3748;
            border-radius: 4px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          #heat-pot-feedback #heat-pot-symbol { font-size: 2rem; }
          #heat-pot-total { font-size: 1.5rem; font-weight: bold; color: #cc6600; }
          
          #heat-cooling-status {
            font-size: 1.2rem;
            font-weight: bold;
            text-align: center;
          }
          
          #heat-pot-feedback.cooling-deployed #heat-cooling-status { color: #17a2b8; }
          #heat-pot-feedback.no-cooling #heat-cooling-status { color: #dc3545; }
          
          /* Mobile Responsive */
          @media (max-width: 768px) {
            #heat-game-container, #heat-feedback-container { padding: 1rem; gap: 1.5rem; }
            #heat-game-board { width: 300px; height: 300px; }
            .heat-player, .heat-player-feedback { min-width: 60px; padding: 0.75rem; font-size: 0.8rem; }
            .heat-player-icon { font-size: 1.5rem; }
            #heat-pot-outer { width: 100px; height: 100px; }
            #heat-pot { width: 70px; height: 70px; }
            #heat-pot-symbol { font-size: 1.5rem; }
          }
        </style>
        
        <div id="heat-game-container">
          <div id="heat-game-board">
            <div id="heat-players-container">
              ${player_names.map((name, index) => `
                <div class="heat-player" data-player-index="${index}" data-position="${index}">
                  <div class="heat-player-icon">👤</div>
                  <div class="heat-player-name">${name}</div>
                  <div class="heat-player-tokens">
                    ${index === participant_position ? participant_tokens_remaining : 
                      (trial.show_other_tokens ? (trial.initial_tokens - simulated_contributions[index < participant_position ? index : index - 1]) : '?')}
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div id="heat-pot-container">
              <div id="heat-pot-outer">
                <div id="heat-pot" class="heat-pot-clickable">
                  <div id="heat-pot-symbol">💧</div>
                </div>
              </div>
              <div id="heat-pot-tokens">${participant_contributed}</div>
            </div>
          </div>
          
          <button id="heat-done-btn" class="jspsych-btn">Done</button>
        </div>
      `;
      
      display_element.innerHTML = html;
      
      // Add event listeners
      const pot = document.getElementById('heat-pot');
      const doneBtn = document.getElementById('heat-done-btn');
      
      pot.addEventListener('click', () => {
        if (participant_tokens_remaining > 0) {
          participant_tokens_remaining--;
          participant_contributed++;
          updateDisplay();
        }
      });
      
      doneBtn.addEventListener('click', () => {
        showFeedbackPhase();
      });
    };
    
    // Update the display during contribution phase
    const updateDisplay = () => {
      const participantTokensEl = document.querySelector(`[data-player-index="${participant_position}"] .heat-player-tokens`);
      const potTokensEl = document.getElementById('heat-pot-tokens');
      
      if (participantTokensEl) participantTokensEl.textContent = participant_tokens_remaining.toString();
      if (potTokensEl) potTokensEl.textContent = participant_contributed.toString();
    };
    
    // Create feedback phase HTML
    const showFeedbackPhase = () => {
      phase = 'feedback';
      const results = calculateResults();
      
      const html = `
        <style>
          #heat-game-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2rem;
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
            font-family: Arial, sans-serif;
          }
          
          #heat-game-board {
            position: relative;
            width: 400px;
            height: 400px;
            margin: 0 auto;
          }
          
          #heat-players-container {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
          }
          
          .heat-player {
            position: absolute;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem;
            border: 2px solid #333;
            border-radius: 8px;
            background-color: #f9f9f9;
            min-width: 80px;
            text-align: center;
          }
          
          .heat-player[data-position="0"] { top: 10px; left: 50%; transform: translateX(-50%); }
          .heat-player[data-position="1"] { top: 30%; right: 10px; transform: translateY(-50%); }
          .heat-player[data-position="2"] { bottom: 30%; right: 10px; transform: translateY(50%); }
          .heat-player[data-position="3"] { bottom: 10px; left: 50%; transform: translateX(-50%); }
          .heat-player[data-position="4"] { bottom: 30%; left: 10px; transform: translateY(50%); }
          .heat-player[data-position="5"] { top: 30%; left: 10px; transform: translateY(-50%); }
          .heat-player[data-position="6"] { top: 15%; right: 20%; }
          .heat-player[data-position="7"] { bottom: 15%; right: 20%; }
          .heat-player[data-position="8"] { bottom: 15%; left: 20%; }
          .heat-player[data-position="9"] { top: 15%; left: 20%; }
          
          .heat-player-icon { font-size: 2rem; }
          .heat-player-name { font-weight: bold; font-size: 0.9rem; }
          .heat-player-tokens { font-size: 1.2rem; color: #0066cc; font-weight: bold; }
          
          #heat-pot-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
          }
          
          #heat-pot-outer {
            width: 120px;
            height: 120px;
            background-color: #3182ce;
            border: 3px solid #2c5aa0;
            border-radius: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          #heat-pot {
            width: 80px;
            height: 80px;
            background-color: #4a5568;
            border: 2px solid #2d3748;
            border-radius: 4px;
            cursor: pointer;
            user-select: none;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          #heat-pot:hover { background-color: #5a6578; }
          #heat-pot:active { background-color: #3a4558; }
          #heat-pot-symbol { font-size: 2rem; color: #63b3ed; }
          
          #heat-pot-tokens {
            font-size: 1.5rem;
            font-weight: bold;
            color: #cc6600;
            background-color: #fff3cd;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            border: 2px solid #cc6600;
          }
          
          #heat-done-btn {
            font-size: 1.2rem;
            padding: 0.75rem 2rem;
            margin-top: 1rem;
          }
          
          /* Feedback Phase */
          #heat-feedback-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2rem;
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
            font-family: Arial, sans-serif;
          }
          
          #heat-players-feedback {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
          }
          
          .heat-player-feedback {
            position: absolute;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem;
            border: 3px solid;
            border-radius: 8px;
            min-width: 120px;
            text-align: center;
          }
          
          .heat-player-feedback[data-position="0"] { top: 10px; left: 50%; transform: translateX(-50%); }
          .heat-player-feedback[data-position="1"] { top: 30%; right: 10px; transform: translateY(-50%); }
          .heat-player-feedback[data-position="2"] { bottom: 30%; right: 10px; transform: translateY(50%); }
          .heat-player-feedback[data-position="3"] { bottom: 10px; left: 50%; transform: translateX(-50%); }
          .heat-player-feedback[data-position="4"] { bottom: 30%; left: 10px; transform: translateY(50%); }
          .heat-player-feedback[data-position="5"] { top: 30%; left: 10px; transform: translateY(-50%); }
          .heat-player-feedback[data-position="6"] { top: 15%; right: 20%; }
          .heat-player-feedback[data-position="7"] { bottom: 15%; right: 20%; }
          .heat-player-feedback[data-position="8"] { bottom: 15%; left: 20%; }
          .heat-player-feedback[data-position="9"] { top: 15%; left: 20%; }
          
          .heat-player-feedback.survived {
            border-color: #28a745;
            background-color: #d4edda;
          }
          
          .heat-player-feedback.burned {
            border-color: #dc3545;
            background-color: #f8d7da;
          }
          
          .heat-player-status {
            font-weight: bold;
            font-size: 1rem;
          }
          
          .heat-player-feedback.survived .heat-player-status { color: #28a745; }
          .heat-player-feedback.burned .heat-player-status { color: #dc3545; }
          
          .heat-player-contrib {
            font-size: 0.9rem;
            color: #666;
          }
          
          #heat-pot-feedback {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
          }
          
          #heat-pot-feedback.cooling-deployed #heat-pot-outer {
            background-color: #17a2b8;
            border-color: #138496;
          }
          
          #heat-pot-feedback.no-cooling #heat-pot-outer {
            background-color: #dc3545;
            border-color: #c82333;
          }
          
          #heat-pot-feedback #heat-pot-display {
            width: 80px;
            height: 80px;
            background-color: #4a5568;
            border: 2px solid #2d3748;
            border-radius: 4px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          #heat-pot-feedback #heat-pot-symbol { font-size: 2rem; }
          #heat-pot-total { font-size: 1.5rem; font-weight: bold; color: #cc6600; }
          
          #heat-cooling-status {
            font-size: 1.2rem;
            font-weight: bold;
            text-align: center;
          }
          
          #heat-pot-feedback.cooling-deployed #heat-cooling-status { color: #17a2b8; }
          #heat-pot-feedback.no-cooling #heat-cooling-status { color: #dc3545; }
          
          /* Mobile Responsive */
          @media (max-width: 768px) {
            #heat-game-container, #heat-feedback-container { padding: 1rem; gap: 1.5rem; }
            #heat-game-board { width: 300px; height: 300px; }
            .heat-player, .heat-player-feedback { min-width: 60px; padding: 0.75rem; font-size: 0.8rem; }
            .heat-player-icon { font-size: 1.5rem; }
            #heat-pot-outer { width: 100px; height: 100px; }
            #heat-pot { width: 70px; height: 70px; }
            #heat-pot-symbol { font-size: 1.5rem; }
          }
        </style>
        
        <div id="heat-feedback-container">
          <div id="heat-game-board">
            <div id="heat-players-feedback">
              ${player_names.map((name, index) => `
                <div class="heat-player-feedback ${results.all_players_survived[index] ? 'survived' : 'burned'}" data-position="${index}">
                  <div class="heat-player-icon">👤</div>
                  <div class="heat-player-name">${name}</div>
                  <div class="heat-player-status">
                    ${results.all_players_survived[index] ? 'Survived' : 'Burned'}
                  </div>
                  <div class="heat-player-contrib">
                    Contributed: ${results.all_contributions[index]}
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div id="heat-pot-container">
              <div id="heat-pot-feedback" class="${results.cooling_deployed ? 'cooling-deployed' : 'no-cooling'}">
                <div id="heat-pot-outer">
                  <div id="heat-pot-display">
                    <div id="heat-pot-symbol">${results.cooling_deployed ? '❄️' : '🔥'}</div>
                  </div>
                </div>
                <div id="heat-pot-total">${results.total_group_tokens}</div>
                <div id="heat-cooling-status">
                  ${results.cooling_deployed ? 'Cooling Station Deployed!' : 'No Cooling Station'}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      display_element.innerHTML = html;
      
      // Auto-end trial after showing feedback
      setTimeout(() => {
        endTrial();
      }, 3000);
    };
    
    // End trial function
    const endTrial = () => {
      const results = calculateResults();
      const rt = Math.round(performance.now() - start_time);
      
      const trial_data = {
        tokens_contributed: participant_contributed,
        tokens_kept: participant_tokens_remaining,
        total_group_tokens: results.total_group_tokens,
        cooling_deployed: results.cooling_deployed,
        participant_survived: results.participant_survived,
        all_players_survived: results.all_players_survived,
        all_contributions: results.all_contributions,
        rt: rt,
      };
      
      this.jsPsych.finishTrial(trial_data);
    };
    
    // Handle trial duration
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        if (phase === 'contribution') {
          showFeedbackPhase();
        }
      }, trial.trial_duration);
    }
    
    // Initialize trial
    createContributionPhase();
  }
}

export default HeatCommonResourcesPlugin;
