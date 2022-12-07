/**
 * jspsych-copying-task
 * version 0.2
 *
 * Andre Sahakian (modified from Chris Jungerius (modified from Josh de Leeuw))
 *
 * a jsPsych plugin for displaying a basic copying task.
 *
 * documentation: docs.jspsych.org
 *
 * * DONE:
 *  - ensure the right mouse click does not open a menu
 *  - ensure correctly placed items cannot be interacted with
 *  - the model and resource grids are passed as nested lists
 *
 * TO DO:
 *
 **/

var jsPsychCopyingTask = (function (jspsych) {
  "use strict";

  const info = {
    name: "copying-task",
    description: "",
    parameters: {
      model_grid_contents: {
        type: jspsych.ParameterType.HTML_STRING,
        array: true,
        pretty_name: "Items",
        default: undefined,
        description: "The set of items to be used as stimuli",
      },
      resource_grid_contents: {
        type: jspsych.ParameterType.HTML_STRING,
        array: true,
        pretty_name: "Items",
        default: undefined,
        description: "The set of items to be used as stimuli",
      },
      item_file_type: {
        type: jspsych.ParameterType.HTML_STRING,
        array: false,
        pretty_name: "Item file type.",
        default: "img",
        description:
          "What type of file the item is. Can be 'img' (i.e. image files like .png, .jpg, .gif, etc.) or 'svg_path') ",
      },
      item_scale: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Item scale",
        default: 0.8,
        description: "The relative size of items to a grid box",
      },
      grid_box_scale: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Grid Size",
        default: 0.05,
        description: "The scale of a single box in the grid in relation to the canvas width",
      },
      grid_colors: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Grid Colors",
        default: ["green", "black", "darkblue"],
        description:
          "The colors of the grids as such [model color, workspace color, resource color] ",
      },
      prompt: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Prompt",
        default: null,
        description: "Any content here will be displayed below the stimulus.",
      },
      stimulus_duration: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Stimulus duration",
        default: null,
        description: "How long to hide the stimulus.",
      },
      trial_duration: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Trial duration",
        default: null,
        description: "How long to show trial before it ends.",
      },
      canvas_width: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Canvas width",
        default: 1500,
        description: "The width of the canvas element.",
      },
      grid_offset: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Grid offset",
        default: {
          model_x: 0.5,
          model_y: 0.5,
          resource_x: 0.79,
          resource_y: 0.5,
        },
        description: "Offset the location of the grids.",
      },
      mid_border_specs: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Middle border specifications",
        default: {
          width: 0.17,
          left: 0.35,
          color: "rgba(0,0,0,0.5)",
        },
        description:
          "Set specifications of the border dividing the model from the workspace & resources. Width and left are proportions of the canvas width.",
      },
      canvas_aspect_ratio: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Canvas aspect ratio",
        default: 3,
        description: 'The aspect ratio the canvas element: "How many times wider than high?" ',
      },
      allow_incorr_placement: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Allow incorrect placement of items",
        default: false,
        description: "If true, it is allowed to place items in incorrect grid posititons.",
      },
      lock_correct_placement: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Allow incorrect placement of items",
        default: true,
        description: "If true, a correctly placed items cannot be moved anymore.",
      },
      twenty_svg_paths: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "SVG paths of twenty items",
        array: true,
        default: [
          "M82.400 34.852 C 82.400 34.981,93.193 60.349,106.385 91.225 C 119.577 122.101,130.332 147.398,130.285 147.440 C 130.238 147.482,122.288 140.876,112.618 132.759 C 102.948 124.641,94.938 118.001,94.818 118.001 C 94.698 118.002,93.809 120.320,92.843 123.154 L 91.085 128.305 157.373 219.389 C 193.831 269.485,223.602 310.519,223.530 310.577 C 223.459 310.634,201.354 308.282,174.409 305.351 C 147.465 302.419,125.303 300.151,125.161 300.311 C 124.799 300.716,121.579 310.513,121.751 310.684 C 121.950 310.883,257.772 365.564,257.843 365.474 C 257.875 365.433,255.482 349.110,252.526 329.200 L 247.150 293.000 252.415 275.600 C 255.310 266.030,257.801 258.069,257.950 257.910 C 258.099 257.750,268.258 261.607,280.527 266.482 L 302.833 275.345 305.416 272.784 C 306.837 271.375,308.000 270.116,308.000 269.985 C 308.000 269.853,299.175 259.861,288.389 247.779 C 271.155 228.476,268.806 225.691,269.010 224.806 C 269.138 224.253,278.373 194.820,289.532 159.400 C 305.640 108.270,309.695 94.977,309.210 94.886 C 308.875 94.824,276.308 99.108,236.840 104.406 C 197.371 109.704,164.881 113.962,164.640 113.868 C 164.270 113.723,95.792 47.793,85.700 37.864 C 83.885 36.079,82.400 34.723,82.400 34.852 ",
          "M215.000 116.221 C 157.580 133.248,110.053 147.287,109.385 147.418 C 108.324 147.627,105.324 146.012,85.619 134.629 C 73.215 127.463,63.027 121.645,62.978 121.700 C 62.929 121.755,68.170 131.790,74.624 144.000 C 81.078 156.210,86.415 166.341,86.484 166.513 C 86.553 166.686,90.027 166.282,94.204 165.617 C 98.382 164.951,102.187 164.405,102.661 164.403 C 103.305 164.401,160.258 208.236,162.951 210.807 C 163.145 210.992,159.843 213.722,155.551 216.925 C 147.851 222.670,147.765 222.752,142.600 229.135 C 139.740 232.670,137.183 235.570,136.919 235.581 C 136.654 235.591,111.657 228.032,81.370 218.782 C 51.083 209.532,26.245 202.022,26.174 202.092 C 26.063 202.204,225.394 332.379,229.194 334.676 L 230.643 335.552 259.405 319.972 C 275.225 311.403,288.293 304.259,288.446 304.096 C 288.599 303.933,281.832 296.630,273.408 287.866 L 258.093 271.932 259.373 267.066 C 260.077 264.390,266.128 240.370,272.819 213.689 L 284.984 165.178 326.280 134.289 C 348.993 117.300,367.576 103.310,367.575 103.200 C 367.574 102.960,358.961 96.254,358.424 96.075 C 358.217 96.006,354.427 97.871,350.001 100.219 C 345.576 102.567,341.904 104.424,341.842 104.344 C 341.779 104.265,342.614 100.899,343.696 96.865 C 344.777 92.830,345.604 89.482,345.531 89.424 C 345.377 89.299,319.894 85.175,319.600 85.227 C 319.490 85.247,272.420 99.194,215.000 116.221 ",
          "M29.752 46.100 C 30.786 47.732,120.887 204.161,121.075 204.651 C 121.176 204.915,109.092 218.387,94.220 234.588 C 79.348 250.790,67.276 264.199,67.391 264.386 C 67.507 264.574,70.307 266.293,73.613 268.208 L 79.624 271.688 100.912 261.596 C 112.620 256.046,122.474 251.426,122.809 251.330 C 123.304 251.187,123.703 252.622,124.962 259.077 C 125.812 263.435,126.618 267.123,126.754 267.272 C 126.889 267.422,132.760 264.049,139.800 259.777 C 146.840 255.504,152.815 252.052,153.078 252.104 C 153.341 252.157,168.064 274.070,185.797 300.800 C 205.581 330.623,218.301 349.434,218.719 349.489 C 219.094 349.538,222.550 348.992,226.400 348.277 L 233.400 346.977 233.291 345.188 C 233.231 344.205,230.756 314.809,227.791 279.865 C 224.826 244.921,222.400 215.851,222.401 215.265 C 222.401 214.236,265.651 190.832,266.744 191.270 C 266.923 191.341,284.381 210.426,305.541 233.680 C 326.700 256.934,344.234 276.102,344.506 276.276 C 345.307 276.787,367.728 286.806,367.831 286.698 C 367.883 286.644,350.283 261.940,328.720 231.800 C 307.158 201.660,289.302 176.699,289.042 176.331 C 288.604 175.713,288.069 175.704,281.984 176.222 C 270.675 177.185,271.553 177.608,267.394 169.200 C 265.188 164.739,262.014 159.602,261.531 159.707 C 261.297 159.758,261.058 159.530,261.000 159.200 C 260.374 155.686,256.984 151.883,236.452 131.664 L 216.200 111.721 193.415 131.642 C 180.883 142.598,170.575 151.508,170.508 151.442 C 170.442 151.375,168.773 142.446,166.800 131.600 C 164.827 120.754,163.152 111.818,163.077 111.744 C 162.870 111.537,29.573 45.200,29.364 45.200 C 29.264 45.200,29.438 45.605,29.752 46.100 ",
          "M146.517 105.247 L 142.478 107.645 147.982 118.922 C 151.008 125.125,155.411 134.044,157.766 138.743 C 160.120 143.442,161.957 147.376,161.847 147.487 C 161.737 147.597,138.641 151.802,110.523 156.831 C 82.406 161.861,59.018 166.069,58.551 166.183 C 57.715 166.386,73.891 209.628,75.337 211.057 C 75.592 211.308,97.220 217.852,123.400 225.599 C 149.580 233.346,171.141 239.815,171.312 239.974 C 171.484 240.134,140.659 261.282,102.812 286.971 C 64.966 312.659,34.000 333.732,34.000 333.801 C 34.000 333.968,31.441 334.979,149.400 288.177 C 206.380 265.569,253.451 246.996,254.002 246.905 C 254.553 246.813,277.750 250.990,305.550 256.188 C 333.351 261.385,356.188 265.545,356.301 265.433 C 356.474 265.259,336.153 244.306,315.683 223.552 L 309.915 217.705 308.135 207.952 C 307.157 202.589,306.231 198.085,306.078 197.945 C 305.925 197.804,297.302 193.216,286.916 187.748 C 276.530 182.281,268.160 177.686,268.316 177.539 C 268.550 177.318,329.805 144.355,333.836 142.282 L 335.072 141.646 333.117 132.538 C 332.042 127.528,331.076 123.342,330.969 123.236 C 330.863 123.129,303.466 127.311,270.088 132.529 C 236.709 137.746,209.090 142.012,208.711 142.008 C 208.332 142.003,195.282 133.306,179.711 122.679 C 164.140 112.053,151.210 103.244,150.978 103.104 C 150.745 102.963,148.738 103.928,146.517 105.247 ",
          "M207.267 81.673 C 207.083 82.183,200.208 101.908,191.990 125.508 C 183.771 149.107,176.905 168.367,176.732 168.308 C 176.559 168.248,152.552 151.216,123.384 130.458 C 94.215 109.700,70.301 92.780,70.241 92.858 C 70.180 92.936,81.706 118.560,95.853 149.800 C 110.000 181.040,121.687 206.991,121.823 207.470 C 121.969 207.980,116.749 232.624,109.214 267.004 C 102.142 299.270,96.411 325.820,96.478 326.004 C 96.600 326.338,335.097 231.856,335.737 231.220 C 336.039 230.921,343.741 160.408,343.499 160.166 C 343.444 160.111,337.654 168.871,330.632 179.632 C 323.610 190.393,317.779 199.113,317.675 199.008 C 317.571 198.904,316.384 191.030,315.038 181.511 L 312.590 164.203 261.195 123.283 C 232.928 100.777,209.305 81.999,208.700 81.554 L 207.601 80.746 207.267 81.673 ",
          "M169.276 39.869 C 169.064 40.271,166.507 46.450,163.594 53.600 C 160.681 60.750,158.157 66.755,157.986 66.943 C 157.726 67.229,111.986 64.446,106.500 63.812 C 105.565 63.704,104.804 63.747,104.808 63.908 C 104.812 64.068,113.292 75.427,123.652 89.149 C 134.012 102.871,142.306 114.211,142.083 114.349 C 103.288 138.389,66.536 161.463,66.735 161.654 C 66.881 161.794,90.760 170.415,119.800 180.812 C 148.840 191.210,172.805 199.915,173.055 200.158 C 173.306 200.401,177.242 210.860,181.802 223.400 C 186.363 235.940,190.209 246.414,190.349 246.676 C 190.492 246.942,192.949 243.370,195.940 238.547 C 198.875 233.815,201.331 230.001,201.398 230.071 C 201.886 230.586,213.184 258.150,212.988 258.348 C 212.850 258.486,175.266 265.013,129.469 272.852 C 83.671 280.690,46.470 287.209,46.800 287.338 C 47.130 287.466,96.720 302.885,157.000 321.601 C 217.280 340.318,267.061 355.783,267.625 355.968 C 268.634 356.301,269.158 355.439,301.949 299.510 C 320.263 268.272,335.164 242.631,335.063 242.530 C 334.961 242.428,316.304 236.791,293.603 230.003 C 270.901 223.215,252.277 217.602,252.216 217.530 C 252.155 217.459,248.561 183.835,244.230 142.811 C 239.899 101.787,236.320 68.196,236.278 68.164 C 236.210 68.114,171.391 39.863,170.131 39.335 C 169.873 39.226,169.488 39.467,169.276 39.869 ",
          "M259.421 81.292 L 211.443 82.895 125.621 131.296 C 27.790 186.471,36.947 181.235,37.656 181.598 C 37.955 181.751,82.437 195.899,136.504 213.038 C 200.569 233.346,234.747 244.360,234.632 244.660 C 234.333 245.440,213.134 271.251,212.635 271.442 C 212.377 271.541,170.437 278.449,119.435 286.793 C 68.432 295.137,26.655 302.017,26.596 302.082 C 26.399 302.301,27.922 318.456,28.163 318.696 C 28.294 318.828,78.109 311.343,138.863 302.063 C 199.617 292.784,249.399 285.265,249.488 285.355 C 249.578 285.444,246.130 291.006,241.826 297.715 C 237.521 304.423,234.000 310.082,234.000 310.291 C 234.000 310.683,271.896 325.864,272.133 325.567 C 272.206 325.475,275.828 312.710,280.182 297.200 C 284.537 281.690,288.231 268.855,288.391 268.679 C 288.552 268.502,298.536 277.020,310.579 287.607 C 322.622 298.195,332.528 306.800,332.593 306.729 C 332.657 306.658,331.395 297.960,329.787 287.401 C 328.180 276.841,326.896 268.171,326.933 268.134 C 326.971 268.096,333.256 266.933,340.901 265.549 C 352.117 263.518,354.796 262.913,354.778 262.416 C 354.767 262.077,346.163 220.850,335.658 170.800 L 316.560 79.800 311.980 79.745 C 309.461 79.715,285.810 80.411,259.421 81.292 ",
          "M165.024 143.836 L 105.849 263.600 95.824 263.657 C 90.311 263.688,76.638 263.823,65.441 263.957 L 45.082 264.200 104.550 322.400 C 137.257 354.410,164.143 380.600,164.297 380.600 C 164.450 380.600,166.955 358.460,169.863 331.400 C 172.771 304.340,175.206 281.695,175.275 281.078 C 175.507 278.999,204.568 247.233,204.718 248.895 C 204.782 249.613,203.922 269.890,202.806 293.956 C 201.691 318.021,200.828 337.759,200.889 337.818 C 201.056 337.979,349.568 149.857,349.613 149.428 C 349.634 149.223,336.115 144.233,319.571 138.339 C 303.026 132.446,289.416 127.550,289.326 127.459 C 289.236 127.369,290.233 121.829,291.541 115.148 C 292.850 108.466,293.879 102.955,293.828 102.901 C 293.777 102.847,275.480 117.720,253.168 135.954 C 230.855 154.187,212.572 169.081,212.537 169.052 C 212.503 169.024,215.149 136.426,218.417 96.613 C 221.685 56.800,224.323 24.191,224.279 24.149 C 224.236 24.107,197.571 77.966,165.024 143.836 ",
          "M174.301 91.735 C 100.437 114.651,40.003 133.490,40.003 133.600 C 40.003 133.710,44.423 137.850,49.824 142.800 L 59.646 151.800 59.409 155.000 C 59.278 156.760,57.653 184.660,55.796 217.000 C 53.939 249.340,52.369 276.565,52.307 277.500 C 52.245 278.435,52.293 279.200,52.413 279.200 C 52.533 279.200,77.344 258.317,107.548 232.793 L 162.465 186.385 164.933 188.457 C 166.290 189.596,172.260 194.577,178.200 199.526 C 184.140 204.475,189.318 208.796,189.706 209.129 C 190.376 209.704,190.383 209.654,189.850 208.167 C 179.178 178.435,171.604 156.994,171.690 156.759 C 171.750 156.593,184.490 163.179,200.000 171.394 L 228.200 186.329 228.307 187.865 C 228.366 188.709,229.305 227.089,230.393 273.153 C 231.482 319.217,232.447 356.980,232.539 357.072 C 232.771 357.304,341.774 237.316,341.915 236.672 C 342.052 236.050,309.307 51.701,308.888 50.735 C 308.637 50.156,291.301 55.437,174.301 91.735 ",
          "M67.591 65.300 C 67.586 66.015,67.320 94.770,67.000 129.200 C 66.680 163.630,66.414 198.120,66.409 205.843 L 66.400 219.887 115.100 267.897 L 163.800 315.907 167.761 343.254 C 169.939 358.294,171.761 370.652,171.810 370.716 C 171.974 370.930,285.386 291.910,286.439 290.848 C 287.186 290.093,338.325 206.599,361.925 167.600 C 362.258 167.050,341.279 187.822,315.305 213.760 L 268.078 260.920 258.746 251.360 C 253.614 246.102,247.591 239.910,245.362 237.600 L 241.309 233.400 265.087 189.000 C 278.165 164.580,288.964 144.363,289.086 144.073 C 289.207 143.782,280.445 147.977,269.614 153.393 C 258.783 158.809,249.799 163.186,249.648 163.120 C 249.498 163.054,252.642 141.670,256.636 115.600 C 260.629 89.530,263.861 68.155,263.816 68.101 C 263.771 68.046,254.227 91.986,242.607 121.301 C 230.987 150.615,221.085 175.500,220.604 176.600 L 219.728 178.600 209.207 184.110 C 203.420 187.140,198.643 189.570,198.591 189.510 C 198.539 189.449,196.721 161.680,194.551 127.800 C 191.896 86.350,190.515 66.920,190.330 68.400 C 190.178 69.610,188.654 91.499,186.943 117.043 L 183.833 163.485 175.917 169.018 C 169.127 173.764,168.000 174.697,168.001 175.576 C 168.001 176.139,168.817 183.705,169.813 192.388 C 170.809 201.072,171.574 208.399,171.512 208.670 C 171.451 208.942,148.102 176.502,119.628 136.582 C 91.153 96.662,67.798 64.000,67.728 64.000 C 67.657 64.000,67.596 64.585,67.591 65.300 ",
          "M104.282 136.998 L 84.765 225.192 100.639 257.995 L 116.513 290.798 104.527 317.499 C 97.935 332.184,92.594 344.270,92.659 344.355 C 92.723 344.440,101.807 338.534,112.844 331.231 C 123.881 323.927,133.047 318.098,133.211 318.276 C 133.376 318.454,137.437 327.819,142.236 339.086 C 147.035 350.353,151.016 359.517,151.083 359.451 C 151.149 359.384,150.200 344.337,148.974 326.012 C 147.749 307.687,146.893 292.560,147.073 292.397 C 147.253 292.233,175.750 268.292,210.400 239.195 C 245.050 210.097,273.790 185.938,274.266 185.508 C 274.975 184.867,282.072 183.508,313.371 178.024 C 334.403 174.338,351.704 171.229,351.818 171.115 C 352.079 170.854,324.204 144.639,323.509 144.492 C 323.229 144.433,312.292 147.795,299.204 151.963 C 286.116 156.131,275.375 159.509,275.335 159.469 C 275.295 159.429,277.294 152.502,279.778 144.076 C 282.261 135.650,284.092 128.833,283.846 128.928 C 283.601 129.022,251.041 143.729,211.491 161.608 C 171.941 179.487,139.476 194.010,139.347 193.880 C 139.217 193.750,135.756 161.055,131.656 121.223 C 127.555 81.391,124.110 48.802,124.000 48.802 C 123.890 48.803,115.017 88.491,104.282 136.998 ",
          "M227.907 36.072 C 227.593 37.463,223.390 56.914,218.568 79.297 C 213.745 101.680,209.678 119.995,209.528 119.997 C 209.378 119.999,204.518 114.161,198.728 107.024 C 192.938 99.888,188.107 94.038,187.993 94.024 C 187.880 94.011,186.262 116.964,184.398 145.031 C 182.534 173.098,180.902 196.235,180.770 196.448 C 180.639 196.661,156.247 181.657,126.566 163.108 C 96.885 144.558,71.880 128.953,71.000 128.430 C 69.506 127.542,69.575 127.662,72.043 130.240 C 82.421 141.078,271.487 335.028,271.778 335.135 C 272.438 335.377,321.597 232.262,321.066 231.753 C 320.576 231.282,253.602 170.058,253.122 169.641 C 252.969 169.509,247.420 138.891,240.791 101.603 C 234.162 64.314,228.680 33.746,228.608 33.675 C 228.537 33.603,228.221 34.682,227.907 36.072 ",
          "M186.400 81.601 L 113.000 109.974 108.400 109.979 C 105.870 109.982,95.880 109.721,86.200 109.399 C 76.520 109.077,67.470 108.810,66.090 108.807 L 63.579 108.800 72.795 119.281 C 78.889 126.211,81.840 129.851,81.506 130.024 C 81.228 130.169,68.792 135.573,53.872 142.035 C 34.644 150.362,26.955 153.867,27.472 154.072 C 28.735 154.574,231.659 201.674,231.828 201.505 C 231.917 201.416,217.187 194.166,199.095 185.393 C 181.003 176.620,163.182 167.972,159.493 166.175 L 152.786 162.907 160.780 156.446 C 165.176 152.893,169.036 149.884,169.358 149.761 C 169.754 149.609,304.612 199.795,305.864 200.561 C 305.988 200.637,332.773 304.160,332.687 304.233 C 332.639 304.274,314.510 288.748,292.400 269.732 C 245.052 229.009,248.195 231.625,251.636 235.801 C 253.086 237.560,274.391 263.660,298.982 293.800 C 323.572 323.940,343.923 348.846,344.206 349.146 C 344.681 349.650,367.328 347.205,367.950 346.583 C 368.046 346.487,358.708 315.041,347.198 276.704 L 326.271 207.000 293.435 130.106 C 275.376 87.814,260.420 53.215,260.200 53.220 C 259.980 53.224,226.770 65.996,186.400 81.601 ",
          "M185.400 165.225 C 131.500 213.649,86.917 253.749,86.328 254.335 C 85.245 255.410,68.574 358.307,69.356 359.089 C 69.714 359.447,64.397 365.793,128.594 288.400 C 191.554 212.501,187.490 217.356,187.795 217.661 C 187.912 217.779,183.784 230.516,178.620 245.965 C 173.457 261.415,169.450 273.990,169.716 273.908 C 169.982 273.827,182.686 259.507,197.947 242.086 C 213.208 224.665,225.853 210.509,226.047 210.629 C 226.245 210.751,226.400 222.117,226.400 236.512 C 226.400 261.779,226.412 262.166,227.164 261.389 C 227.584 260.955,243.533 239.090,262.607 212.800 C 281.680 186.510,297.360 164.922,297.450 164.827 C 297.926 164.321,299.582 168.635,313.035 205.422 C 327.778 245.738,327.838 245.896,328.202 245.531 C 328.418 245.315,324.049 123.179,323.774 121.751 C 323.595 120.821,284.718 77.468,283.903 77.290 C 283.626 77.230,239.300 116.800,185.400 165.225 ",
          "M159.076 50.500 C 151.184 65.302,26.400 304.472,26.400 304.796 C 26.400 305.485,25.181 305.720,137.200 283.443 C 197.370 271.476,246.730 261.806,246.890 261.952 C 247.118 262.163,252.400 310.522,252.400 312.407 C 252.400 312.677,252.718 312.810,253.116 312.706 C 254.649 312.305,365.572 235.036,365.176 234.645 C 364.824 234.297,222.379 199.087,222.170 199.297 C 222.052 199.415,225.316 206.727,229.424 215.545 C 233.532 224.364,236.803 231.815,236.692 232.105 C 236.448 232.739,213.604 243.650,213.131 243.358 C 212.949 243.245,212.800 241.107,212.800 238.607 L 212.800 234.060 191.500 217.212 C 179.785 207.946,170.152 200.147,170.094 199.882 C 170.035 199.617,175.390 185.902,181.994 169.405 C 188.597 152.907,194.000 139.182,194.000 138.904 C 194.000 138.626,187.025 134.974,178.500 130.789 C 169.975 126.604,162.775 122.880,162.500 122.514 C 162.108 121.991,162.000 113.680,162.000 84.124 C 162.000 61.360,161.854 46.400,161.631 46.400 C 161.428 46.400,160.278 48.245,159.076 50.500 ",
          "M342.573 83.992 C 341.708 85.857,326.780 119.049,309.400 157.753 L 277.800 228.122 260.435 237.476 C 250.264 242.956,242.923 246.683,242.714 246.474 C 242.518 246.278,228.855 218.506,212.352 184.759 C 195.848 151.011,182.191 123.242,182.001 123.048 C 181.392 122.427,181.272 124.670,179.617 167.400 C 177.731 216.073,177.672 217.200,177.013 217.200 C 176.747 217.200,159.535 207.726,138.765 196.147 C 102.907 176.156,99.600 174.367,99.600 174.953 C 99.600 175.088,102.480 197.221,106.000 224.138 C 109.520 251.054,112.400 273.633,112.400 274.312 C 112.400 275.523,111.702 275.967,77.013 296.799 C 57.550 308.487,41.215 318.393,40.713 318.812 L 39.800 319.573 41.800 319.573 C 42.900 319.573,58.380 318.791,76.200 317.836 L 108.600 316.098 144.924 327.649 C 164.902 334.002,181.492 339.200,181.791 339.200 C 182.309 339.200,183.276 336.875,190.423 318.456 C 191.819 314.857,193.150 311.842,193.381 311.755 C 193.611 311.669,209.532 309.177,228.760 306.219 C 247.988 303.261,263.876 300.684,264.067 300.493 C 264.264 300.296,263.709 297.151,262.785 293.233 C 261.888 289.432,261.210 285.951,261.277 285.498 C 261.389 284.747,263.935 284.110,290.463 278.194 C 323.192 270.896,320.708 271.538,320.983 270.317 C 321.485 268.089,344.428 82.218,344.295 81.454 C 344.188 80.841,343.703 81.556,342.573 83.992 ",
          "M69.200 64.761 C 69.200 65.007,75.058 93.511,82.219 128.104 L 95.237 191.000 88.192 260.940 C 84.317 299.407,81.246 330.980,81.368 331.101 C 81.715 331.449,81.514 332.024,104.434 265.253 C 116.394 230.412,126.390 201.825,126.647 201.726 C 126.905 201.628,142.929 209.142,162.258 218.424 C 181.586 227.707,197.983 235.581,198.695 235.922 C 200.716 236.892,200.691 236.783,196.017 224.318 C 191.086 211.167,191.150 211.408,192.700 211.724 C 193.305 211.847,227.722 218.980,269.181 227.574 C 349.929 244.312,346.171 243.575,344.989 242.448 C 344.555 242.035,304.690 214.475,256.400 181.204 C 208.110 147.934,168.284 120.411,167.898 120.043 C 167.289 119.463,167.039 117.087,166.021 102.229 C 165.374 92.800,164.700 84.942,164.523 84.767 C 164.345 84.592,156.910 90.375,148.000 97.617 C 138.625 105.238,131.509 110.747,131.110 110.693 C 130.731 110.642,116.927 100.294,100.435 87.697 C 70.791 65.055,69.200 63.886,69.200 64.761 ",
          "M86.230 104.673 C 86.687 105.073,110.666 122.410,139.516 143.200 C 168.367 163.990,191.978 181.204,191.986 181.453 C 192.001 181.936,149.022 201.622,147.982 201.608 C 147.559 201.603,144.865 196.119,139.421 184.181 C 133.032 170.170,131.353 166.807,130.839 166.996 C 130.487 167.124,110.811 180.138,87.114 195.915 L 44.027 224.600 36.959 237.712 C 33.072 244.924,29.998 250.931,30.127 251.061 C 30.257 251.191,57.057 250.936,89.682 250.494 C 122.683 250.047,149.163 249.843,149.368 250.034 C 149.592 250.242,148.829 260.662,147.431 276.488 C 144.761 306.721,144.775 304.959,147.200 305.119 C 148.190 305.184,159.980 305.849,173.400 306.596 L 197.800 307.956 216.551 316.378 C 226.864 321.010,235.459 324.800,235.651 324.800 C 236.183 324.800,236.340 325.680,230.570 296.273 C 226.873 277.435,225.245 268.329,225.470 267.752 C 225.651 267.286,248.660 242.750,276.600 213.229 C 304.540 183.707,327.454 159.315,327.520 159.025 C 327.668 158.372,344.951 162.372,207.200 131.182 C 83.577 103.191,84.861 103.473,86.230 104.673 ",
          "M232.200 68.465 C 216.800 72.434,203.992 75.888,203.737 76.141 C 203.483 76.393,200.008 89.110,196.016 104.400 C 192.023 119.690,188.662 132.523,188.546 132.917 C 188.287 133.799,161.366 162.955,160.664 163.114 C 160.386 163.177,147.782 152.407,132.655 139.181 C 117.527 125.955,104.932 115.217,104.666 115.319 C 103.931 115.601,54.277 253.059,54.672 253.720 C 55.471 255.058,102.526 306.800,102.944 306.800 C 103.201 306.800,111.388 298.333,121.139 287.984 C 133.878 274.463,139.055 269.223,139.534 269.366 C 141.576 269.974,329.777 315.600,330.242 315.600 C 331.304 315.600,330.674 314.839,302.700 282.363 C 287.245 264.421,274.373 249.463,274.095 249.124 C 273.734 248.683,271.886 222.161,267.601 155.954 C 260.744 50.007,261.565 61.429,260.800 61.328 C 260.470 61.284,247.600 64.496,232.200 68.465 ",
          "M203.995 41.900 C 203.963 44.042,182.389 228.168,182.142 228.408 C 181.954 228.591,151.495 209.846,114.455 186.752 C 77.416 163.658,46.921 144.826,46.689 144.904 C 46.457 144.981,47.233 146.114,48.414 147.422 C 75.188 177.072,238.111 356.400,238.274 356.400 C 238.401 356.400,257.156 350.471,279.952 343.225 C 302.749 335.979,322.885 329.581,324.700 329.008 C 326.515 328.434,327.990 327.748,327.977 327.483 C 327.965 327.217,306.955 311.789,281.288 293.199 L 234.621 259.398 230.181 235.599 C 227.739 222.509,225.612 211.129,225.454 210.310 L 225.167 208.819 259.042 172.510 C 277.674 152.539,293.735 135.349,294.735 134.309 C 295.734 133.269,296.426 132.293,296.272 132.139 C 296.118 131.985,278.793 134.256,257.772 137.185 C 235.630 140.271,219.409 142.362,219.212 142.156 C 219.026 141.960,215.788 119.840,212.017 93.000 C 204.265 37.829,204.827 41.600,204.355 41.600 C 204.160 41.600,203.998 41.735,203.995 41.900 ",
        ],
        description: "SVG paths of twenty items",
      },
    },
  };

  /**
   * **copying-task**
   *
   * SHORT PLUGIN DESCRIPTION:
   * A plugin for running a copying task: a model grid on the left has to be recreated
   * in the middle grid, using items from the right grid.
   *
   * @author Andre Sahakian
   * @see {@link https://DOCUMENTATION_URL DOCUMENTATION LINK TEXT}
   */

  class CopyingTaskPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      ///////////////////////////////////////////////////////////////////////
      /* SECTION 0: Setup html and Fabric canvas*/

      // set canvas dimensions
      var canvas_width = trial.canvas_width;
      var canvas_height = canvas_width / trial.canvas_aspect_ratio;

      // set the grid box size as percentage of the canvas
      var grid_box_size = canvas_width * trial.grid_box_scale;

      // create the html
      var html =
        '<div id="jspsych-canvas-copying-task">' +
        '<canvas id="jspsych-canvas-stimulus" height="' +
        canvas_height +
        '" width="' +
        canvas_width +
        '"></canvas>' +
        "</div>";

      // add prompt
      if (trial.prompt !== null) {
        html += trial.prompt;
      }

      // set the innerHTML of the display element
      display_element.innerHTML = html;

      // create a Fabric.js canvas with properties
      var canvas = new fabric.Canvas("jspsych-canvas-stimulus", {
        selection: false, // Turn off the blue selection rectangle feature
        hoverCursor: "pointer",
        moveCursor: "pointer",
        backgroundColor: "lightgray",
      });

      // Track the trial events

      var trial_events = [];

      ///////////////////////////////////////////////////////////////////////
      /* SECTION 1: Create the grids and background, and add them to the canvas*/
      var mid_border_left = canvas_width * trial.mid_border_specs["left"];
      var mid_border_width = canvas_width * trial.mid_border_specs["width"];
      var mid_border_right = mid_border_left + mid_border_width;

      // get the number of rows and cols in the model and resource grid
      var n_model_rows = trial.model_grid_contents.length; // rows
      var n_model_cols = trial.model_grid_contents[0].length; // cols

      var n_resource_rows = trial.resource_grid_contents.length; // rows
      var n_resource_cols = trial.resource_grid_contents[0].length; // cols

      // set the top and left positions of grids on the canvas
      // model grid
      var mdl_grid_top =
        canvas_height * trial.grid_offset["model_y"] - n_model_rows * grid_box_size * 0.5; // vertically centered
      var mdl_grid_left =
        mid_border_left * trial.grid_offset["model_x"] - n_model_cols * grid_box_size * 0.5; // horizontally centered between the mid left border & left canvas edge

      // resource grid
      var rsc_grid_top =
        canvas_height * trial.grid_offset["resource_y"] - n_resource_rows * grid_box_size * 0.5; // vertically centered
      var rsc_grid_left = canvas_width * trial.grid_offset["resource_x"]; // left edge of grid at at 79% canvas width

      // workspace grid
      var wsp_grid_top = canvas_height * 0.5 - n_model_rows * grid_box_size * 0.5; // vertically centered
      var wsp_grid_left =
        mid_border_right +
        (rsc_grid_left - mid_border_right) * 0.5 -
        n_model_cols * grid_box_size * 0.5; // horizontally centered between the mid right border & left resource grid edge

      // create 2 d arrays
      var model_grid = Array.from(Array(n_model_rows), () => new Array(n_model_cols));
      var workspace_grid = Array.from(Array(n_model_rows), () => new Array(n_model_cols));
      var resource_grid = Array.from(Array(n_resource_rows), () => new Array(n_resource_cols));

      // fill the MODEL & WORKSPACE grid (arrays) with box objects and values
      for (var row = 0; row < n_model_rows; row++) {
        for (var col = 0; col < n_model_cols; col++) {
          model_grid[row][col] = {
            grid_coords: { row: row, column: col },
            content: trial.model_grid_contents[row][col],
            top: mdl_grid_top + row * grid_box_size,
            left: mdl_grid_left + col * grid_box_size,
            size: grid_box_size,
            edge_color: trial.grid_colors[0],
            fill_color: "rgba(0,0,0,0)",
            strokeWidth: 1,
          };

          workspace_grid[row][col] = {
            grid_coords: { row: row, column: col },
            content: null,
            correct_content: model_grid[row][col].content, // the workspace will need to store the correct item for each box
            top: wsp_grid_top + row * grid_box_size,
            left: wsp_grid_left + col * grid_box_size,
            size: grid_box_size,
            edge_color: trial.grid_colors[1],
            fill_color: "rgba(255,0,0,0)",
            strokeWidth: 1,
          };
        }
      }

      // fill the RESOURCE grid (arrays) with box objects and values
      for (var row = 0; row < n_resource_rows; row++) {
        for (var col = 0; col < n_resource_cols; col++) {
          resource_grid[row][col] = {
            grid_coords: { row: row, column: col },
            content: trial.resource_grid_contents[row][col],
            top: rsc_grid_top + row * grid_box_size,
            left: rsc_grid_left + col * grid_box_size,
            size: grid_box_size,
            edge_color: trial.grid_colors[2],
            fill_color: "rgba(0,0,0,0)",
            strokeWidth: 1,
          };
        }
      }

      ///////////////////////////////////////////////////////////////////////
      /* SECTION  2: Populate the grids with items */

      // set a variable tracking the item that is held
      var held_item_id = null;

      /////////////////////////////////////////////////
      var canvas_el = document.getElementById("jspsych-canvas-stimulus");
      var canvas_rect = canvas_el.getBoundingClientRect();

      // draw the 3 grids:
      [model_grid, workspace_grid, resource_grid].forEach(function (grid) {
        drawGridArray(grid);
      });

      // add a dividing border in the middle

      var mid_border_rect_params = {
        left: mid_border_left,
        top: 0,
        fill: trial.mid_border_specs["color"],
        width: mid_border_width,
        height: canvas_height,
        hasControls: false,
        selectable: false,
      };

      // create a Fabric Rect object and add it to the (Fabric) canvas
      var mid_border_rect = new fabric.Rect(mid_border_rect_params);
      canvas.add(mid_border_rect);

      /////////////////////////////////////////////////
      // // populate the MODEL GRID

      for (var row = 0; row < n_model_rows; row++) {
        for (var col = 0; col < n_model_cols; col++) {
          if (model_grid[row][col].content) {
            // create the model item on its right place
            var options_object = {
              grid_type: "model",
              selectable: false,
              hasControls: false,
            };

            if (trial.item_file_type == "img") {
              createItemFromURL(model_grid[row][col], options_object);
            }

            if (trial.item_file_type == "svg_path") {
              CreateItemFromSVG(model_grid[row][col], options_object);
            }
          }
        }
      }

      // // populate the RESOURCE GRID

      for (var row = 0; row < n_resource_rows; row++) {
        for (var col = 0; col < n_resource_cols; col++) {
          if (resource_grid[row][col].content) {
            for (var rep = 0; rep < n_resource_rows * n_resource_cols + 1; rep++) {
              // set options for the item
              var options_object = {
                grid_type: "resource",
                hasControls: false,
                selectable: true,
                mouseDownFunc: mouseDown,
                mouseUpFunc: mouseUp,
                mouseMoveFunc: itemMove,
              };

              if (trial.item_file_type == "img") {
                createItemFromURL(resource_grid[row][col], options_object);
              }

              if (trial.item_file_type == "svg_path") {
                CreateItemFromSVG(resource_grid[row][col], options_object);
              }
            }
          }
        }
      }

      // add a placeholder object (make this object active as a workaround to deactivate objects that were interacted with)
      var placeholder_object = new fabric.Rect({
        top: canvas_height * 2,
        left: canvas_width * 2,
        width: 0,
        height: 0,
        hasControls: false,
        selectable: false,
      });

      ///////////////////////////////////////////////////////////////////////
      /* SECTION 3: Define functions*/

      function createItemFromURL(box, options_object) {
        // Create images form urls (file paths)
        fabric.Image.fromURL(
          box.content,
          function (item) {
            // Scale the item
            var w = item.get("width");
            var h = item.get("height");
            var max = Math.max(w, h);
            var scaling = (box.size / max) * trial.item_scale;
            item.scale(scaling); // NOTE: objects'width and height do not change after scaling!!!!

            // set the object to the center of the grid_boxes
            var w = item.getScaledWidth();
            var h = item.getScaledHeight();

            // place the items on their initial position on the resource grid
            var init_pos_left = box.left + (box.size - w) * 0.5;
            var init_pos_top = box.top + (box.size - h) * 0.5;

            // set the position and store the inital positions of the items
            item.set({
              top: init_pos_top,
              left: init_pos_left,
              w: w,
              h: h,

              init_pos_top: init_pos_top,
              init_pos_left: init_pos_left,

              hasControls: options_object.hasControls,
              selectable: options_object.selectable,
              selectedBox: box,
            });
            item.setCoords(); // call 'obj.setCoords()' (after programatically setting top/left/etc.) for correct mouse behavior

            // Add the items to the canvas
            canvas.add(item);
            canvas.renderAll();

            // tag mouse behaviour on the item
            item.on("mousedown", options_object.mouseDownFunc);
            item.on("mouseup", options_object.mouseUpFunc);
            item.on("mousemove", options_object.mouseMoveFunc);
          },
          {
            // The callback function defined above is called after the loop is finished
            // So variables that depend on the iteration need to be tagged outside of the callback function
            // so that they can be used at the correct timing
            id: box.content + options_object.grid_type,
            itemType: box.content,
          }
        );
      }

      function CreateItemFromSVG(box, options_object) {
        var [item_shape_num, item_color_tag] = getSVGPathandColorTag(box.content);
        var path_str = trial.twenty_svg_paths[item_shape_num];
        var icon = new fabric.Path(path_str);
        icon.set({ fill: item_color_tag });

        var bg = new fabric.Rect({
          fill: "white",
          width: 400,
          height: 400,
        });

        var item = new fabric.Group([bg, icon]);
        // }

        item.set({
          width: 400,
          height: 400,
        });

        //scale the object
        var w = item.get("width");
        var h = item.get("height");

        var max = Math.max(w, h);
        var scaling = (grid_box_size / max) * trial.item_scale;

        item.scale(scaling); // NOTE: objects' width and height do not change after scaling!!!!

        // set the object to the center of the grid_boxes
        var w = item.getScaledWidth();
        var h = item.getScaledHeight();

        // place the items in the correct location
        var init_pos_left = box.left + (grid_box_size - w) * 0.5;
        var init_pos_top = box.top + (grid_box_size - h) * 0.5;

        item.set({
          top: init_pos_top,
          left: init_pos_left,
          w: w,
          h: h,

          init_pos_top: init_pos_top,
          init_pos_left: init_pos_left,
          hasControls: options_object.hasControls,
          selectable: options_object.selectable,

          id: box.content + options_object.grid_type,
          itemType: box.content,
          selectedBox: box,
        });
        item.setCoords(); // call 'obj.setCoords()' (after programatically setting top/left/etc.) for correct mouse behavior

        // tag mouse behaviour on the item
        item.on("mousedown", options_object.mouseDownFunc);
        item.on("mouseup", options_object.mouseUpFunc);
        item.on("mousemove", options_object.mouseMoveFunc);

        // draw the items on the canvas

        canvas.add(item);

        canvas.renderAll();
      }

      // Function to draw grids from grid objects:
      function drawGridArray(grid) {
        for (var row = 0; row < grid.length; row++) {
          for (var col = 0; col < grid[row].length; col++) {
            // define the parameters

            var box = grid[row][col];
            var rect_parameters = {
              left: box.left,
              top: box.top,
              fill: box.fill_color, // full transparent (aka alpha=0)
              width: grid_box_size,
              height: grid_box_size,
              stroke: box.edge_color,
              selectable: false,
            };
            var rect = new fabric.Rect(rect_parameters);
            canvas.add(rect);
            box["fabric_obj"] = rect;
          }
        }
      }

      // Drag and Drop behaviour functions

      function itemMove(e) {
        if (held_item_id === e.target.id) {
          // make held item invisible if it moves to the model area (i.e. crossed the middle border)
          var item = e.target;
          if (item.left < mid_border_rect.left + mid_border_rect.width) {
            // console.log("item.left:  "+ item.left)
            item.opacity = 0;
            //droppedItem(item)
            //sendToResource(item)
            //held_item_id = null;
          } else {
            item.opacity = 1;
          }

          // light up the box of the workspace the item is hovering over
          // make it green when empty and red when full
          var item_center_xy = getObjCenterXY(item);
          if (isInWorkspace(item_center_xy)) {
            workspace_grid.forEach((workspace_grid_row) => {
              workspace_grid_row.forEach((box) => {
                box.fabric_obj.set({ fill: box.fill_color });
                if (isInBox(item_center_xy, box)) {
                  if (box.content == null) {
                    box.fabric_obj.set({ fill: "rgba(255,255,0,0.4)" });
                  } else {
                    box.fabric_obj.set({ fill: "rgba(255,0,0,0.4)" });
                  }
                }
              });
            });
          } else {
            workspace_grid.forEach((workspace_grid_row) => {
              workspace_grid_row.forEach((box) => {
                box.fabric_obj.set({ fill: box.fill_color });
              });
            });
          }
        }
      }

      function mouseDown(e) {
        var item = e.target;
        held_item_id = item.id;

        var item_center_xy = getObjCenterXY(item);

        workspace_grid.forEach((workspace_grid_row) => {
          workspace_grid_row.forEach((box) => {
            // get the box from wich
            if (isInBox(item_center_xy, box)) {
              box.content = null;
              var event = {
                event: "item was picked up from workspace",
                item: item.itemType,
                location: getObjCenterXY(item),
                grid_coords: box.grid_coords,
                timestamp: Math.round(performance.now()),
              };
              trial_events.push(event);
            }
          });
        });

        resource_grid.forEach((resource_grid_row) => {
          resource_grid_row.forEach((box) => {
            // get the box from wich
            if (isInBox(item_center_xy, box)) {
              var event = {
                event: "item was picked up from resource",
                item: item.itemType,
                location: getObjCenterXY(item),
                grid_coords: box.grid_coords,
                timestamp: Math.round(performance.now()),
              };
              trial_events.push(event);
            }
          });
        });
      }

      function mouseUp(e) {
        if (held_item_id == e.target.id) {
          var item = e.target;
          droppedItem(item);
        }
        held_item_id = null;
        workspace_grid.forEach((workspace_grid_row) => {
          workspace_grid_row.forEach((box) => {
            box.fabric_obj.set({ fill: box.fill_color });
          });
        });
      }

      function droppedItem(item) {
        if (held_item_id != null) {
          var item_center_xy = getObjCenterXY(item);
          //console.log(held_item_id+ " item is dopped")

          var send_back = false;

          if (isInWorkspace(item_center_xy)) {
            //console.log("item dropped on workspace")

            // loop over boxes
            workspace_grid.forEach((workspace_grid_row) => {
              workspace_grid_row.forEach((wsp_box) => {
                // if the box is empty
                if (isInBox(item_center_xy, wsp_box)) {
                  // if item is dropped in a box
                  if (wsp_box.content == null) {
                    // if box is empty

                    if (item.itemType == wsp_box.correct_content || trial.allow_incorr_placement) {
                      // if item in the corect box OR if we allow incorrect placement
                      //console.log(item)

                      // snap item to the center of the box
                      var l = wsp_box.left + (wsp_box.size - item.w) / 2;
                      var t = wsp_box.top + (wsp_box.size - item.h) / 2;
                      //console.log(wsp_box.left, wsp_box.size, item.w)
                      item.set({ top: t, left: l });

                      if (item.itemType == wsp_box.correct_content) {
                        if (trial.lock_correct_placement) {
                          // ensure a corectly placed item cannot be moved from it's correct location

                          item.__eventListeners = {}; // remove item event listeners (item is not interactive anymore)
                          item.selectable = false; // ensure item cannot be selected
                          canvas.setActiveObject(placeholder_object); // workaround the bug that active objects are moveable
                        }
                        canvas.renderAll();
                        // reset item coords

                        item.setCoords(); // call 'obj.setCoords()' (after programatically setting top/left) for correct behavior
                        wsp_box.content = item.itemType;

                        // register correct drop up event
                        var event = {
                          event: "item was placed correctly",
                          location: getObjCenterXY(item),
                          grid_coords: wsp_box.grid_coords,
                          item: item.itemType,
                          timestamp: Math.round(performance.now()),
                        };

                        trial_events.push(event);
                      } else {
                        // if incorrect but allowed to place incorrect
                        var event = {
                          event: "item was placed incorrectly",
                          location: getObjCenterXY(item),
                          grid_coords: wsp_box.grid_coords,
                          item: item.itemType,
                          timestamp: Math.round(performance.now()),
                        };

                        trial_events.push(event);

                        wsp_box.content = item.itemType;
                      }
                    } else {
                      // if item is placed incorrectly AND we do not allow incorrect placement
                      send_back = true;
                      //console.log("incorrectly placed item")

                      // register incorrectly dropped event
                      var event = {
                        event: "item was dropped incorrectly",
                        location: getObjCenterXY(item),
                        grid_coords: wsp_box.grid_coords,
                        item: item.itemType,
                        timestamp: Math.round(performance.now()),
                      };
                      trial_events.push(event);
                    }
                  } else {
                    //if there is an item in that box already

                    var event = {
                      event: "item was dropped on filled box",
                      location: getObjCenterXY(item),
                      grid_coords: wsp_box.grid_coords,
                      item: item.itemType,
                      timestamp: Math.round(performance.now()),
                    };
                    trial_events.push(event);

                    send_back = true;
                    //console.log("box was full ")
                  }
                }
              });
            });
          } else {
            // else if item is NOT dropped on the workspace

            var event = {
              event: "item was dropped outside workspace",
              location: getObjCenterXY(item),
              item: item.itemType,
              timestamp: Math.round(performance.now()),
            };
            trial_events.push(event);

            send_back = true;
          }

          if (send_back) {
            //console.log("Item is sent back!")
            sendToResource(item);
          }
        }

        if (checkIfDone()) {
          // when done copying
          //console.log("YOU'RE DONE \n \nHURRAH \n\n MOVE ON TO THE NEXT TRIAL");
          var event = {
            event: "copying trial was completed",
            timestamp: Math.round(performance.now()),
          };
          trial_events.push(event);

          // END THE TRIAL WHEN DONE
          end_trial();
        }
      }

      function sendToResource(item) {
        //console.log(item.id + " is Reset")

        // if item is released right of the mid-border (in the model area) place it back immediately
        if (item.left < mid_border_rect.left + mid_border_rect.width) {
          item.set({
            top: item.init_pos_top,
            left: item.init_pos_left,
          });
          item.setCoords(); // call 'obj.setCoords()' (after programatically setting top/left) for correct behavior
          item.opacity = 1; // reset the items opacity to 1 as it is coming back from being invisible around the model area
        } else {
          // if item is released near the workspace animate it moving back to its inital location
          item.animate("left", item.init_pos_left, {
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInBounce,
            duration: 250,
          });
          item.animate("top", item.init_pos_top, {
            onChange: canvas.renderAll.bind(canvas),
            //easing: fabric.util.ease.easeInBounce,
            duration: 300,
          });
          item.setCoords(); // call 'obj.setCoords()' (after programatically setting top/left) for correct behavior
        }
      }

      function getObjCenterXY(item) {
        var w = item.getScaledWidth();
        var h = item.getScaledHeight();
        return [item.left + w / 2, item.top + h / 2];
      }

      function isInWorkspace(xy) {
        return (
          xy[0] >= workspace_grid[0][0].left && // left of upper-left most box
          xy[0] < workspace_grid[0][0].left + n_model_cols * grid_box_size &&
          xy[1] >= workspace_grid[0][0].top && // top  of upper-left most box
          xy[1] < workspace_grid[0][0].top + n_model_rows * grid_box_size
        );
      }

      function isInBox(xy, box) {
        return (
          xy[0] >= box.left &&
          xy[0] < box.left + box.size &&
          xy[1] >= box.top &&
          xy[1] < box.top + box.size
        );
      }

      function checkIfDone() {
        // loop over all model grid boxes
        for (var row = 0; row < n_model_rows; row++) {
          for (var col = 0; col < n_model_cols; col++) {
            // check if every box is correctly filled
            if (model_grid[row][col].content != workspace_grid[row][col].content) {
              // if any corresoponding grid content doesn't match retrun false
              return false;
            }
          }
        }
        // if after checking all boxes, none was wrong return true (ie trial is done)
        return true;
      }

      function getGridContent(grid) {
        var return_obj = [];
        for (var row = 0; row < grid.length; row++) {
          return_obj[row] = [];
          for (var col = 0; col < grid[row].length; col++) {
            return_obj[row][col] = grid[row][col].content;
          }
        }
        return return_obj;
      }

      function getSVGPathandColorTag(item_complete_info) {
        return item_complete_info.replace(/\s+/g, "").split("--");
      }

      ///////////////////////////////////////////////////////////////////////

      ///////////////////////////////////////////////////////////////////////
      /* SECTION 4: jsPsych code to handle the end of a trial */

      var startTime = Math.round(performance.now());

      // store response
      var response = {
        rt: null,
        key: null,
      };

      // function to end trial when it is time
      const end_trial = () => {
        var endTime = Math.round(performance.now());
        var response_time = endTime - startTime;

        // kill any remaining setTimeout handlers
        this.jsPsych.pluginAPI.clearAllTimeouts();

        // clearInterval(interval_ID)

        var trial_completed = checkIfDone();
        // gather the data to store for the trial
        var trial_data = {
          rt: response_time,
          key_press: response.key,
          grid_contents: {
            model: getGridContent(model_grid),
            workspace: getGridContent(workspace_grid),
            resource: getGridContent(resource_grid),
          },
          trial_events: trial_events,
          trial_completed: trial_completed,
          canvas_offset_top_left: [canvas_rect.top, canvas_rect.left],
        };

        // clear the display
        display_element.innerHTML = "";

        // move on to the next trial
        this.jsPsych.finishTrial(trial_data);
      };

      // hide stimulus if stimulus_duration is set
      if (trial.stimulus_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          display_element.querySelector("#jspsych-canvas-copying-task").style.visibility = "hidden";
        }, trial.stimulus_duration);
      }
      // end trial if trial_duration is set
      if (trial.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
      }
    }
  }

  ///////////////////////////////////////////////////////////////////////
  /* SECTION 5: return the plugin */

  CopyingTaskPlugin.info = info;

  return CopyingTaskPlugin;
})(jsPsychModule);
