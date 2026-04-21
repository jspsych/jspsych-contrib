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
