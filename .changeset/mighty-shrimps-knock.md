---
"@jspsych-contrib/extension-countdown": patch
"@jspsych-contrib/extension-device-motion": patch
"@jspsych-contrib/extension-mediapipe-face-mesh": patch
"@jspsych-contrib/extension-touchscreen-buttons": patch
"@jspsych-contrib/plugin-corsi-blocks": minor
---

Plugin corsi blocks issue 141
In this updated version, the trial only ends when the response length matches the sequence length, regardless of whether the clicks were correct or not. This allows the user to register an incorrect sequence without ending the trial immediately.
