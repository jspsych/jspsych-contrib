# plugin-columbia-card-task

The Columbia Card Task measures risk preferences through choices in a card game.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
| num_cards           | INT              | 32                 | Total number of cards in the deck.      |
| num_loss_cards      | INT              | *undefined*        | Number of cards that result in a loss. Must be specified. |
| points_per_card     | INT              | 10                 | Points gained for each safe card turned. |
| loss_amount         | INT              | *undefined*        | Points lost when a loss card is turned. Must be specified. |
| cards_per_row       | INT              | 8                  | Number of cards displayed per row.      |
| card_width          | INT              | 60                 | Width of each card in pixels.           |
| card_height         | INT              | 80                 | Height of each card in pixels.          |
| card_spacing        | INT              | 5                  | Spacing between cards in pixels.        |
| prompt              | HTML_STRING      | ""                 | Prompt displayed above the cards.       |
| show_points         | BOOL             | true               | Whether to display current points.      |
| show_cards_remaining| BOOL             | true               | Whether to display number of cards remaining. |
| show_loss_cards     | BOOL             | true               | Whether to display number of loss cards. |
| trial_duration      | INT              | null               | Duration of trial (ms). If null, trial continues until participant chooses to stop. |
| response_ends_trial | BOOL             | true               | Whether clicking "Stop" button ends the trial. |
| button_label        | STRING           | "Stop and Keep Points" | Label for the stop button.        |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| cards_turned | INT   | Number of cards the participant turned before stopping. |
| points_earned | INT  | Total points earned from safe cards.    |
| hit_loss_card | BOOL | Whether the participant hit a loss card. |
| final_score | INT   | Final score (points earned minus loss if applicable). |
| rt         | FLOAT   | Response time in milliseconds for the decision to stop. |
| card_sequence | ARRAY | Sequence of card outcomes (safe/loss) in order turned. |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-columbia-card-task"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-columbia-card-task.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-columbia-card-task
```

```js
import ColumbiaCardTask from "@jspsych-contrib/plugin-columbia-card-task";
```


## Examples

### Basic Columbia Card Task

```javascript
var trial = {
  type: jsPsychColumbiaCardTask,
  num_cards: 32,
  num_loss_cards: 3,
  points_per_card: 10,
  loss_amount: 250,
  prompt: "<p>Click on cards to turn them over. You gain points for each safe card, but lose points if you hit a loss card. You can stop at any time to keep your points.</p>"
}
```

### High-risk scenario

```javascript
var high_risk_trial = {
  type: jsPsychColumbiaCardTask,
  num_cards: 24,
  num_loss_cards: 6,
  points_per_card: 15,
  loss_amount: 300,
  cards_per_row: 6,
  button_label: "Cash Out",
  prompt: "<p><strong>High Risk Round:</strong> More loss cards, but higher rewards!</p>"
}
```
