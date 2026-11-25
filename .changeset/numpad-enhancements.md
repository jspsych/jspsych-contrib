---
"@jspsych-contrib/plugin-numpad": minor
---

various improvements to the usability of the plugin. please note breaking changes when updating to this version!

- `numpad_layout` is more customizable as a 2D rectangular array, with custom keys `"delete"` and `"continue"`, alongside a `"negative"` toggle, `"separator"` key, `"decimal"` key, and `null` for empty cells. you may now also have multi-digit keys (such as `"00"`s for currency), and merged keys if they are adjacent.
- customizable `negative_button_text`, `decimal_character`, and `separator_character` parameters for internationalization. you can have numbers auto-separate in the display with `separate_pattern` for the thousands/Indian number groupings. the keyboard mode can also take advantage of these new characters.
- `format_function` parameter for custom displays (like currency or units).
- `trial_duration` parameter for setting a time limit, which will automatically use the input given if time runs out
- custom `validate_fn` for more fine-tuned control over the correctness of various answers.
- better formatting for mobile devices, error messages having reserved space to prevent numpad from jumping, and large numbers are now cut off from the left after shrinking to fit.
- new data fields `raw_number` for ease of data use, and `key_presses` for each individual press, recorded by rt, key, and if it was a numpad button or not. 

breaking changes:

- `numpad_layout` is now a 2D array with one inner array per row, and the delete and continue keys are `"delete"` and `"continue"` instead of `"X"` and `"C"`. the old default `[1, 2, 3, 4, 5, 6, 7, 8, 9, "X", 0, "C"]` is now `[[1, 2, 3], [4, 5, 6], [7, 8, 9], ["delete", 0, "continue"]]`.
- `error_message` is now a function `(input, reason) => string` instead of a string. to keep a fixed message, use `error_message: () => "your message"`.
- `min_digits` can no longer be `null`; use `0` to allow an empty response.
- trial parameters are properly validated, so malformed trials will now error on experiment run,
- `#jspsych-numpad-error` is always displayed with a fixed height and is empty until there is an error, instead of being hidden with `display: none`,

