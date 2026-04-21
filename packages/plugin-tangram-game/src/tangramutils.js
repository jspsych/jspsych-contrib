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
