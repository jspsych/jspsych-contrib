import { clickTarget, pressKey, startTimeline } from "@jspsych/test-utils";

import jsPsychFreeRecallResponse from ".";

jest.useFakeTimers();

describe("free-recall-response plugin", () => {
  it("should load and display prompt", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychFreeRecallResponse,
        prompt: "<p>Test prompt</p>",
      },
    ]);

    expect(displayElement.innerHTML).toContain("Test prompt");
    expect(displayElement.querySelector("#free-recall-input")).not.toBeNull();
    expect(displayElement.querySelector("#free-recall-add-btn")).not.toBeNull();
    expect(displayElement.querySelector("#free-recall-done-btn")).not.toBeNull();
  });

  it("should end trial when done button is clicked", async () => {
    const { expectFinished, displayElement } = await startTimeline([
      {
        type: jsPsychFreeRecallResponse,
      },
    ]);

    // Click the done button
    const doneBtn = displayElement.querySelector("#free-recall-done-btn") as HTMLButtonElement;
    doneBtn.click();

    await expectFinished();
  });

  it("should add words when add button is clicked", async () => {
    const { displayElement, getData } = await startTimeline([
      {
        type: jsPsychFreeRecallResponse,
      },
    ]);

    // Type a word
    const input = displayElement.querySelector("#free-recall-input") as HTMLInputElement;
    input.value = "apple";

    // Click add button
    const addBtn = displayElement.querySelector("#free-recall-add-btn") as HTMLButtonElement;
    addBtn.click();

    // Check word appears in list
    const wordsList = displayElement.querySelector("#free-recall-words-list") as HTMLDivElement;
    expect(wordsList.innerHTML).toContain("APPLE");

    // Add another word
    input.value = "banana";
    addBtn.click();
    expect(wordsList.innerHTML).toContain("BANANA");

    // Click done
    const doneBtn = displayElement.querySelector("#free-recall-done-btn") as HTMLButtonElement;
    doneBtn.click();

    // Check data
    const data = getData().values()[0];
    expect(data.responses).toHaveLength(2);
    expect(data.responses[0].word).toBe("APPLE");
    expect(data.responses[1].word).toBe("BANANA");
  });

  it("should add words when Enter key is pressed", async () => {
    const { displayElement, getData } = await startTimeline([
      {
        type: jsPsychFreeRecallResponse,
      },
    ]);

    // Type a word
    const input = displayElement.querySelector("#free-recall-input") as HTMLInputElement;
    input.value = "cat";

    // Press Enter
    const event = new KeyboardEvent("keydown", { key: "Enter" });
    input.dispatchEvent(event);

    // Check word appears in list
    const wordsList = displayElement.querySelector("#free-recall-words-list") as HTMLDivElement;
    expect(wordsList.innerHTML).toContain("CAT");

    // Click done
    const doneBtn = displayElement.querySelector("#free-recall-done-btn") as HTMLButtonElement;
    doneBtn.click();

    const data = getData().values()[0];
    expect(data.responses).toHaveLength(1);
    expect(data.responses[0].word).toBe("CAT");
  });

  it("should respect minimum_words parameter", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychFreeRecallResponse,
        minimum_words: 2,
      },
    ]);

    const doneBtn = displayElement.querySelector("#free-recall-done-btn") as HTMLButtonElement;
    expect(doneBtn.disabled).toBe(true);

    // Add one word
    const input = displayElement.querySelector("#free-recall-input") as HTMLInputElement;
    const addBtn = displayElement.querySelector("#free-recall-add-btn") as HTMLButtonElement;
    input.value = "word1";
    addBtn.click();

    // Still disabled
    expect(doneBtn.disabled).toBe(true);

    // Add second word
    input.value = "word2";
    addBtn.click();

    // Now enabled
    expect(doneBtn.disabled).toBe(false);
  });

  it("should use custom button labels", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychFreeRecallResponse,
        add_button_label: "Submit Word",
        done_button_label: "Finish",
      },
    ]);

    expect(displayElement.innerHTML).toContain("Submit Word");
    expect(displayElement.innerHTML).toContain("Finish");
  });
});
