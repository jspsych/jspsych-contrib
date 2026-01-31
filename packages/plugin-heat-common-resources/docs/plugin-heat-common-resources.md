# plugin-heat-common-resources

A resource allocation game where participants decide how to distribute cooling tokens between personal and group cooling during a heatwave scenario. Players click a central pot to contribute tokens one at a time, with visual feedback showing all players around the pot and their survival outcomes. Implements a climate-themed social dilemma with configurable parameters for group size, token amounts, and deployment thresholds.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter                      | Type    | Default Value | Description                                                                                           |
| ------------------------------ | ------- | ------------- | ----------------------------------------------------------------------------------------------------- |
| num_players                    | int     | 5             | Total number of players in the group including the participant.                                      |
| initial_tokens                 | int     | 10            | Number of cooling tokens each player starts with.                                                   |
| group_threshold                | int     | 25            | Minimum tokens required in group pot to deploy cooling station.                                     |
| survival_tokens_no_cooling     | int     | 6             | Tokens needed for personal survival without group cooling.                                           |
| survival_tokens_with_cooling   | int     | 2             | Tokens needed for personal survival with group cooling deployed.                                     |
| simulated_contributions        | array   | []            | Array of simulated player contributions. If fewer than num_players-1, remaining are randomized.     |
| random_contribution_range      | array   | [4, 6]        | Range for randomizing simulated player contributions [min, max].                                    |
| player_names                   | array   | []            | Custom names for players. If fewer than num_players, remaining are 'Anonymous'.                     |
| participant_label              | string  | "You"         | Label for the human participant.                                                                     |
| show_other_tokens              | bool    | false         | Whether to show token counts for other players during contribution phase.                           |
| trial_duration                 | int     | null          | Duration to show trial in milliseconds. If null, waits for response.                               |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name                  | Type     | Value                                                                        |
| --------------------- | -------- | ---------------------------------------------------------------------------- |
| tokens_contributed    | int      | Number of tokens contributed by the participant to the group pot.           |
| tokens_kept           | int      | Number of tokens kept by the participant for personal cooling.              |
| total_group_tokens    | int      | Total tokens in the group cooling pot from all players.                     |
| cooling_deployed      | bool     | Whether the group cooling station was deployed.                             |
| participant_survived  | bool     | Whether the participant survived the heatwave.                              |
| all_players_survived  | array    | Array of whether each player survived (including participant).              |
| all_contributions     | array    | Array of contributions from all players (including participant).            |
| rt                    | int      | Response time from start to clicking done button in milliseconds.           |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-heat-common-resources"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-heat-common-resources.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-heat-common-resources
```

```js
import HeatCommonResources from "@jspsych-contrib/plugin-heat-common-resources";
```


## Examples

### Basic Example

```javascript
var trial = {
  type: jsPsychHeatCommonResources,
  num_players: 5,
  initial_tokens: 10,
  group_threshold: 25,
  survival_tokens_no_cooling: 6,
  survival_tokens_with_cooling: 2
};
```

### Custom Player Names and Contributions

```javascript
var trial = {
  type: jsPsychHeatCommonResources,
  num_players: 4,
  initial_tokens: 8,
  group_threshold: 20,
  player_names: ["You", "Alice", "Bob", "Charlie"],
  simulated_contributions: [3, 5, 2],
  show_other_tokens: true
};
```

### Randomized Simulated Players

```javascript
var trial = {
  type: jsPsychHeatCommonResources,
  num_players: 6,
  initial_tokens: 12,
  random_contribution_range: [2, 8],
  participant_label: "Player 1"
};
```
