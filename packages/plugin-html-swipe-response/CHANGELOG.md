# @jspsych-contrib/plugin-html-swipe-response

## 2.0.0

### Major Changes

- [#144](https://github.com/jspsych/jspsych-contrib/pull/144) [`1a7604b7331df666e954156724dc29228b37ffe7`](https://github.com/jspsych/jspsych-contrib/commit/1a7604b7331df666e954156724dc29228b37ffe7) Thanks [@jadeddelta](https://github.com/jadeddelta)! - Plugin updated to use jsPsych v8, with data now properly typed, proper audio integration, unnecessary timeout/display clears removed, and citations added if they exist. To use v7, check the README.md file for which version is compatible.

## 1.1.3

### Patch Changes

- [#136](https://github.com/jspsych/jspsych-contrib/pull/136) [`1e135ea6ccef00a8b8bb9b166ff01a1d8a80bb74`](https://github.com/jspsych/jspsych-contrib/commit/1e135ea6ccef00a8b8bb9b166ff01a1d8a80bb74) Thanks [@Emily-ejag](https://github.com/Emily-ejag)! - the patch ensures that both the container (`#jspsych-html-swipe-response-stimulus-container`) and the stimulus (`#jspsych-html-swipe-response-stimulus`) move together when dragged, providing a unified and seamless interaction.

## 1.1.2

### Patch Changes

- [#120](https://github.com/jspsych/jspsych-contrib/pull/120) [`d2e2ba21c2cdb0065d8f6a37bea8711d5cfdef4b`](https://github.com/jspsych/jspsych-contrib/commit/d2e2ba21c2cdb0065d8f6a37bea8711d5cfdef4b) Thanks [@richford](https://github.com/richford)! - Add a stimulus container div to wrap the stimulus div. This allows the user to swipe on the container even after the stimulus has been hidden due to exceeding the stimulus duration.

## 1.1.1

### Patch Changes

- [#112](https://github.com/jspsych/jspsych-contrib/pull/112) [`a5753c8fc0921a959ca4d6c2b60290fad7fdc668`](https://github.com/jspsych/jspsych-contrib/commit/a5753c8fc0921a959ca4d6c2b60290fad7fdc668) Thanks [@KruttikaBhat](https://github.com/KruttikaBhat)! - Bug fix: Added button response value to trial data.
  Bug fix: Disabled buttons for all response modalities. Added tests for this (keyboard and button).
  Additional feature: Added responded css class to the buttons based on the choice. Modified test to include this.

## 1.1.0

### Minor Changes

- [#110](https://github.com/jspsych/jspsych-contrib/pull/110) [`f692f01afc30f4f77199f15d113ce4664e16f4f2`](https://github.com/jspsych/jspsych-contrib/commit/f692f01afc30f4f77199f15d113ce4664e16f4f2) Thanks [@KruttikaBhat](https://github.com/KruttikaBhat)! - Added button response modality.

## 1.0.0

### Major Changes

- [#36](https://github.com/jspsych/jspsych-contrib/pull/36) [`13121e6`](https://github.com/jspsych/jspsych-contrib/commit/13121e69513bfdc572e0671173addcb057bb0ab7) Thanks [@richford](https://github.com/richford)! - Initial release
