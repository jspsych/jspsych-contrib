# plugin-redirect-to-url

## Overview

The `redirect-to-url` plugin is designed to smoothly redirect participants to an external URL after a trial or at the end of an experiment. This is especially useful when integrating with participant recruitment or compensation platforms such as Prolific or MTurk. The plugin optionally displays an HTML stimulus along with one or more response buttons. When a participant clicks one of the buttons, the plugin records their response and response time, disables further input, and then redirects the browser to a specified URL. You can configure whether the redirection should occur in the current tab or open a new tab, and whether the redirection should also terminate the jsPsych experiment (`abort_on_submit`) or allow it to continue after saving the response. The plugin also supports fully customizable HTML button rendering via a user-defined function.

---

## Loading (Note: these CDN resources don't currently exist... but maybe will eventually?)

Using the CDN-hosted JavaScript file:

```html
<script src="https://unpkg.com/@jspsych/plugin-redirect-to-url@VERSION_HERE"></script>
```

Using a local copy downloaded from a GitHub release:

```html
<script src="jspsych/plugin-redirect-to-url.js"></script>
```

Using NPM:

```bash
npm install @jspsych/plugin-redirect-to-url
```

```ts
import jsPsychRedirectToUrl from "@jspsych/plugin-redirect-to-url";
```

---

## Compatibility

- jsPsych version: **v8.0.0 or later**

---

## Parameters

| Name              | Type             | Default       | Description                                                                                 |
| ----------------- | ---------------- | ------------- | ------------------------------------------------------------------------------------------- |
| `stimulus`        | HTML string      | `null`        | Optional stimulus (e.g., message or instructions) displayed above the buttons.              |
| `choices`         | Array of strings | `null`        | Labels for the response buttons.                                                            |
| `button_html`     | Function         | _(see below)_ | Function returning the HTML for each button.                                                |
| `url`             | String           | `undefined`   | The URL to which the participant will be redirected.                                        |
| `abort_on_submit` | Boolean          | `true`        | Whether to immediately end the experiment before redirecting (recommended at end of study). |
| `open_in_new_tab` | Boolean          | `false`       | Whether to open the URL in a new browser tab.                                               |

**Default `button_html` function:**

```ts
(choice: string, choice_index: number) =>
  `<button class="jspsych-btn">${choice}</button>`;
```

---

## Data Generated

| Name       | Type    | Description                                                     |
| ---------- | ------- | --------------------------------------------------------------- |
| `stimulus` | String  | The HTML string shown above the buttons.                        |
| `rt`       | Integer | Time (in ms) from trial start to participant's button response. |
| `response` | Integer | Index of the button clicked (0-indexed from `choices` array).   |

---

## Example

```js
const redirect_trial = {
  type: "redirect-to-url",
  stimulus: "<p>Thank you for participating!</p>",
  choices: ["Click to complete study"],
  url: "https://app.prolific.co/submissions/complete?cc=1234ABC",
  abort_on_submit: true,
  open_in_new_tab: false,
};
```

---

## Notes

- The `abort_on_submit` flag is particularly useful if you do not want to show jsPsych’s end-of-experiment screen.
- If `open_in_new_tab` is `true`, behavior may depend on the participant’s browser settings.

---

## Author / Citation

[Courtney B. Hilton](https://github.com/courtney-bryce-hilton)  
If you use this plugin in your research, please cite the corresponding repository or paper when available.
