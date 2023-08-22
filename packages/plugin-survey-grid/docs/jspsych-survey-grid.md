# jspsych-survey-grid

The survey-grid plugin displays a set of questions with Likert scale responses on a grid. The participant responds by selecting a radio button.

The plugin provides multiple passive methods for detecting carless and/or insufficient effort (C/IE) responding:

- It records the target and timing of every radio button event during the trial. This can be used to detect unusually fast or large numbers of radio events, which may indicate a bot or script user.
- It has a honeypot question (i.e., a question hidden from humans but "visible" to bots) embedded in it. Responses to this item may indicate a bot or script user.
- It records page time, or the time from when the questions first appear on the screen until the participant's response(s) are submitted. Unusually fast page times may indicate low-quality responses.
- It scores participants' responses for "straightlining" and "zigzagging", two forms of C/IE responding (see references below). Scores closer to 1 on either metric may indicate low-quality responses.

Note: The use of additional attention checks, such as infrequency items (Huang et al., 2015), may further aid in detecting C/IE responding.

## Parameters

| Parameter | Type | Default Value | Description |
|-----------|------|---------------|-------------|
| questions | array | _undefined_  | An array of objects, each object represents a question that appears on the screen. Each object contains a prompt and required parameters that will be applied to the question. See examples below for further clarification. `prompt:` Type string, default value is _undefined_. The strings are the question that will be associated with an item. `reverse:` Type boolean, default value is false. Reverse-scores the response to that question if true. `required:` Type boolean, default value is false. Makes answering questions required. `name:` Name of the question. Used for storing data. If left undefined then default names (`Q1`, `Q2`, ...) will be used for the questions. |
| randomize_question_order | boolean | `false` | If true, the display order of `questions` is randomly determined at the start of the trial. In the data object, `Q1` will still refer to the first question in the array, regardless of where it was presented visually. |
| labels | array | _undefined_ | An array of strings that define the labels to display above the questions. If you want to use blank responses and only label the end points or some subset of the options, just insert a blank string for the unlabeled responses. |
| preamble | string | empty string | HTML formatted string to display at the top of the page above all the questions. |
| zero_indexed | boolean | false | Whether the lowest anchor of the scale should be scored as zero (true) or one (false) |
| scale_width | numeric | 960 | The width of the survey grid in pixels. |
| prompt_width | numeric | 50 | The percentage of the scale width allocated to the question prompts |
| labels_repeat | numeric | 10 | The number of items after which the scale labels are repeated. |
| hover_color | string | '#DEE8EB' | The background color of a question when hovered over. Should be specified as a _hex_ or `rgb(r,g,b)` value. |
| button_label | string | 'Continue' | Label of the button. |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org//7.3/overview/plugins/index.html#data-collected-by-all-plugins), this plugin collects the following data for each trial:

| Name        | Type   | Value |
|-------------|--------|-------|
| responses   | object | An object containing the data for each question. `name:` The name for each question. If the `name` parameter is defined for the question, then the response object will use the value of `name` as the key for each question. Otherwise, the first question in the trial is recorded as `Q1`, the second as `Q2`, and so on. `item_pos:` The position of the question on the page (from the top). `resp_pos:` The position of the response selected on the Likert scale for that question, encoded as an integer. `response:` The response to the question, encoded as an integer. Will be identical to `resp_pos` if `reverse = false` and `zero_indexed = true`. |
| page_events | object | An object containing a record of all radio button events on the page. `event_target`: The target of the radio button event. The naming convention of each radio button is `{name}_{resp_pos}`. `event_time`: The time of the event in milliseconds. The time is measured from when the questions first appear on the screen. |
| diagnostics | object | An object containing diagnostics of the quality of responses. `page_time:` The response time, in milliseconds, for the participant to make a response. The time is measured from when the questions first appear on the screen until the participant's response(s) are submitted. `honeypot:` The number of hidden radio buttons checked. `straightlining`: The maximum fraction of responses of the same position. `zigzagging:` The fraction of responses consistent with a zig-zagging response pattern. |

## Example(s)

### General Anxiety Disorder-7 (GAD-7) scale

```javascript
var gad7 = {
  type: jsPsychSurveyGrid,
  questions: [
    {prompt: "Feeling nervous, anxious, or on edge",              reverse: false, required: true},
    {prompt: "Not being able to stop or control worrying",        reverse: false, required: true},
    {prompt: "Worrying too much about different things",          reverse: false, required: true},
    {prompt: "Trouble relaxing",                                  reverse: false, required: true},
    {prompt: "Being so restless that it's hard to sit still",     reverse: false, required: true},
    {prompt: "Becoming easily annoyed or irritable",              reverse: false, required: true},
    {prompt: "Feeling afraid as if something awful might happen", reverse: false, required: true},
  ],
  labels: [
    "Not at all",
    "Several days",
    "Over half the days",
    "Nearly every day"
  ],
  preamble: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
  randomize_question_order: true,
  scale_width: 900,
  prompt_width: 40,
  labels_repeat: 7,
}
```

### State-Trait Anxiety Inventory (STAI)

```javascript
var stai = {
  type: jsPsychSurveyGrid,
  questions: [
    {prompt: "I feel pleasant.",                                                                        reverse: true},
    {prompt: "I feel nervous and restless.",                                                            reverse: false},
    {prompt: "I feel satisfied with myself.",                                                           reverse: true},
    {prompt: "I wish I could be as happy as others seem to be.",                                        reverse: false},
    {prompt: "I feel like a failure.",                                                                  reverse: false},
    {prompt: "I feel rested.",                                                                          reverse: true},
    {prompt: 'I am "calm, cool, and collected".',                                                       reverse: true},
    {prompt: "I feel that difficulties are piling up so that I cannot overcome them.",                  reverse: false},
    {prompt: "I worry too much over something that doesn't really matter.",                             reverse: false},
    {prompt: "I am happy.",                                                                             reverse: true},
    {prompt: "I have disturbing thoughts.",                                                             reverse: false},
    {prompt: "I lack self-confidence.",                                                                 reverse: false},
    {prompt: "I feel secure.",                                                                          reverse: true},
    {prompt: "I make decisions easily.",                                                                reverse: true},
    {prompt: "I feel inadequate.",                                                                      reverse: false},
    {prompt: "I am content.",                                                                           reverse: true},
    {prompt: "Some unimportant thought runs through my mind and bothers me.",                           reverse: false},
    {prompt: "I take disappointments so keenly that I can't put them out of my mind.",                  reverse: false},
    {prompt: "I am a steady person.",                                                                   reverse: true},
    {prompt: "I get in a state of tension or turmoil as I think over my recent concerns and interest.", reverse: false},
  ],
  labels: [
    "Almost never",
    "Sometimes",
    "Often",
    "Almost always"
  ],
  preamble: 'Read each statement and then choose the answer to indicate how you generally feel.',
  randomize_question_order: true,
  scale_width: 960,
  prompt_width: 45,
  labels_repeat: 5,
}
```

## References
- Huang JL, Bowling NA, Liu M, Li Y (2015). Detecting Insufficient Effort Responding with an Infrequency Scale: Evaluating Validity and Participant Reactions. J Bus Psychol 30:299–311.
- Curran, P. G. (2016). Methods for the detection of carelessly invalid responses in survey data. Journal of Experimental Social Psychology, 66, 4-19.
- Moss, A., & Litman, L. (2018). After the bot scare: Understanding what’s been happening with data collection on MTurk and how to stop it.
- Leiner, D. J. (2019). Too fast, too straight, too weird: Non-reactive indicators for meaningless data in internet surveys. In Survey Research Methods (Vol. 13, No. 3, pp. 229-248).
