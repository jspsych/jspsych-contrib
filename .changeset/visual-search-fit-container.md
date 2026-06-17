---
"@jspsych-contrib/plugin-visual-search-click-target": minor
---

Make the visual search display embeddable and fix random positioning:

- Add a `fit_container` parameter (default `false`). When `true`, the display fills its display element using container-relative units (cqw/cqh/cqmin) instead of covering the viewport, so the task can be embedded in a sized card or panel rather than only running full screen.
- Fix an error on the default (random scatter) path: `image_positions` now defaults to `[]` instead of `null`, which jsPsych v8 rejects for an array parameter. Leaving it empty generates random non-overlapping positions as documented.
