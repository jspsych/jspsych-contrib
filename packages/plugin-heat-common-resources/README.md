# plugin-heat-common-resources

## Overview

A resource allocation game where participants decide how to distribute cooling tokens between personal and group cooling during a heatwave scenario. Players can click a central pot to contribute tokens, with visual feedback showing player status and survival outcomes. Implements a climate-themed social dilemma with configurable parameters for group size, token amounts, and deployment thresholds.

## Features

- **Interactive Token Contribution**: Players click a central pot to contribute cooling tokens one at a time
- **Visual Player Representation**: Shows all players around the pot with emoji icons and token counts
- **Configurable Game Parameters**: Customize group size, token amounts, survival thresholds, and simulated player behavior
- **Dynamic Feedback**: Visual indication of who survived vs. burned based on contribution decisions
- **Mobile Responsive**: Designed to work on both desktop and mobile devices
- **Simulated Co-players**: AI players with configurable or randomized contribution patterns

## Loading

### In browser

```html
<script src="https://unpkg.com/@jspsych-contrib/plugin-heat-common-resources">
```

### Via NPM

```
npm install @jspsych-contrib/plugin-heat-common-resources
```

```js
import jsPsychHeatCommonResources from "@jspsych-contrib/plugin-heat-common-resources";
```

## Compatibility

`@jspsych-contrib/plugin-heat-common-resources` requires jsPsych v8.0.0 or later.

## Documentation

See [documentation](docs/plugin-heat-common-resources.md) for detailed parameter descriptions and examples.

## Basic Usage

```javascript
const trial = {
  type: jsPsychHeatCommonResources,
  num_players: 5,
  initial_tokens: 10,
  group_threshold: 25,
  survival_tokens_no_cooling: 6,
  survival_tokens_with_cooling: 2
};
```

## Author / Citation

[Abdullah Hunter Farhat](https://github.com/farhat60/)