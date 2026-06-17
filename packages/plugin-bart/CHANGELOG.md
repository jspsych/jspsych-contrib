# @jspsych-contrib/plugin-bart

## 1.2.0

### Minor Changes

- [#268](https://github.com/jspsych/jspsych-contrib/pull/268) [`2af2d92aa999ee633d7489cffb38cd1a86f27f76`](https://github.com/jspsych/jspsych-contrib/commit/2af2d92aa999ee633d7489cffb38cd1a86f27f76) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Improve CSS customizability of the BART plugin:

  - Add `value_text_color`, `label_text_color`, `info_box_border_color`, and `info_box_background_color` parameters for the info box text, borders, and backgrounds. Their defaults are derived from `currentColor`, so the display now adapts to light/dark page themes without consumer overrides, replacing the previously hard-coded `#333`/`#666`/`#f0f0f0` values.
  - Add a `balloon_stage_height` parameter (default 400) to control the balloon stage height, which was previously hard-coded and required `!important` overrides.
  - Document the existing `max_pumps` parameter in the README.

## 1.1.0

### Minor Changes

- [#207](https://github.com/jspsych/jspsych-contrib/pull/207) [`dc5007362f4f9347549ed1e5b9546de89a5dcaaf`](https://github.com/jspsych/jspsych-contrib/commit/dc5007362f4f9347549ed1e5b9546de89a5dcaaf) Thanks [@jadeddelta](https://github.com/jadeddelta)! - you are now able to customize all parts of displayed information, including labels for the current and total points, along with functions to scale and format the actual point values

## 1.0.0

### Major Changes

- [#202](https://github.com/jspsych/jspsych-contrib/pull/202) [`56083f227dbd13e425e5350035e538804f37b51a`](https://github.com/jspsych/jspsych-contrib/commit/56083f227dbd13e425e5350035e538804f37b51a) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Initial release of the Balloon Analogue Risk Task (BART) plugin. This plugin displays an animated SVG balloon that participants can pump to earn points or collect their winnings. Key features include:

  - Configurable pop threshold for precise experimental control
  - Smooth pump and pop animations with customizable durations
  - Real-time display of balloon value and total points
  - Mobile-responsive layout
  - Customizable balloon colors and button labels
  - Adaptive balloon scaling based on max_pumps parameter
  - Comprehensive reaction time data collection (pump times and collect time)
