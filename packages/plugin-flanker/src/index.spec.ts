import { pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import jsPsychFlanker from ".";

jest.useFakeTimers();

describe("plugin-flanker", () => {
  describe("basic functionality", () => {
    it("should load with default parameters", async () => {
      const { expectFinished, getHTML } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "left",
          congruency: "congruent",
        },
      ]);

      expect(getHTML()).toContain("flanker-container");

      pressKey("arrowleft");

      await expectFinished();
    });

    it("should display correct number of stimuli (5-item array)", async () => {
      const { getHTML, expectFinished } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "left",
          congruency: "congruent",
          num_flankers: 4,
        },
      ]);

      const items = getHTML().match(/flanker-item/g);
      expect(items?.length).toBe(5); // 4 flankers + 1 target

      pressKey("arrowleft");
      await expectFinished();
    });

    it("should display correct number of stimuli (7-item array)", async () => {
      const { getHTML, expectFinished } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "left",
          congruency: "congruent",
          num_flankers: 6,
        },
      ]);

      const items = getHTML().match(/flanker-item/g);
      expect(items?.length).toBe(7); // 6 flankers + 1 target

      pressKey("arrowleft");
      await expectFinished();
    });
  });

  describe("congruency conditions", () => {
    it("should handle congruent trials", async () => {
      const { getData, expectFinished } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "left",
          congruency: "congruent",
        },
      ]);

      pressKey("arrowleft");
      await expectFinished();

      expect(getData().values()[0].congruency).toBe("congruent");
      expect(getData().values()[0].correct).toBe(true);
    });

    it("should handle incongruent trials", async () => {
      const { getData, expectFinished } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "left",
          congruency: "incongruent",
        },
      ]);

      pressKey("arrowleft");
      await expectFinished();

      expect(getData().values()[0].congruency).toBe("incongruent");
      expect(getData().values()[0].correct).toBe(true);
    });

    it("should handle neutral trials", async () => {
      const { getData, expectFinished } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "left",
          congruency: "neutral",
        },
      ]);

      pressKey("arrowleft");
      await expectFinished();

      expect(getData().values()[0].congruency).toBe("neutral");
      expect(getData().values()[0].correct).toBe(true);
    });
  });

  describe("response accuracy", () => {
    it("should record correct response for left target", async () => {
      const { getData, expectFinished } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "left",
          congruency: "incongruent",
        },
      ]);

      pressKey("arrowleft");
      await expectFinished();

      expect(getData().values()[0].response).toBe("left");
      expect(getData().values()[0].correct).toBe(true);
    });

    it("should record incorrect response for left target", async () => {
      const { getData, expectFinished } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "left",
          congruency: "incongruent",
        },
      ]);

      pressKey("arrowright");
      await expectFinished();

      expect(getData().values()[0].response).toBe("right");
      expect(getData().values()[0].correct).toBe(false);
    });

    it("should record correct response for right target", async () => {
      const { getData, expectFinished } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "right",
          congruency: "incongruent",
        },
      ]);

      pressKey("arrowright");
      await expectFinished();

      expect(getData().values()[0].response).toBe("right");
      expect(getData().values()[0].correct).toBe(true);
    });

    it("should record incorrect response for right target", async () => {
      const { getData, expectFinished } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "right",
          congruency: "incongruent",
        },
      ]);

      pressKey("arrowleft");
      await expectFinished();

      expect(getData().values()[0].response).toBe("left");
      expect(getData().values()[0].correct).toBe(false);
    });
  });

  describe("custom response keys", () => {
    it("should accept custom left and right keys", async () => {
      const { getData, expectFinished } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "left",
          congruency: "congruent",
          response_keys_left: ["f", "F"],
          response_keys_right: ["j", "J"],
        },
      ]);

      pressKey("f");
      await expectFinished();

      expect(getData().values()[0].response).toBe("left");
      expect(getData().values()[0].correct).toBe(true);
    });

    it("should accept uppercase custom keys", async () => {
      const { getData, expectFinished } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "right",
          congruency: "congruent",
          response_keys_left: ["f", "F"],
          response_keys_right: ["j", "J"],
        },
      ]);

      pressKey("J");
      await expectFinished();

      expect(getData().values()[0].response).toBe("right");
      expect(getData().values()[0].correct).toBe(true);
    });
  });

  describe("button response mode", () => {
    it("should display buttons when response_mode is 'buttons'", async () => {
      const { getHTML, expectFinished, displayElement } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "left",
          congruency: "congruent",
          response_mode: "buttons",
        },
      ]);

      expect(getHTML()).toContain("flanker-btn-left");
      expect(getHTML()).toContain("flanker-btn-right");

      displayElement.querySelector("#flanker-btn-left").click();

      await expectFinished();
    });

    it("should record button responses correctly", async () => {
      const { getData, expectFinished, displayElement } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "right",
          congruency: "incongruent",
          response_mode: "buttons",
        },
      ]);

      displayElement.querySelector("#flanker-btn-right").click();

      await expectFinished();

      expect(getData().values()[0].response).toBe("right");
      expect(getData().values()[0].correct).toBe(true);
    });

    it("should use custom button labels", async () => {
      const { getHTML, expectFinished, displayElement } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "left",
          congruency: "congruent",
          response_mode: "buttons",
          button_label_left: "← Left Arrow",
          button_label_right: "Right Arrow →",
        },
      ]);

      expect(getHTML()).toContain("← Left Arrow");
      expect(getHTML()).toContain("Right Arrow →");

      displayElement.querySelector("#flanker-btn-left").click();

      await expectFinished();
    });
  });

  describe("timing parameters", () => {
    it("should handle response timeout", async () => {
      const { getData, expectFinished } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "left",
          congruency: "congruent",
          response_timeout: 500,
        },
      ]);

      // Wait long enough for timeout and RAF cycles
      await jest.advanceTimersByTimeAsync(600);
      await jest.runAllTimersAsync();

      await expectFinished();

      const data = getData().values()[0];
      expect(data.response).toBe(null);
    });

    it("should handle stimulus duration", async () => {
      const { getData, expectFinished } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "left",
          congruency: "congruent",
          stimulus_duration: 100,
          response_timeout: 2000,
        },
      ]);

      await jest.advanceTimersByTimeAsync(150);
      pressKey("arrowleft");

      await expectFinished();

      expect(getData().values()[0].response).toBe("left");
    });

    it("should record SOA value in data", async () => {
      const { getData, expectFinished } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "left",
          congruency: "incongruent",
          soa: -200,
        },
      ]);

      await jest.advanceTimersByTimeAsync(250);
      pressKey("arrowleft");
      await expectFinished();

      const data = getData().values()[0];
      expect(data.soa).toBe(-200);
    });
  });

  describe("custom stimuli", () => {
    it("should accept custom HTML for left stimulus", async () => {
      const { getHTML, expectFinished } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "left",
          congruency: "congruent",
          left_stimulus: '<span class="custom-left">H</span>',
          right_stimulus: '<span class="custom-right">S</span>',
        },
      ]);

      expect(getHTML()).toContain("custom-left");
      expect(getHTML()).toContain("H");

      pressKey("arrowleft");
      await expectFinished();
    });

    it("should accept custom HTML for neutral stimulus", async () => {
      const { getHTML, expectFinished } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "left",
          congruency: "neutral",
          left_stimulus: "<span>L</span>",
          right_stimulus: "<span>R</span>",
          neutral_stimulus: '<span class="neutral-stim">-</span>',
        },
      ]);

      expect(getHTML()).toContain("neutral-stim");

      pressKey("arrowleft");
      await expectFinished();
    });
  });

  describe("spatial configuration", () => {
    it("should handle vertical arrangement", async () => {
      const { getHTML, expectFinished } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "left",
          congruency: "congruent",
          flanker_arrangement: "vertical",
        },
      ]);

      expect(getHTML()).toContain("flex-direction: column");

      pressKey("arrowleft");
      await expectFinished();
    });

    it("should handle horizontal arrangement", async () => {
      const { getHTML, expectFinished } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "left",
          congruency: "congruent",
          flanker_arrangement: "horizontal",
        },
      ]);

      expect(getHTML()).toContain("flex-direction: row");

      pressKey("arrowleft");
      await expectFinished();
    });

    it("should apply custom stimulus size", async () => {
      const { getHTML, expectFinished } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "left",
          congruency: "congruent",
          stimulus_size: "64px",
        },
      ]);

      expect(getHTML()).toContain("width: 64px");
      expect(getHTML()).toContain("height: 64px");

      pressKey("arrowleft");
      await expectFinished();
    });

    it("should apply custom target-flanker separation", async () => {
      const { getHTML, expectFinished } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "left",
          congruency: "congruent",
          target_flanker_separation: "20px",
        },
      ]);

      // Check for margin-right or margin-left depending on arrangement
      const html = getHTML();
      expect(html.includes("margin-right: 20px") || html.includes("margin-left: 20px")).toBe(true);

      pressKey("arrowleft");
      await expectFinished();
    });
  });

  describe("data output", () => {
    it("should record all required data fields", async () => {
      const { getData, expectFinished } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "left",
          congruency: "incongruent",
          soa: -200,
          response_mode: "keyboard",
        },
      ]);

      await jest.advanceTimersByTimeAsync(250);
      pressKey("arrowleft");
      await expectFinished();

      const data = getData().values()[0];

      expect(data).toHaveProperty("target_direction", "left");
      expect(data).toHaveProperty("congruency", "incongruent");
      expect(data).toHaveProperty("soa", -200);
      expect(data).toHaveProperty("response_mode", "keyboard");
      expect(data).toHaveProperty("rt");
      expect(data).toHaveProperty("response", "left");
      expect(data).toHaveProperty("correct", true);
    });
  });

  describe("edge cases", () => {
    it("should work with zero SOA", async () => {
      const { getData, expectFinished } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "left",
          congruency: "congruent",
          soa: 0,
        },
      ]);

      pressKey("arrowleft");
      await expectFinished();

      expect(getData().values()[0].soa).toBe(0);
    });

    it("should work with positive SOA", async () => {
      const { getData, expectFinished } = await startTimeline([
        {
          type: jsPsychFlanker,
          target_direction: "right",
          congruency: "incongruent",
          soa: 200,
        },
      ]);

      await jest.advanceTimersByTimeAsync(250);
      pressKey("arrowright");
      await expectFinished();

      expect(getData().values()[0].soa).toBe(200);
    });
  });
});
