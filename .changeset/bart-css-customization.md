---
"@jspsych-contrib/plugin-bart": minor
---

Improve CSS customizability of the BART plugin:

- Add `value_text_color`, `label_text_color`, `info_box_border_color`, and `info_box_background_color` parameters for the info box text, borders, and backgrounds. Their defaults are derived from `currentColor`, so the display now adapts to light/dark page themes without consumer overrides, replacing the previously hard-coded `#333`/`#666`/`#f0f0f0` values.
- Add a `balloon_stage_height` parameter (default 400) to control the balloon stage height, which was previously hard-coded and required `!important` overrides.
- Document the existing `max_pumps` parameter in the README.
