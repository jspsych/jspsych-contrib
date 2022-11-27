var jsPsychTouchScreenButtonsExtension = (function (jspsych) {
        "use strict";

        /**
         * **Touchscreen-BUTTONS**
         *
         * Create an overlay of touch buttons to use jsPsych on mobile devices.
         *
         * @author Younes Strittmatter
         * @see {@link https://DOCUMENTATION_URL DOCUMENTATION LINK TEXT}
         */
        class jsPsychTouchScreenButtonsExtension {
            constructor(jsPsych) {
                this.jsPsych = jsPsych;
            }

            initialize(params) {
                return new Promise((resolve, reject) => {
                    this.layouts = [];
                    for (let i = 0; i < params.length; i++) {
                        let middle, left, right, left_bottom, left_top, right_bottom, right_top = null;
                        let param = params[i];
                        if (param.middle) {
                            middle = new Button('middle', param.middle, this.jsPsych);
                        }
                        if (param.left_bottom) {
                            left_bottom = new Button('left_bottom', param.left_bottom, this.jsPsych);
                        }
                        if (param.left_top) {
                            left_top = new Button('left_top', param.left_top, this.jsPsych);
                        }
                        if (param.right_bottom) {
                            right_bottom = new Button('right_bottom', param.right_bottom, this.jsPsych);
                        }
                        if (param.right_top) {
                            right_top = new Button('right_top', param.right_top, this.jsPsych);
                        }
                        if (param.left) {
                            left = new Button('left', param.left, this.jsPsych);
                        }
                        if (param.right) {
                            right = new Button('right', param.right, this.jsPsych);
                        }
                        let buttons = {
                            middle,
                            left_bottom,
                            left_top,
                            right_bottom,
                            right_top,
                            left,
                            right
                        };
                        this.layouts.push(buttons);
                    }
                    resolve();
                });
            }

            on_start(params) {
            }

            on_load(params) {
                let display_element = this.jsPsych.getDisplayElement();
                let index = (params && params.layout) || 0;
                let buttons = this.layouts[index]
                if (buttons.middle) {
                    buttons.middle.div.addEventListener('touchstart', buttons.middle.start_listener.bind(buttons.middle), false);
                    buttons.middle.div.addEventListener('touchend', buttons.middle.end_listener.bind(buttons.middle), false);
                    display_element.appendChild(buttons.middle.div);
                }
                if (buttons.left_bottom) {
                    buttons.left_bottom.div.addEventListener('touchstart', buttons.left_bottom.start_listener.bind(buttons.left_bottom), false);
                    buttons.left_bottom.div.addEventListener('touchend', buttons.left_bottom.end_listener.bind(buttons.left_bottom), false);
                    display_element.appendChild(buttons.left_bottom.div);
                }
                if (buttons.left_top) {
                    buttons.left_top.div.addEventListener('touchstart', buttons.left_top.start_listener.bind(buttons.left_top), false);
                    buttons.left_top.div.addEventListener('touchend', buttons.left_top.end_listener.bind(buttons.left_top), false);
                    display_element.appendChild(buttons.left_top.div);
                }
                if (buttons.right_bottom) {
                    buttons.right_bottom.div.addEventListener('touchstart', buttons.right_bottom.start_listener.bind(buttons.right_bottom), false);
                    buttons.right_bottom.div.addEventListener('touchend', buttons.right_bottom.end_listener.bind(buttons.right_bottom), false);
                    display_element.appendChild(buttons.right_bottom.div);
                }
                if (buttons.right_top) {
                    buttons.right_top.div.addEventListener('touchstart', buttons.right_top.start_listener.bind(buttons.right_top), false);
                    buttons.right_top.div.addEventListener('touchend', buttons.right_top.end_listener.bind(buttons.right_top), false);
                    display_element.appendChild(buttons.right_top.div);
                }
                if (buttons.right) {
                    buttons.right.div.addEventListener('touchstart', buttons.right.start_listener.bind(buttons.right), false);
                    buttons.right.div.addEventListener('touchend', buttons.right.end_listener.bind(buttons.right), false);
                    display_element.appendChild(buttons.right.div);
                }
                if (buttons.left) {
                    buttons.left.div.addEventListener('touchstart', buttons.left.start_listener.bind(buttons.left), false);
                    buttons.left.div.addEventListener('touchend', buttons.left.end_listener.bind(buttons.left), false);
                    display_element.appendChild(buttons.left.div);
                }
            }


            on_finish(params) {
                for (let i = 0; i < this.layouts.length; i++) {
                    let buttons = this.layouts[i];
                    if (buttons.middle) {
                        buttons.middle.div.ontouchstart = null;
                    }
                    if (buttons.left_bottom) {
                        buttons.left_bottom.div.ontouchstart = null;
                    }
                    if (buttons.left_top) {
                        buttons.left_top.div.ontouchstart = null;
                    }
                    if (buttons.right_bottom) {
                        buttons.right_bottom.div.ontouchstart = null;
                    }
                    if (buttons.right_top) {
                        buttons.right_top.div.ontouchstart = null;
                    }
                    if (buttons.left) {
                        buttons.left.div.ontouchstart = null;
                    }
                    if (buttons.right) {
                        buttons.right.div.ontouchstart = null;
                    }
                }
                return {
                    data_property: "data_value",
                };
            }
        }

        jsPsychTouchScreenButtonsExtension.info = {
            name: "mobile-buttons",
        };

        return jsPsychTouchScreenButtonsExtension;
    }
)
(jsPsychModule);

function byteToHex(num) {
    // Turns a number (0-255) into a 2-character hex number (00-ff)
    return ('0' + num.toString(16)).slice(-2);
}

function standardColor(color) {
    let cvs = document.createElement('canvas');
    cvs.height = 1;
    cvs.width = 1;
    let ctx = cvs.getContext('2d');
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
    hex = [0, 1, 2].map(
        function (idx) {
            return byteToHex(color[idx]);
        }
    ).join('');
    return "#" + hex;
}

class Button {
    constructor(type, params, jsPsych) {
        this.jsPsych = jsPsych;
        this.div = document.createElement('div');
        this.key = (params && params.key) || '';
        let c = 'jsTouchButtonMiddle';
        if (type === 'left_bottom') {
            c = 'jsTouchButtonLeftBottom';
        } else if (type === 'left_top') {
            c = 'jsTouchButtonLeftTop';
        } else if (type === 'right_bottom') {
            c = 'jsTouchButtonRightBottom';
        } else if (type === 'right_top') {
            c = 'jsTouchButtonRightTop';
        } else if (type === 'left') {
            c = 'jsTouchButtonLeft';
        } else if (type === 'right') {
            c = 'jsTouchButtonRight';
        }


        let style = (params && params.css) || 'jsTouchButton';
        this.div.classList.add(style, c);
        let col = '#9999';
        if (params.color) {
            col = params.color;
            if (!col.startsWith('#')) {
                col = standardColor(col);
                col = stdColorToHex(col);
            }
            if (col.length === 4) {
                col += '9';
            } else if (col.length === 7) {
                col += '90';
            }
        }
        this.div.style.boxShadow = "inset 0 0 0 .5vw " + col + ", 0 0 0 .5vw " + col;
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
