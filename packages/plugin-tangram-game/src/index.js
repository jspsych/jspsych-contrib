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

function safeset(inputVal, defaultVal) {
  if (typeof inputVal !== typeof defaultVal) {
    console.warn("Tangram Puzzle: Invalid input type ", inputVal);
  } else if (inputVal !== undefined && inputVal !== null) {
    return inputVal;
  }
  return defaultVal;
}

function client2svg(px, py, svg, canvas) {
  // Assumes SVG width > height with aspect ratio and midpoint alignment
  var vb = svg.viewBox.baseVal;
  var aspect = canvas.width / canvas.height;
  if (aspect > 2.0) {
    // scale the width
    var scaledWidth = (vb.width / vb.height) * canvas.height;
    var y = (py / canvas.height) * vb.height;
    var x = ((px - (canvas.width - scaledWidth) / 2) / scaledWidth) * vb.width;
  } else {
    // scale the height
    var scaledHeight = (vb.height / vb.width) * canvas.width;
    var x = (px / canvas.width) * vb.width;
    var y = ((py - (canvas.height - scaledHeight) / 2) / scaledHeight) * vb.height;
  }
  //console.log(canvas.height, px, py, "=>", x, y)
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

const jsPsychTangramDefaultPuzzleSVG = `
  <svg
    id="svgObject"
    preserveAspectRatio="xMidYMid meet"
    width="600"
    height="300"
    viewBox="-1 0 600 300"
    version="0.1"
    id="svg5"
    xmlns="http://www.w2.org/2000/svg"
    xmlns:svg="http://www.w2.org/2000/svg">
    <g id="PuzzleLayer" >
      <path
        style="opacity:1;fill:#ff7676;fill-opacity:1;stroke:none;stroke-width:1.36277"
        d="M 90.226414,119.66329 159.36499,51.524708 H 23.087838 Z"
        id="T0"
        />
      <path
        style="opacity:1;fill:#6265ff;fill-opacity:1;stroke:none;stroke-width:1.36277"
        d="m 90.670314,119.87647 -68.138566,-68.138572 -2e-5,136.277162 z"
        id="T1"
        />
      <path
        style="opacity:1;fill:#ffcc4d;fill-opacity:1;stroke:none;stroke-width:1.36277"
        d="m 88.815574,188.0532 68.138596,-68.1386 v 68.1386 z"
        id="T2"
        />
      <path
        style="opacity:1;fill:#ff49e1;fill-opacity:1;stroke:none;stroke-width:2.72554;stroke-linecap:butt;stroke-opacity:1"
        d="m 91.128774,119.77587 -34.069285,34.06929 68.138571,1e-5 z"
        id="T3"
        />
      <path
        style="opacity:1;fill:#66fff4;fill-opacity:1;stroke:none;stroke-width:1.36277"
        d="M 57.163263,153.52636 H 126.30185 L 92.232554,187.59565 H 24.093973 Z"
        id="P"
        />
      <path
        style="opacity:1;fill:#ad54ff;fill-opacity:1;stroke:none;stroke-width:1.36277"
        d="m 123.11366,86.437446 34.0693,34.069304 V 52.368146 Z"
        id="T4"
        />
      <path
        style="opacity:1;fill:#66ff43;fill-opacity:1;stroke:none;stroke-width:2.72554;stroke-linecap:butt;stroke-opacity:1"
        d="m 89.799844,119.61315 34.069296,-34.069304 34.0693,34.069304 -34.0693,34.06929 z"
        id="S"
        />
    </g>
    <g
      id="OutlineLayer"
      transform="translate(0,0)">
      <path
        style="fill:none;stroke:#000000;stroke-opacity:1;stroke-width:2;stroke-dasharray:none"
        d="M 21.964458,49.973559 H 157.43098 V 187.87035 H 22.278404 Z"
        id="path4008" />
    </g>
    <g
      id="TimebarLayer"
      style="image-rendering:auto">
      <rect
        style="fill:#00b500;fill-opacity:1;stroke:none;stroke-width:2.90695;stroke-dasharray:none;stroke-opacity:1"
        id="TimebarInterior"
        width="599"
        height="9"
        x="-1"
        y="289"
        />
      <rect
        style="fill:none;fill-opacity:0;stroke:#000000;stroke-width:1.45347;stroke-dasharray:none;stroke-opacity:1"
        id="TimebarOutline"
        width="599"
        height="9"
        x="-1"
        y="289"
        />
    </g>
  </svg>
`;

class TangramPiece {
  static threshold = 20; // pixels in svg space
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
  constructor() {
    this.canvas = document.getElementById("overlay");
    this.ctx = this.canvas.getContext("2d");
    this.svg = null;

    this.duration = null;
    this.successMessage = "You won!";
    this.failureMessage = "You lost!";
    this.gameOverMessage = "";
    this.gameOver = false;
    this.finished = false;
    this.initialized = false;

    // performance logging
    this.clickCount = 0;
    this.timeToFirstClick = -1;
    this.missDropCount = 0;
    this.percentComplete = 0;
    this.piecesSolved = "";

    this.selectedPiece = null;
    this.puzzlePieces = [];

    this.timeBar = null;
    this.lastTime = -1;

    this.interactionSound = "";
    this.successSound = "";
    this.failureSound = "";
    this.endGameDelay = 3.0;

    this.overlayImage = "";
    this.overlayImagePosition = "";
    this.overlayImageWidth = 30;
    this.overlayIcon = null;

    // Initialize canvas for drawing text
    window.addEventListener("resize", (e) => {
      this.resize(e);
    });
    this.resize();
  }

  mouseClick(e) {
    if (this.gameOver) return;
    if (this.timeToFirstClick === -1) this.timeToFirstClick = this.timeBar.elapsedTime();
    this.clickCount++;

    if (this.selectedPiece != null) {
      // drop it
      var pos = this.selectedPiece.el.getBoundingClientRect();
      var svgpos = client2svg(pos.x, pos.y, this.svg, this.canvas);
      this.selectedPiece.drop(svgpos);
      if (!this.selectedPiece.isAtTarget) this.missDropCount++;
      if (this.soundEffect !== null) this.soundEffect.play();
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
        if (this.soundEffect !== null) this.soundEffect.play();
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
    var svgDoc = obj.contentDocument;
    if (!svgDoc) {
      console.warn("Error: No SVG document loaded. Reverting to default puzzle.");
      obj.removeAttribute("id");
      obj.removeAttribute("data");
      obj.removeAttribute("preserveAspectRatio");
      obj.innerHTML = jsPsychTangramDefaultPuzzleSVG;
      svgDoc = document;
    }

    this.svg = svgDoc.querySelector("svg");
    if (this.svg === null) {
      console.error("Cannot load SVG.");
      return;
    }

    this.svg.addEventListener("mousemove", (e) => {
      this.mouseMove(e);
    });
    this.svg.addEventListener("click", (e) => {
      this.mouseClick(e);
    });

    var idx = 0;
    var x = 275;
    var y = 25;
    var maxheight = 0;
    const puzzleLayer = svgDoc.getElementById("PuzzleLayer");

    // assert that puzzle layer does not have a transform on it
    const transform = puzzleLayer.getAttribute("transform");
    if (transform != undefined) console.error("ERROR: Transform on puzzle layer is not supported");

    for (const el of puzzleLayer.children) {
      var piece = new TangramPiece(el);
      if (x + piece.width > 600) {
        y = y + maxheight + 10;
        x = 275;
        maxheight = 0;
      }
      piece.initPosition(x, y);
      this.puzzlePieces.push(piece);
      //console.log(`${el.id} ${x} ${y}`);

      x = x + piece.width + 10;
      if (maxheight < piece.height) maxheight = piece.height;
      idx = idx + 1;
    }
    // After pieces have their starting positions, we are initialized
    this.initialized = true;

    // Sound effects
    this.soundEffect = null;
    if (this.interactionSound !== "") {
      this.soundEffect = new Audio(this.interactionSound);
    }

    this.winSound = null;
    if (this.successSound !== "") {
      this.winSound = new Audio(this.successSound);
      this.winSound.addEventListener("ended", (e) => {
        this.finished = true;
      });
    }

    this.loseSound = null;
    if (this.failureSound !== "") {
      this.loseSound = new Audio(this.failureSound);
      this.loseSound.addEventListener("ended", (e) => {
        this.finished = true;
      });
    }

    // icon
    this.overlayIcon = null;
    if (this.overlayImage !== "") {
      this.overlayIcon = new Image();
      this.overlayIcon.src = this.overlayImage;
    }

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

  computePuzzleCompletionStats() {
    var placedPieceCount = 0;
    var placedPieceNames = "";
    var sep = "";
    for (const piece of this.puzzlePieces) {
      if (piece.isAtTarget) {
        placedPieceCount++;
        placedPieceNames += sep + piece.el.id;
        sep = ",";
      }
    }
    this.percentComplete = placedPieceCount / this.puzzlePieces.length;
    this.piecesSolved = placedPieceNames;
  }

  tick(timestamp) {
    const dt = (timestamp - this.lastTime) / 1000.0; // convert from milliseconds to seconds
    this.lastTime = timestamp;

    for (var piece of this.puzzlePieces) {
      piece.tick(dt);
    }

    this.timeBar.tick(dt);
    if (this.timeBar.timeLeft <= 0) {
      if (this.selectedPiece) {
        // drop the piece
        var pos = this.selectedPiece.el.getBoundingClientRect();
        var svgpos = client2svg(pos.x, pos.y, this.svg, this.canvas);
        this.selectedPiece.drop(svgpos);
        this.selectedPiece = null;
      }

      this.gameOver = true;
      this.gameOverMessage = this.failureMessage;
      if (this.loseSound !== null) this.loseSound.play();
      else {
        setTimeout(() => {
          this.finished = true;
        }, this.endGameDelay * 1000);
      }
      this.computePuzzleCompletionStats();
    }

    if (this.puzzleSolved()) {
      this.gameOver = true;
      this.gameOverMessage = this.successMessage;
      if (this.winSound !== null) this.winSound.play();
      else {
        setTimeout(() => {
          this.finished = true;
        }, this.endGameDelay * 1000);
      }
      this.computePuzzleCompletionStats();
    }
    this.draw();

    if (!this.gameOver) {
      window.requestAnimationFrame((t) => {
        this.tick(t);
      });
    }
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

    if (this.overlayIcon) {
      var imgw = this.overlayIcon.width;
      var imgh = this.overlayIcon.height;
      var aspect = imgh / imgw;
      var x = 5;
      var y = 5;
      if (this.overlayImagePosition === "TOP_RIGHT") {
        x = this.canvas.width - this.overlayImageWidth - 5;
      }
      this.ctx.drawImage(
        this.overlayIcon,
        x,
        y,
        this.overlayImageWidth,
        this.overlayImageWidth * aspect
      );
    }

    if (this.gameOver) {
      this.ctx.font = "64px Arial";
      this.ctx.textAlign = "center";
      this.ctx.lineWidth = 2;
      var completion = Math.abs(this.percentComplete - 1.0);
      if (completion < 0.001) {
        this.ctx.fillStyle = "#00AA00";
        this.ctx.strokeStyle = "black";
      } else {
        this.ctx.fillStyle = "red";
        this.ctx.strokeStyle = "black";
      }
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
