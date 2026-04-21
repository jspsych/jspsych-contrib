var jsPsychTangram = (function (jspsych) {
  "use strict";

  const info = {
    name: "tangram",
    version: "0.1.0",
    parameters: {
      /**
       * Path to the SVG file containing our puzzle.
       */
      svg: {
        type: jspsych.ParameterType.STRING,
        default: "",
      },

      /**
       * Interaction sound to play when picking up and dropping pieces
       */
      interactionSound: {
        type: jspsych.ParameterType.STRING,
        default: "",
      },

      /**
       * Success sound effect to play when puzzle is solved
       */
      successSound: {
        type: jspsych.ParameterType.STRING,
        default: "",
      },

      /**
       * Failure sound effect to play when puzzle is not solved
       */
      failureSound: {
        type: jspsych.ParameterType.STRING,
        default: "",
      },

      /**
       * Success message
       */
      successMessage: {
        type: jspsych.ParameterType.STRING,
        default: "You won!",
      },

      /**
       * Failure message
       */
      failureMessage: {
        type: jspsych.ParameterType.STRING,
        default: "You lose.",
      },

      /**
       * Toggle whether pieces should auto-reset when placed incorrectly
       */
      resetPieces: {
        type: jspsych.ParameterType.BOOLEAN,
        default: true,
      },

      /**
       * Length of time for a piece to reset to its original position (seconds).
       */
      resetPieceDuration: {
        type: jspsych.ParameterType.Float, // seconds
        default: 1.0,
      },

      /**
       * Distance (in pixels) used for snapping pieces into their solution position. A large radius makes the snapping more forgiving.
       */
      dropThreshold: {
        type: jspsych.ParameterType.INT,
        default: 9,
      },

      /**
       * Length of time before the trial ends (seconds).
       */
      duration: {
        type: jspsych.ParameterType.INT,
        default: 60,
      },

      /**
       * Length of time before the trial ends (seconds).
       */
      overlayImage: {
        type: jspsych.ParameterType.STRING,
        default: "",
      },

      /**
       * Length of time before the trial ends (seconds).
       */
      overlayImagePosition: {
        type: jspsych.ParameterType.STRING,
        default: "TOP_RIGHT",
      },
    },
    data: {
      /** The length of time from the start of the trial to the end of the trial (seconds). */
      solve_duration: {
        type: jspsych.ParameterType.FLOAT,
      },
      /** Percentage puzzle completion. 1 if the puzzle was completely solved; 0 if no piece was correctly placed. */
      puzzle_solved: {
        type: jspsych.ParameterType.FLOAT,
      },
      /** Comma-delimited list of piece names that were correctly placed */
      pieces_solved: {
        type: jspsych.ParameterType.FLOAT,
      },
      /** Number of mouse clicks during this trial. */
      num_total_clicks: {
        type: jspsych.ParameterType.INT,
      },
      /** Number of times a piece was dropped in a location other than the solution location.  */
      num_piece_drops: {
        type: jspsych.ParameterType.INT,
      },
      /** Number of seconds before the first click.  */
      first_click_time: {
        type: jspsych.ParameterType.FLOAT,
      },
    },
    // prettier-ignore
    citations: {
    },
  };

  class TangramPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
      this.tangram = null;
    }

    trial(display_element, trial, on_load) {
      this.display = display_element;
      this.params = trial;

      this.add_css();
      this.add_html();

      // Configure Tangram Game piece behavior
      TangramPiece.duration = safeset(trial.resetPieceDuration, 1.0);
      TangramPiece.ResetPieces = safeset(trial.resetPieces, true);
      TangramPiece.threshold = safeset(trial.dropThreshold, 20);

      // Create and configure Tangram Game
      this.tangram = new TangramGame();
      this.tangram.duration = safeset(trial.duration, 60);
      this.tangram.successMessage = safeset(trial.successMessage, "You won!");
      this.tangram.failureMessage = safeset(trial.failureMessage, "You lose.");
      this.tangram.interactionSound = safeset(trial.interactionSound, "");
      this.tangram.successSound = safeset(trial.successSound, "");
      this.tangram.failureSound = safeset(trial.failureSound, "");
      this.tangram.overlayImage = safeset(trial.overlayImage, "");
      this.tangram.overlayImagePosition = safeset(trial.overlayImagePosition, "TOP_RIGHT");
      this.tangram.overlayImageWidth = safeset(trial.overlayImageWidth, 30);

      if (trial.svg !== "") {
        const svgDoc = document.getElementById("svgObject");
        svgDoc.onload = () => {
          this.tangram.start();
        };
      } else {
        this.tangram.start();
      }

      const end_trial = () => {
        if (typeof keyboardListener !== "undefined") {
          this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
        }

        document.querySelector("#tangram-styles").remove();
        document.querySelector("#container").remove();

        var trial_data = {
          solve_duration: this.tangram.timeBar.elapsedTime(),
          puzzle_solved: this.tangram.percentComplete,
          pieces_solved: this.tangram.piecesSolved,
          num_total_clicks: this.tangram.clickCount,
          num_piece_drops: this.tangram.missDropCount,
          first_click_time: this.tangram.timeToFirstClick,
        };
        this.jsPsych.finishTrial(trial_data);
      };

      var animate_interval = setInterval(() => {
        if (this.tangram.finished) {
          end_trial();
          clearInterval(animate_interval);
        }
      }, 3000);
    }

    add_css() {
      document.querySelector("head").insertAdjacentHTML(
        "beforeend",
        `<style id="tangram-styles">
          html, body {
            margin: 0;
            width: 100%;
            height: 100%;
          }

          #container {
            position: absolute;
            width: 100vw;
            height: 100vh;
          }

          #svgObject, #overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }

          #overlay {
            pointer-events: none; /* clicks go to SVG */
          }
        </style>`
      );
    }

    add_html() {
      document.querySelector("body").insertAdjacentHTML(
        "beforeend",
        `<div id="container">
          <object id="svgObject"
                  type="image/svg+xml"
                  data="${this.params.svg}"
                  preserveAspectRatio="xMidYMid meet">
          </object>
        </div> `
      );
      document
        .querySelector("#container")
        .insertAdjacentHTML("beforeend", `<canvas id="overlay"></canvas>`);
    }
  }

  TangramPlugin.info = info;
  return TangramPlugin;
})(jsPsychModule);
