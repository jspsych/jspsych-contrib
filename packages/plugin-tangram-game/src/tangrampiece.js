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
