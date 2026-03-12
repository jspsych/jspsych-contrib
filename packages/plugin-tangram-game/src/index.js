class TimeBar {
  constructor(svg, svgElement, duration) {
    this.svg = svg;
    this.el = svgElement;
    this.timeLeft = duration != null ? duration : 99999;
    this.duration = duration;
    this.etime = 0;
  }

  elapsedTime() {
    return this.etime;
  }

  tick(dt) {
    this.etime += dt;

    if (this.duration != null) {
      this.timeLeft = Math.max(0, this.timeLeft - dt);
      var fraction = this.timeLeft / this.duration;
      var width = fraction * this.svg.viewBox.baseVal.width;
      this.el.setAttribute("width", width);
    }
  }
}

function client2svg(px, py, svg, canvas) {
  // Assumes width > height with aspect ratio and midpoint alignment
  var vb = svg.viewBox.baseVal;
  var scaledHeight = (vb.height / vb.width) * canvas.width;
  var x = (px / canvas.width) * vb.width;
  var y = ((py - (canvas.height - scaledHeight) / 2) / scaledHeight) * vb.height;
  return { x: x, y: y };
}

// x is between 0 and 1
function easeInOutSine(x) {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}

function svgComputePath(element) {
  var points = [];
  var i = 0;
  var mode = "\0";
  const supportedOptions = ["m", "M", "l", "L", "h", "H", "v", "V", "z", "Z"];
  const path = element.getAttribute("d").replaceAll(",", " ");
  const tokens = path.split(" ");
  while (i < tokens.length) {
    if (supportedOptions.includes(tokens[i])) {
      mode = tokens[i++];
    } else if (["m", "M", "l", "L"].includes(mode)) {
      // two values
      var x = Number(tokens[i++]);
      var y = Number(tokens[i++]);
      if (points.length == 0 || mode == "M" || mode == "L") {
        // absolute
        points.push({ x: x, y: y });
      } else if (mode == "m" || mode == "l") {
        // relative
        var lastp = points[points.length - 1];
        points.push({ x: lastp.x + x, y: lastp.y + y });
      }
    } else if (["h", "H", "v", "V"]) {
      // single value
      var lastp = points[points.length - 1];
      var u = Number(tokens[i++]);
      if (mode == "h") {
        points.push({ x: lastp.x + u, y: lastp.y });
      } else if (mode == "H") {
        points.push({ x: u, y: lastp.y });
      } else if (mode == "v") {
        points.push({ x: lastp.x, y: lastp.y + u });
      } else if (mode == "V") {
        points.push({ x: lastp.x, y: u });
      }
    } else console.error("Unsupported path format:", path);
  }
  return points;
}

class TangramPiece {
  static threshold = 9; // pixels in svg space
  static duration = 1; // seconds for reset animation
  static NONE = 0;
  static DRAG = 1;
  static ANIMATE = 2;
  static ResetPieces = true;

  constructor(svgElement) {
    this.el = svgElement;

    // Assert that there are no transforms on this puzzle piece
    // Matrix transformations are not currently supported
    const transformList = this.el.transform.baseVal;
    if (transformList.numberOfItems != 0) {
      console.error("ERROR: Unsuppported transform type in puzzle piece.");
    }

    // Initialize polygon points for intersection tests
    // Assume all paths are closed
    this.points = svgComputePath(this.el);

    //console.log("===== ", this.el.id, "=========");
    var newPath = "M ";
    this.x = this.el.getBBox().x;
    this.y = this.el.getBBox().y;
    for (var i = 0; i < this.points.length; i++) {
      this.points[i].x -= this.x;
      this.points[i].y -= this.y;
      newPath += `${this.points[i].x} ${this.points[i].y} `;
      //console.log(this.points[i].x, this.points[i].y);
    }
    newPath += "Z";
    this.el.setAttribute("d", newPath);

    // Save width and height for positioning logic
    this.width = this.el.getBBox().width;
    this.height = this.el.getBBox().height;

    // Use target positions to detect win state
    this.targetx = this.x;
    this.targety = this.y;
    this.isAtTarget = false;
    this.selectedOffsetX = -1;
    this.selectedOffsetY = -1;
    this.state = TangramPiece.NONE; // not moving

    this.translate(this.x, this.y);
    //console.log("puzzle piece:" + this.el.id);
    //console.log(`puzzle bbox: ${this.bbox.x} ${this.bbox.y} ${this.bbox.width} ${this.bbox.height}`);
  }

  initPosition(x, y) {
    this.startx = x;
    this.starty = y;
    this.translate(x, y);
  }

  translate(x, y) {
    // in svg coordinates, e.g. (0,0, width, height)
    this.x = x;
    this.y = y;
    var attrval = `translate(${x} ${y})`;
    this.el.setAttribute("transform", attrval);
  }

  closeTo(pos, x, y) {
    var dSqr = (pos.x - x) * (pos.x - x) + (pos.y - y) * (pos.y - y);
    return dSqr < TangramPiece.threshold * TangramPiece.threshold;
  }

  transformPoint(p) {
    // NOTE: matrix is not needed if we ensure no rotations/skew in pieces
    //var x = matrix.a * p.x + matrix.b * p.y + matrix.e;
    //var y = matrix.c * p.x + matrix.d * p.y + matrix.f;
    return { x: p.x + this.x, y: p.y + this.y };
  }

  drop(svgpos) {
    if (this.state != TangramPiece.DRAG) return;

    if (this.closeTo(svgpos, this.targetx, this.targety)) {
      this.translate(this.targetx, this.targety);
      this.el.removeAttribute("filter");
      this.isAtTarget = true;
    } else {
      this.isAtTarget = false;
      if (TangramPiece.ResetPieces) {
        this.animate(svgpos);
      } else {
        this.translate(svgpos.x, svgpos.y);
        this.el.removeAttribute("filter");
      }
    }
  }

  drag(svgpos) {
    if (this.state != TangramPiece.DRAG) return;
    this.translate(svgpos.x + this.selectedOffsetX, svgpos.y + this.selectedOffsetY);
  }

  pickup(clickPos) {
    if (this.state != TangramPiece.NONE) return;

    this.el.setAttribute("filter", "drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4))");
    this.selectedOffsetX = this.x - clickPos.x;
    this.selectedOffsetY = this.y - clickPos.y;
    this.state = TangramPiece.DRAG;
  }

  checkTriangleIntersection(pos, p1, p2, p3) {
    // computer barycentric coordinates
    var lamnum1 = (p2.y - p3.y) * (pos.x - p3.x) + (p3.x - p2.x) * (pos.y - p3.y);
    var denom = (p2.y - p3.y) * (p1.x - p3.x) + (p3.x - p2.x) * (p1.y - p3.y);
    var lam1 = lamnum1 / denom;
    if (lam1 < 0 || lam1 > 1) return false;

    var lamnum2 = (p3.y - p1.y) * (pos.x - p3.x) + (p1.x - p3.x) * (pos.y - p3.y);
    var lamdom2 = (p2.y - p3.y) * (p1.x - p3.x) + (p3.x - p2.x) * (p1.y - p3.y);
    var lam2 = lamnum2 / denom;
    if (lam2 < 0 || lam2 > 1) return false;

    var lam3 = 1 - lam1 - lam2;
    if (lam3 < 0 || lam3 > 1) return false;

    return true;
  }

  intersects(pos) {
    // in client coordinates

    //NOTE: const numTris = numVerts - 2;
    const numVerts = this.points.length;

    var p1 = this.transformPoint(this.points[0]);
    for (var i = 1; i < numVerts - 1; i++) {
      var p2 = this.transformPoint(this.points[i + 0]);
      var p3 = this.transformPoint(this.points[i + 1]);
      if (this.checkTriangleIntersection(pos, p1, p2, p3)) return true;
    }

    return false;
  }

  tick(dt) {
    if (this.state != TangramPiece.ANIMATE) return;

    this.elapsedTime += dt;
    if (this.elapsedTime < TangramPiece.duration) {
      var u = this.elapsedTime / TangramPiece.duration;
      var t = easeInOutSine(u);
      var xdt = this.dropx * (1 - t) + this.startx * t;
      var ydt = this.dropy * (1 - t) + this.starty * t;
      this.translate(xdt, ydt);
    } else {
      this.translate(this.startx, this.starty);
      this.el.removeAttribute("filter");
      this.state = TangramPiece.NONE;
    }
  }

  animate(svgpos) {
    this.dropx = svgpos.x;
    this.dropy = svgpos.y;
    this.elapsedTime = 0;
    this.state = TangramPiece.ANIMATE;
  }
}

class TangramGame {
  constructor(duration) {
    this.canvas = document.getElementById("overlay");
    this.ctx = this.canvas.getContext("2d");
    this.svg = null;

    this.successMessage = "You Won! :)";
    this.failureMessage = "You lost! :(";
    this.gameOverMessage = "";
    this.gameOver = false;
    this.finished = false;
    this.initialized = false;

    this.selectedPiece = null;
    this.puzzlePieces = [];

    this.timeBar = null;
    this.duration = duration; // seconds
    this.lastTime = -1;

    this.interactionSound = "puzzles/tap.mp3";
    this.successSound = "puzzles/magic-spell-short.m4a";
    this.failureSound = "puzzles/sad-trombone.wav";

    // Initialize canvas for drawing text
    window.addEventListener("resize", (e) => {
      this.resize(e);
    });
    this.resize();
  }

  mouseClick(e) {
    if (this.selectedPiece != null) {
      // drop it
      var pos = this.selectedPiece.el.getBoundingClientRect();
      var svgpos = client2svg(pos.x, pos.y, this.svg, this.canvas);
      this.selectedPiece.drop(svgpos);
      this.soundEffect.play();
      //this.selectedPiece.isAtTarget is true when the piece was correctly placed
      this.selectedPiece = null;
      return;
    }

    // pickup
    var clickPos = client2svg(e.clientX, e.clientY, this.svg, this.canvas);
    this.selectedPiece = null;

    // reverse order because later items display on top of earlier ones
    for (var i = this.puzzlePieces.length - 1; i >= 0; i--) {
      const piece = this.puzzlePieces[i];
      if (piece.intersects(clickPos)) {
        this.selectedPiece = piece;
        this.selectedPiece.pickup(clickPos);
        this.soundEffect.play();
        break;
      }
    }
  }

  mouseMove(e) {
    if (this.selectedPiece == null) return;

    // convert from client coordinates to SVG viewport coordinates
    var svgpos = client2svg(e.clientX, e.clientY, this.svg, this.canvas);
    this.selectedPiece.drag(svgpos);
  }

  start() {
    const obj = document.getElementById("svgObject");
    const svgDoc = obj.contentDocument;
    if (!svgDoc) {
      console.error("Error: No SVG document found.");
      return;
    }

    this.svg = svgDoc.querySelector("svg");
    this.svg.addEventListener("mousemove", (e) => {
      this.mouseMove(e);
    });
    this.svg.addEventListener("click", (e) => {
      this.mouseClick(e);
    });

    var idx = 0;
    var x = 275;
    var y = 25;
    var maxsize = 0;
    const puzzleLayer = svgDoc.getElementById("PuzzleLayer");

    // assert that puzzle layer does not have a transform on it
    const transform = puzzleLayer.getAttribute("transform");
    if (transform != undefined) console.error("ERROR: Transform on puzzle layer is not supported");

    for (const el of puzzleLayer.children) {
      var piece = new TangramPiece(el);
      piece.initPosition(x, y);
      this.puzzlePieces.push(piece);
      //console.log(`${el.id} ${x} ${y}`);

      x = x + piece.width + 10;
      if (maxsize < piece.height) maxsize = piece.height;

      idx = idx + 1;
      if (idx % 3 == 0 && idx < 4) {
        y = y + maxsize + 10;
        x = 275;
      }
    }
    // After pieces have their starting positions, we are initialized
    this.initialized = true;

    // Sound effects
    this.soundEffect = new Audio(this.interactionSound);
    this.winSound = new Audio(this.successSound);
    this.winSound.addEventListener("ended", (e) => {
      this.finished = true;
    });
    this.loseSound = new Audio(this.failureSound);
    this.loseSound.addEventListener("ended", (e) => {
      this.finished = true;
    });

    // initialize time bar
    const barElement = svgDoc.getElementById("TimebarInterior");
    this.timeBar = new TimeBar(this.svg, barElement, this.duration);

    // start puzzle
    this.lastTime = document.timeline.currentTime;
    window.requestAnimationFrame((t) => {
      this.tick(t);
    });
  }

  puzzleSolved() {
    for (const piece of this.puzzlePieces) {
      if (!piece.isAtTarget) return false;
    }
    return true;
  }

  tick(timestamp) {
    const dt = (timestamp - this.lastTime) / 1000.0; // convert from milliseconds to seconds
    this.lastTime = timestamp;

    for (var piece of this.puzzlePieces) {
      piece.tick(dt);
    }

    this.timeBar.tick(dt);
    if (this.timeBar.timeLeft <= 0) {
      this.gameOver = true;
      this.gameOverMessage = this.failureMessage;
      this.loseSound.play();
    }

    if (this.puzzleSolved()) {
      this.gameOver = true;
      this.gameOverMessage = this.successMessage;
      this.winSound.play();
    }
    this.draw();

    if (!this.gameOver)
      window.requestAnimationFrame((t) => {
        this.tick(t);
      });
  }

  resize() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.draw();
  }

  draw() {
    if (!this.initialized) {
      this.ctx.fillStyle = "#ffffff";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    if (this.gameOver) {
      this.ctx.font = "64px Arial";
      this.ctx.textAlign = "center";
      this.ctx.lineWidth = 2;
      this.ctx.fillStyle = "red";
      this.ctx.strokeStyle = "black";
      var halfx = this.canvas.width * 0.5;
      var halfy = this.canvas.height * 0.5;
      this.ctx.fillText(this.gameOverMessage, halfx, halfy);
      this.ctx.strokeText(this.gameOverMessage, halfx, halfy);
    }
  }
}

var jsPsychTangram = (function (jspsych) {
  "use strict";

  const info = {
    name: "tangram",
    version: "0.0.1",
    parameters: {
      /**
       * Path to the SVG file containing our puzzle.
       */
      svg: {
        type: jspsych.ParameterType.STRING,
        default: "puzzles/puzzle-rocket.svg",
      },

      /**
       * Interaction sound to play when picking up and dropping pieces
       */
      interactionSound: {
        type: jspsych.ParameterType.STRING,
        default: "puzzles/tap.mp3",
      },

      /**
       * Success sound effect to play when puzzle is solved
       */
      successSound: {
        type: jspsych.ParameterType.STRING,
        default: "puzzles/magic-spell-short.m4a",
      },

      /**
       * Failure sound effect to play when puzzle is not solved
       */
      failureSound: {
        type: jspsych.ParameterType.STRING,
        default: "puzzles/sad-trombone.wav",
      },

      /**
       * Success message
       */
      successMessage: {
        type: jspsych.ParameterType.STRING,
        default: "You won! :)",
      },

      /**
       * Failure message
       */
      failureMessage: {
        type: jspsych.ParameterType.STRING,
        default: "You lose. :(",
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
       * Length of time before the trial ends (seconds).
       */
      duration: {
        type: jspsych.ParameterType.INT,
        default: null,
      },
    },
    data: {
      /** The length of time from the start of the trial to the end of the trial (seconds). */
      solve_duration: {
        type: jspsych.ParameterType.FLOAT,
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

    trial(display_element, trial, on_load) {
      this.display = display_element;
      this.params = trial;

      this.add_css();
      this.add_html();

      // Configure Tangram Game piece behavior
      TangramPiece.duration = trial.resetPieceDuration;
      TangramPiece.ResetPieces = trial.resetPieces;

      // Create and configure Tangram Game
      this.tangram = new TangramGame(trial.duration);
      this.tangram.successMessage = trial.successMessage;
      this.tangram.failureMessage = trial.failureMessage;
      this.tangram.interactionSound = trial.interactionSound;
      this.tangram.successSound = trial.successSound;
      this.tangram.failureSound = trial.failureSound;

      const svgDoc = document.getElementById("svgObject");
      svgDoc.onload = () => {
        this.tangram.start();
      };

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
