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

    this.selectedPiece = null;
    this.puzzlePieces = [];

    this.timeBar = null;
    this.duration = duration; // seconds
    this.lastTime = -1;

    this.interactionSound = "puzzles/tap.mp3";
    this.successSound = "puzzles/magic-spell-short.m4a";
    this.failureSound = "puzzles/sad-trombone.wav";
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

    // The SVG can now be rendered visible because the pieces are in their start positions
    this.svg.style.opacity = "1";

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

    // Initialize canvas for drawing text
    window.addEventListener("resize", (e) => {
      this.resize(e);
    });
    this.resize();
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
      this.draw();
    }

    if (this.puzzleSolved()) {
      this.gameOver = true;
      this.gameOverMessage = this.successMessage;
      this.winSound.play();
      this.draw();
    }

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
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
