class TimeBar {
  constructor(svg, svgElement, duration) {
    this.svg = svg;
    this.el = svgElement;
    this.timeLeft = duration;
    this.duration = duration;
  }

  elapsedTime() {
    return this.duration - this.timeLeft;
  }

  tick(dt) {
    this.timeLeft = Math.max(0, this.timeLeft - dt);
    var fraction = this.timeLeft / this.duration;
    var width = fraction * this.svg.viewBox.baseVal.width;
    this.el.setAttribute("width", width);
  }
}
