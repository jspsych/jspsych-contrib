# jspsych-audio-swipe-response plugin

This plugin plays an audio file and records responses generated by both swipe gestures and keyboard response. This plugin will be useful for two-alternative forced choice (2AFC) assessments that will be administered on both desktop and mobile devices. The html prompt that accompanies the audio stimulus can be animated to move off-screen before the trial ends.

If the browser supports it, audio files are played using the WebAudio API. This allows for reasonably precise timing of the playback. The timing of responses generated is measured against the WebAudio specific clock, improving the measurement of response times. If the browser does not support the WebAudio API, then the audio file is played with HTML5 audio.

Audio files can be automatically preloaded by jsPsych using the preload plugin. However, if you are using timeline variables or another dynamic method to specify the audio stimulus, then you will need to manually preload the audio.

The trial can end when the participant responds, when the audio file has finished playing, or if the participant has failed to respond within a fixed length of time. You can also prevent a response from being recorded before the audio has finished playing.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins/#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Parameters can be left unspecified if the default value is acceptable.

| Parameter | Type | Default Value | Description |
| ----------|------|---------------|------------ |
| stimulus | audio file | `undefined` | Path to audio file to be played. |
| keyboard_choices | array of strings | `["ArrowLeft", "ArrowRight"]` | This array contains the key(s) that the participant is allowed to press in order to respond to the stimulus. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) and [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/) for more examples. Any key presses that are not listed in the array will be ignored. Specifying `"ALL_KEYS"` means that all keys will be accepted as valid responses. The default value of `"NO_KEYS"` will mean that no responses are allowed. | |
| prompt | string | null | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press). |
| trial_duration | numeric | null | How long to wait for the participant to make a response before ending the trial in milliseconds. If the participant fails to make a response before this timer is reached, the participant's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, the trial will wait for a response indefinitely. |
| response_ends_trial | boolean | true | If true, then the trial will end whenever the participant makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can set this parameter to `false` to force the participant to listend to the stimulus for a fixed amount of time, even if they respond before the time is complete. |
| trial_ends_after_audio | boolean | false | If true, then the trial will end as soon as the audio file finishes playing. |
| response_allowed_while_playing | boolean | true | If true, then responses are allowed while the audio is playing. If false, then the audio must finish playing before a response is accepted. Once the audio has played all the way through, a valid response is allowed (including while the audio is being re-played via on-screen playback controls). |
| swipe_threshold | numeric | 20 | How far away from the center should the participant have to swipe for a left/right response to be recorded. If the participant releases their finger before this threshold, the stimulus will return to the neutral center position. If the participant exceeds this threshold, the swipe response will be recorded. |
| swipe_offscreen_coordinate | numeric | 1000 | The offscreen coordinate for the swipe animation. |
| swipe_animation_max_rotation | numeric | 20 | How much should the swipe animation rotate the stimulus (in degrees). When the participant drags to the left (right), the stimulus will rotate slightly clockwise (counter-clockwise). */
| swipe_animation_duration | numeric | 250 | How long should the swipe animation last in milliseconds. Set this to zero to disable the animation. This animation time will not be included in the reaction time. |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins/#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| keyboard_response | string | Indicates which key the participant pressed. If the participant responded using button clicks, then this field will be `null`. |
| swipe_response | string | Indicates which direction the participant swiped. This will be either `"left"` or `"right"`. If the participant responded using the keyboard, then this field will be `null`. |
| response_source | string | Indicates the source of the response. This will either be `"swipe"` or `"keyboard"`. |
| rt        | numeric | The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. |
| stimulus  | string  | The HTML content that was displayed on the screen. |

## Example

```javascript
var trial = {
  type: jsPsychAudioSwipeResponse,
  stimulus: 'sound/tone.mp3',
  prompt: "<p>Is the pitch high or low? Swipe left for low and swipe right for high.</p>",
  response_ends_trials: true,
};
```
