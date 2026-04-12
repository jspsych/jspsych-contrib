function safeset(inputVal, defaultVal) {
  if (typeof inputVal !== typeof defaultVal) {
    console.warn("Tangram Puzzle: Invalid input type ", inputVal);
  } else if (inputVal !== undefined && inputVal !== null) {
    return inputVal;
  }
  return defaultVal;
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
