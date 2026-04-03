# @jspsych-contrib/plugin-tower-of-london

## 1.0.0

### Major Changes

- [#232](https://github.com/jspsych/jspsych-contrib/pull/232) [`88821cba947f15edb1cebd84e84d45823c13c2f3`](https://github.com/jspsych/jspsych-contrib/commit/88821cba947f15edb1cebd84e84d45823c13c2f3) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - 1.0 release. Refactor rendering from canvas to SVG for crisp display at any DPI. Add ball movement animation, goal state solved indicator, and parameterized text labels (`solved_text`, `goal_label`). Goal state now renders as an inset on the main display. Peg heights scale to their capacity. New `animation_duration` parameter.

## 0.1.0

### Minor Changes

- [#212](https://github.com/jspsych/jspsych-contrib/pull/212) [`43b9efde373324d14419eb3e45f0347d214aca8a`](https://github.com/jspsych/jspsych-contrib/commit/43b9efde373324d14419eb3e45f0347d214aca8a) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - New plugin for Tower of London puzzle task. Participants move colored balls between pegs to match a goal configuration. Features include customizable peg capacities, move limits, time limits, optimal move tracking, and detailed move-by-move data recording.
