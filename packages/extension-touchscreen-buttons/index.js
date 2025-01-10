var jsPsychExtensionTouchscreenButtons = (function (jspsych) {
  "use strict";

  function byteToHex(num) {
    // Turns a number (0-255) into a 2-character hex number (00-ff)
    return ("0" + num.toString(16)).slice(-2);
  }

  function standardColor(color) {
    let cvs = document.createElement("canvas");
    cvs.height = 1;
    cvs.width = 1;
    let ctx = cvs.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    return ctx.getImageData(0, 0, 1, 1).data;
  }

  function stdColorToHex(color) {
    // Convert any CSS color to a hex representation
    // Examples:
    // colorToHex('red')            # '#ff0000'
    // colorToHex('rgb(255, 0, 0)') # '#ff0000'
    let hex;
    hex = [0, 1, 2]
      .map(function (idx) {
        return byteToHex(color[idx]);
      })
      .join("");
    return "#" + hex;
  }

  class Button {
    constructor(params, jsPsych) {
      this.jsPsych = jsPsych;
      this.div = document.createElement("div");
      this.key = (params && params.key) || "";
      let style = (params && params.css) || "jsTouchButton";
      let position_x = params.position_x;
      if (position_x === undefined) {
        position_x = 50;
      }
      let position_y = params.position_y;
      if (position_y === undefined) {
        position_y = 10;
      }
      let size = params.size;
      if (size === undefined) {
        size = 10;
      }
      let type = (params && params.preset) || null;

      let c = null;
      if (type === "bottom_left") {
        c = "jsTouchButtonLeftBottom";
      } else if (type === "top_left") {
        c = "jsTouchButtonLeftTop";
      } else if (type === "bottom_right") {
        c = "jsTouchButtonRightBottom";
      } else if (type === "top_right") {
        c = "jsTouchButtonRightTop";
      } else if (type === "left") {
        c = "jsTouchButtonLeft";
      } else if (type === "right") {
        c = "jsTouchButtonRight";
      }

      this.div.classList.add(style, c);
      let col = "#9999";
      if (params.color) {
        col = params.color;
        if (!col.startsWith("#")) {
          col = standardColor(col);
          col = stdColorToHex(col);
        }
        if (col.length === 4) {
          col += "9";
        } else if (col.length === 7) {
          col += "90";
        }
      }
      this.div.style.boxShadow = "inset 0 0 0 .5vw " + col + ", 0 0 0 .5vw " + col;
      if (c === null) {
        if (typeof position_x !== "string") {
          this.div.style.left = position_x + "%";
        } else {
          this.div.style.left = position_x;
        }
        if (typeof position_y !== "string") {
          this.div.style.bottom = position_y + "%";
        } else {
          this.div.style.bottom = position_y;
        }
        if (typeof size !== "string") {
          this.div.style.width = this.div.style.height = this.div.style.lineHeight = size + "vw";
        } else {
          this.div.style.width = this.div.style.height = this.div.style.lineHeight = size;
        }
      }
      if (params.innerText) {
        this.div.innerText = params.innerText;
      }
      if (params.style) {
        for (let key in params.style) {
          this.div.style[key] = params.style[key];
        }
      }
    }

    start_listener() {
      this.jsPsych.pluginAPI.keyDown(this.key);
    }

    end_listener() {
      this.jsPsych.pluginAPI.keyUp(this.key);
    }
  }

  /**
   * **extension-touchscreen-buttons**
   *
   * Create an overlay of touch buttons to use jsPsych on mobile devices.
   *
   * @author Younes Strittmatter
   */
  class jsPsychExtensionTouchscreenButtons {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    initialize(params) {
      return new Promise((resolve, reject) => {
        this.layouts = {};
        for (const [key, value] of Object.entries(params)) {
          this.layouts[key] = [];
          value.forEach((el) => this.layouts[key].push(new Button(el, this.jsPsych)));
        }
        resolve();
      });
    }

    on_start(params) {}

    on_load(params) {
      let display_element = this.jsPsych.getDisplayElement();

      let key = Object.keys(this.layouts)[0];
      if (params) {
        key = params.layout;
      }
      let buttons = this.layouts[key];

      buttons.forEach((button) => {
        button.div.addEventListener("touchstart", button.start_listener.bind(button), false);
        button.div.addEventListener("touchend", button.end_listener.bind(button), false);
        display_element.appendChild(button.div);
      });
    }

    on_finish(params) {
      for (const [key, value] of Object.entries(this.layouts)) {
        let buttons = value;
        buttons.forEach((button) => {
          button.div.ontouchstart = null;
          button.div.ontouchend = null;
        });
      }
      return {
        data_property: "data_value",
      };
    }
  }

  jsPsychExtensionTouchscreenButtons.info = {
    name: "touchscreen-buttons",
    version: "2.1.0",
    data: {},
    citations: {
      apa: "Strittmatter, Y., Spitzer, M. W. H., Ging-Jehil, N., & Musslick, S. (2024). A jsPsych touchscreen extension for behavioral research on touch-enabled interfaces. Behavior Research Methods, 56(7), 7814. https://doi.org/10.3758/s13428-024-02454-9 ",
      bibtex:
        "@article{Strittmatter2024jsPsych, 	author = {Strittmatter, Younes and Spitzer, Markus W. H. and Ging-Jehil, Nadja and Musslick, Sebastian}, 	journal = {Behavior Research Methods}, 	doi = {10.3758/s13428-024-02454-9}, 	issn = {1554-3528}, 	number = {7}, 	year = {2024}, 	month = {jul 12}, 	pages = {7814}, 	publisher = {Springer}, 	title = {A {jsPsych} touchscreen extension for behavioral research on touch-enabled interfaces}, 	url = {https://link.springer.com/article/10.3758/s13428-024-02454-9}, 	volume = {56}, }  ",
    },
  };

  return jsPsychExtensionTouchscreenButtons;
})(jsPsychModule);
