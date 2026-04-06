# @jspsych-contrib/plugin-pursuit-rotor

## 1.0.0

### Major Changes

- [#234](https://github.com/jspsych/jspsych-contrib/pull/234) [`568e1e102a4925e97584fed0d0113b7fbb988e9f`](https://github.com/jspsych/jspsych-contrib/commit/568e1e102a4925e97584fed0d0113b7fbb988e9f) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - 1.0 release. Add `wait_for_start` parameter (default `true`) so the rotor stays stationary until the participant clicks or taps. Add `start_text` parameter for customizable prompt text shown while waiting (set to `null` or `""` to hide).

## 0.1.0

### Minor Changes

- [#212](https://github.com/jspsych/jspsych-contrib/pull/212) [`43b9efde373324d14419eb3e45f0347d214aca8a`](https://github.com/jspsych/jspsych-contrib/commit/43b9efde373324d14419eb3e45f0347d214aca8a) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - New plugin for pursuit rotor task measuring visuomotor tracking. A target moves along a circular path and participants track it with cursor/touch. Records time on target, tracking accuracy, and detailed sample-by-sample position data.
