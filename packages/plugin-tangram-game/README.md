# plugin-tangram-game

## Overview

A child-friendly tangram game with click-and-click interface and potential for custom puzzles

![Tangram Game Demo](Tangram-demo.gif "Tangram Demo")

## Loading

### In browser

```html
<script src="https://unpkg.com/@jspsych-contrib/plugin-tangram-game">
```

### Via NPM

```
npm install @jspsych-contrib/plugin-tangram-game
```

## Compatibility

`@jspsych-contrib/plugin-tangram-game` requires jsPsych v8.0.0 or later.

## Documentation

See [documentation](https://github.com/jspsych/jspsych-contrib/packages/plugin-tangram-game/README.md)

## Author / Citation

[Aline Normoyle](https://github.com/alinen)

# How to run

You will need to run a webserver to preview the game locally. I recommend using python's built in web server. Launch it from the main directory of this repository like so:

`python -m http.server 8000`

Then go to `http://127.0.0.1:8000/examples/index.html` or `http://127.0.0.1:8000/examples/index2.html` in your browser.

# Development notes
To generate favicon.ico:

`convert -background transparent "tangram.png" -define icon:auto-resize=16,24,32,48,64,72,96,128,256 "favicon.ico"`
