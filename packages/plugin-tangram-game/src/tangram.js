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
      this.gameOver = true;
      this.gameOverMessage = this.failureMessage;
      if (this.loseSound !== null) this.loseSound.play();
      else
        setTimeout(() => {
          this.finished = true;
        }, this.endGameDelay * 1000);
    }

    if (this.puzzleSolved()) {
      this.gameOver = true;
      this.gameOverMessage = this.successMessage;
      if (this.winSound !== null) this.winSound.play();
      else
        setTimeout(() => {
          this.finished = true;
        }, this.endGameDelay * 1000);
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
        x = this.canvas.width - imgw - 5;
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
      this.ctx.fillStyle = "red";
      this.ctx.strokeStyle = "black";
      var halfx = this.canvas.width * 0.5;
      var halfy = this.canvas.height * 0.5;
      this.ctx.fillText(this.gameOverMessage, halfx, halfy);
      this.ctx.strokeText(this.gameOverMessage, halfx, halfy);
    }
  }
}
