---
"@jspsych-contrib/extension-humancheck": minor
---

Initial release of `extension-humancheck`: a jsPsych extension that collects evidence a participant
is a bot or an AI agent rather than a person, and scores each session without blocking anyone. It
records interaction traces (pointer movement, click geometry, key timing, pastes, focus and
visibility changes, and synthetic events), probes the browser for signs of automation, and plants a
hidden honeypot field and a hidden canary instruction in each trial it is attached to.
