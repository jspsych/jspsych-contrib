# jspsych-libet-intentional-binding plugin

This plugin measures intentional binding using a Libet clock, and allows the participant to estimate the timing of events by adjusting the clock hand themselves.

## Citation

    Galang, C. M., Malik, R., Kinley, I., & Obhi, S. S. (2021). Studying sense of agency online: Can intentional binding be observed in uncontrolled online settings? *Consciousness and Cognition*, 95, 103217. doi:[10.1016/j.concog.2021.103217](https://doi.org/10.1016/j.concog.2021.103217)

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Parameters can be left unspecified if the default value is acceptable.

| Parameter                | Type             | Default Value        | Descripton                               |
| ------------------------ | ---------------- | -------------------- | ---------------------------------------- |
| cond                     | string           | `'baseline-key'`       | Specifies the condition ("baseline-key", "baseline-tone", "operant-key", or "operant-tone"). |
| tone_file                | audio            | undefined            | The audio file to be played, if applicable. |
| tone_file                | keys            | `"ALL_KEYS"`            | The keys a participant can press, if applicable. |
| tone_delay_ms            | int              | 2500                 | The time after the key press or the beginning of the clock animation that the tone is played, if applicable. |
| hand_est                 | boolean          | true                 | Specifies whether the participant moves the hand to estimate an angle. If false, the trial ends after the clock hand stops spinning. |
| instructions             | string           | `''`                   | The instructions shown to the participant during estimation, if any. |
| feedback                 | boolean          | false                | If true (and if hand_est is true), the participant sees feedback. |
| feedback_ms              | int              | 2000                 | Number of milliseconds to display feedback, if applicable. |
| pre_estimation_ms        | int              | 1000                 | The length of time, in ms, that the clock hand disappears before reappearing to be moved by the participant, if applicable. |
| hand_inc                 | float            | `Math.PI*2/120`        | The minimum number of radians a participant can rotate the clock hand. |
| offset_range             | float            | `[Math.PI/4, Math.PI/3]` | When the participant is able to move the clock hand, its initial angle will be offset from the correct angle by an absolute amount drawn from this range (in radians). Half the time the initial angle will be offset a positive amount, half the time a negative amount. |
| fixation_ms              | int              | 400                  | Duration of the pre-trial fixation cross in ms. |
| clock_period             | int              | 2560                 | The period of the clock in ms. |
| early_ms                 | int              | 2560                 | The earliest allowable keypress, measured in milliseconds since the clock hand begins rotating. If a keypress is made prior to this, the trial ends. |
| early_fcn                | function         | `function(){}`         | Function called when the participant responds too early (e.g., to provide feedback). |
| timeout_ms               | int              | 4000                 | The maximum length of a trial, measured in milliseconds since the clock hand begins rotating. If a keypress is not made prior to this, the trial ends. |
| spin_continue_ms         | int              | 1000                 | The length of time, in ms, after the keypress or tone, whichever comes later, that the clock animation continues. |
| clock_diam               | int              | 200                  | The diameter of the clock in pixels. |
| n_maj_ticks              | int              | 60                   | The number of major ticks to draw on the clock face. |
| maj_tick_len             | int              | 12                   | Length of major ticks in pixels. |
| maj_tick_start           | int              | 0                    | Where to draw the first major tick, in radians. |
| n_min_ticks              | int              | 60                   | The number of minor ticks to draw on the clock face. |
| min_tick_len             | int              | 6                    | Length of minor ticks in pixels. |
| min_tick_start           | int              | `Math.PI*2/120`        | Where to draw the first minor tick, in radians. |
| num                      | int              | `[60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5]` | The numbers to draw around the clock face. |
| num_start                | int              | `Math.PI/2`            | Where to draw the first number, in radians. |
| num_font                 | string           | `"5mm Arial"`          | The font for the numbers. |
| num_dist                 | int              | 30                   | Distance of the numbers from the outer circle of the clock, in pixels. |
| hand_len                 | int              | 80                   | Length of the clock hand in pixels. |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/overview/plugins#data-collected-by-all-plugins), this plugin collects all parameter data described above and the following data for each trial.

| Name             | Type        | Value                                    |
| ---------------- | ----------- | ---------------------------------------- |
| cond             | string      | The condition of the trial ("baseline-key", "baseline-tone", "operant-key", or "operant-tone"). |
| early            | boolean     | Specifies whether the participant pressed a key too early. |
| timeout          | boolean     | Specifies whether the trial timed out due to the participant's lack of response. |
| theta            | object      | Describes the various important quantities in radians:<br>`theta.spin_start`: the clock hand begins spinning from this angle<br>`theta.keypress`: the keypress was made when the clock hand was at this angle<br>`theta.tone`: the tone began playing when the clock hand was at this angle<br>`theta.estimation_start`: the clock hand began at this angle during estimation, if applicable<br>`theta.target`: this is the correct angle for the participant to estimate, given the current condition<br>`theta.estimation`: this is the estimate provided by the participant, if applicable<br>`theta.overshoot`: this is the amount by which the participant's estimate overshoots the target angle (where the positive direction is clockwise) |

## Examples

### "Running an operant tone trial"

```javascript
var trial = {
    type: jsPsychLibetIntentionalBinding,
    cond: 'operant-tone',
    tone_file: 'tone.mp3'
}
```