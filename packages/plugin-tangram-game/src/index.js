var jsPsychTangram = (function (jspsych) {
  "use strict";

  var version = "0.1.0";

  const info = {
    name: "tangram",
    version,
    parameters: {
      /**
       * Path to the SVG file containing our puzzle.
       */
      svg: {
        type: jspsych.ParameterType.STRING,
        default: "puzzles/puzzle-rocket.svg",
      },

      resetPieces: {
        type: jspsych.ParameterType.BOOLEAN,
        default: true,
      },

      resetPieceDuration: {
        type: jspsych.ParameterType.Float, // seconds
        default: 1.0,
      },

      /**
       * Length of time before the trial ends (seconds).
       */
      duration: {
        type: jspsych.ParameterType.INT,
        default: null,
      },
    },
    data: {
      /** The length of time from the start of the trial to the end of the trial. */
      solve_duration: {
        type: jspsych.ParameterType.INT,
      },
      /** 1 if the puzzle was solved; 0 otherwise */
      puzzle_solved: {
        type: jspsych.ParameterType.INT,
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
    static {
      this.info = info;
    }

    trial(display_element, trial, on_load) {
      this.display = display_element;
      this.params = trial;
      this.add_css();
      this.add_html();

      TangramPiece.duration = trial.resetPieceDuration;
      TangramPiece.ResetPieces = trial.resetPieces;
      this.tangram = new TangramGame(trial.duration);

      const end_trial = () => {
        if (typeof keyboardListener !== "undefined") {
          this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
        }

        document.querySelector("#tangram-styles").remove();
        document.querySelector("#container").remove();

        var trial_data = {
          solve_duration: this.tangram.timeBar.elapsedTime(),
          puzzle_solved: this.tangram.gameOverMessage.includes("won"),
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
                  data="${this.params.svg}"
                  type="image/svg+xml"
                  preserveAspectRatio="xMidYMid meet"
          </object>
          <canvas id="overlay"></canvas>
        </div> `
      );

      const svgDoc = document.getElementById("svgObject");
      svgDoc.onload = () => {
        this.tangram.start();
      };
    }
  }
  return TangramPlugin;
})(jsPsychModule);
