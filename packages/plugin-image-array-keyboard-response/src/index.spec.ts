import { pressKey, startTimeline } from "@jspsych/test-utils";

import imageArrayKeyboardResponse from ".";

jest.useFakeTimers();

describe("image-array-keyboard-response", () => {
  test("displays image stimulus", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageArrayKeyboardResponse,
        stimulus: ["../media/blue.png"],
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<img src="../media/blue.png" id="jspsych-image-keyboard-response-stimulus-0"'
    );

    pressKey("a");
    await expectFinished();
  });
});
