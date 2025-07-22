import { startTimeline } from "@jspsych/test-utils";

import jsPsychSpatialNback from ".";

jest.useFakeTimers();

describe("plugin-spatial-nback", () => {
  
  /**
   * Test 1: Basic Plugin Loading
   * Verifies that the plugin loads with default parameters and basic functionality works
   */
  test("should load with default parameters", async () => {
    const { expectFinished, getHTML, getData } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        stimulus_row: 0,  // Explicitly set to test with stimulus, otherwise empty grid
        stimulus_col: 0,
      },
    ]);

    // Check that essential DOM elements are created
    expect(getHTML()).toContain('id="nback-grid"');
    expect(getHTML()).toContain('id="nback-response-btn"');
    // Check that the stimulus cell was created
    expect(getHTML()).toContain("<div id=\"cell-0-0\" style=\"width: 125px; height: 125px; border: 1px solid #ccc; box-sizing: border-box; background-color: rgb(0, 102, 204);\"></div>");

    // Simulate user clicking response button
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(1251); // 750ms stimulus + 500ms ISI + 1ms to complete trial
    await expectFinished();

    // Verify collected data matches expectations
    const data = getData().values()[0];
    expect(data.stimulus_row).toBe(0);
    expect(data.stimulus_col).toBe(0);
    expect(data.is_target).toBe(false);
    expect(data.response).toBe(true);
    expect(typeof data.response_time).toBe("number");
    expect(data.correct).toBe(false); // Incorrect because responded to non-target trial
  });

  /**
   * Test 2: Custom Grid Dimensions
   * Tests that grids can be created with custom row and column counts
   */
  test("should create grid with custom rows and columns", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        rows: 15,
        cols: 5,
        stimulus_row: 0,  // Add stimulus for testing
        stimulus_col: 0,
      },
    ]);

    // Verify all grid cells are created with correct IDs
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 5; col++) {
        expect(getHTML()).toContain(`id="cell-${row}-${col}"`);
      }
    }

    // Complete the trial
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(1251); // 750ms stimulus + 500ms ISI + 1ms to complete trial
    await expectFinished();
  });

  /**
   * Test 3: Stimulus Positioning and Color
   * Verifies stimulus appears at specified position with custom color
   */
  test("should display stimulus at specified position and color", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        stimulus_row: 1,
        stimulus_col: 2,
        stimulus_color: "#ff0000", // Red color
      },
    ]);

    // Allow stimulus to appear
    
    // Check that stimulus cell has correct background color
    const stimulusCell = document.getElementById("cell-1-2") as HTMLElement;
    expect(stimulusCell.style.backgroundColor).toBe("rgb(255, 0, 0)"); // #ff0000 converted to RGB

    // Complete the trial
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(1251); // 750ms stimulus + 500ms ISI + 1ms to complete trial
    await expectFinished();
  });

  /**
   * Test 4: Target Trial Handling
   * Tests correct response to target trials
   */
  test("should handle target trials correctly", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        stimulus_row: 2,
        stimulus_col: 1,
        is_target: true,
      },
    ]);

    // Respond to target trial
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(1250); // 750ms stimulus + 500ms ISI
    await expectFinished();

    const data = getData().values()[0];
    expect(data.is_target).toBe(true);
    expect(data.response).toBe(true);
    expect(data.correct).toBe(true); // Correct because responded to target trial
  });

  /**
   * Test 5: No Response Handling
   * Tests correct handling when no response is given
   */
  test("should handle no response correctly", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        stimulus_row: 1,
        stimulus_col: 1,
        stimulus_duration: 500,
        isi_duration: 500,
        is_target: false,
      },
    ]);

    // Let entire trial duration pass without any response
    jest.advanceTimersByTime(1001); // 500ms stimulus + 500ms ISI + 1ms to complete trial and collect data
    await expectFinished();
    // Verify no response data is correctly recorded
    const data = getData().values()[0];
    expect(data.response).toBe(false);
    expect(data.response_time).toBe(null);
    expect(data.correct).toBe(true); // Correct because didn't respond to non-target
  });

  /**
   * Test 6: Feedback Display
   * Tests that feedback is shown when enabled
   */
  test("should show feedback when enabled", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        stimulus_row: 0,
        stimulus_col: 0,
        show_feedback_text: true,
        show_feedback_border: true,
        feedback_duration: 500,
        is_target: true,
      },
    ]);    // Respond to trigger feedback
    document.getElementById("nback-response-btn")?.click();
    
    // Check feedback is displayed
    const feedbackDiv = document.getElementById("nback-feedback");
    expect(feedbackDiv?.textContent).toContain("Correct!");
    
    const grid = document.getElementById("nback-grid") as HTMLElement;
    expect(grid.style.border).toContain("3px solid");

    jest.advanceTimersByTime(2250); // 750ms stimulus + 1000ms ISI + 500ms feedback
    await expectFinished();
  });

  /**
   * Test 7: Hide Feedback
   * Tests that feedback is hidden when disabled
   */
  test("should hide feedback when disabled", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        stimulus_row: 0,
        stimulus_col: 0,
        show_feedback_text: false,
        show_feedback_border: false,
        feedback_duration: 0,
        is_target: true,
      },
    ]);

    // Respond to trigger potential feedback
    document.getElementById("nback-response-btn")?.click();
    
    // Check no feedback is displayed
    const feedbackDiv = document.getElementById("nback-feedback");
    expect(feedbackDiv?.textContent).toBe("Correct! (999ms)"); // Dummy text is present
    expect(feedbackDiv?.style.visibility).toBe("hidden"); // But hidden from view
    
    const grid = document.getElementById("nback-grid") as HTMLElement;
    expect(grid.style.border).not.toContain("3px solid #00cc00");

    jest.advanceTimersByTime(1750); // 750ms stimulus + 1000ms ISI + 0ms feedback
    await expectFinished();
  });

  /**
   * Test 8: Custom Button Text
   * Tests that custom button text is displayed
   */
  test("should use custom button text", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        stimulus_row: 0,
        stimulus_col: 0,
        buttons: "CUSTOM BUTTON",
      },
    ]);

    expect(getHTML()).toContain("CUSTOM BUTTON");
    
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(1250); // 750ms stimulus + 500ms ISI
    await expectFinished();
  });

  /**
   * Test 9: Custom Instructions
   * Tests that custom instructions are displayed
   */
  test("should use custom instructions", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        stimulus_row: 0,
        stimulus_col: 0,
        instructions: "Custom test instructions",
      },
    ]);

    expect(getHTML()).toContain("Custom test instructions");
    
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(1250); // 750ms stimulus + 500ms ISI
    await expectFinished();
  });

  /**
   * Test 10: Stimulus Duration
   * Tests that stimulus duration is respected
   */
  test("should respect stimulus duration (and color)", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        stimulus_row: 0,
        stimulus_col: 0,
        stimulus_duration: 200,
        stimulus_color: "#ff0000",
      },
    ]);

    const stimulusCell = document.getElementById("cell-0-0") as HTMLElement;
    expect(stimulusCell.style.backgroundColor).toBe("rgb(255, 0, 0)");    
    
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(700); // 200ms stimulus + 500ms ISI
    await expectFinished();
  });

  /**
   * Test 11: Feedback Duration
   * Tests that feedback duration is respected
   */
  test("should handle feedback duration correctly", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        stimulus_row: 0,
        stimulus_col: 0,
        feedback_duration: 800,
        show_feedback_text: true,
        is_target: true,
      },
    ]);

    // Respond to trigger feedback
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(2050); // 750ms stimulus + 1000ms ISI + 800ms feedback
    await expectFinished();
  });

  /**
   * Test 12: Custom Colors
   * Tests that custom colors are used correctly
   */
  test("should use custom colors", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        stimulus_row: 0,
        stimulus_col: 0,
        stimulus_color: "#ffaa00",
        correct_color: "#00ffaa",
        show_feedback_border: true,
        feedback_duration: 200,
        is_target: true,
      },
    ]);

    // Check stimulus color
    const stimulusCell = document.getElementById("cell-0-0") as HTMLElement;
    expect(stimulusCell.style.backgroundColor).toBe("rgb(255, 170, 0)");
    
    // Respond to trigger feedback
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(1950); // 750ms stimulus + 1000ms ISI + 200ms feedback
    await expectFinished();
  });

  /**
   * Test 13: Incorrect Response
   * Tests handling of incorrect responses
   */
  test("should handle incorrect responses", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        stimulus_row: 0,
        stimulus_col: 0,
        is_target: false, // Not a target, so response should be incorrect
        show_feedback_text: true,
        feedback_duration: 200,
      },
    ]);

    // Respond (incorrectly) to non-target
    document.getElementById("nback-response-btn")?.click();    
    // Check feedback shows incorrect
    const feedbackDiv = document.getElementById("nback-feedback");
    expect(feedbackDiv?.textContent).toContain("Incorrect!");
    
    jest.advanceTimersByTime(1850); // 750ms stimulus + 500ms ISI + 200ms feedback
    await expectFinished();
    
    const data = getData().values()[0];
    expect(data.correct).toBe(false);
  });

  /**
   * Test 14: Data Collection
   * Tests that all expected data is collected
   */
  test("should collect all expected data", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        stimulus_row: 2,
        stimulus_col: 1,
        is_target: true,
      },
    ]);

    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(1250); // 750ms stimulus + 500ms ISI
    await expectFinished();

    const data = getData().values()[0];
    expect(data.stimulus_row).toBe(2);
    expect(data.stimulus_col).toBe(1);
    expect(data.is_target).toBe(true);
    expect(data.response).toBe(true);
    expect(typeof data.response_time).toBe("number");
    expect(data.correct).toBe(true);
  });

  /**
   * Test 15: Empty Grid when stimulus positions are null
   * Tests that empty grid is shown when stimulus_row and stimulus_col are null
   */
  test("should show empty grid when stimulus positions are null", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        // stimulus_row and stimulus_col are null by default
        is_target: false,
      },
    ]);

    // Check that no stimulus is shown (all cells should have no background color set)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const cell = document.getElementById(`cell-${row}-${col}`) as HTMLElement;
        expect(cell.style.backgroundColor).toBe(""); // No inline background color
      }
    }

    // Wait for trial to complete without response
    jest.advanceTimersByTime(1251); // 750ms stimulus + 500ms ISI + 1ms to complete trial and collect data
    await expectFinished();

    const data = getData().values()[0];
    expect(data.stimulus_row).toBe(null);
    expect(data.stimulus_col).toBe(null);
    expect(data.response).toBe(false);
    expect(data.correct).toBe(true); // Correct because didn't respond to non-target empty grid
  });

  /**
   * Test 16: Target trials with empty grid
   * Tests that responding to empty grid is always incorrect
   */
  test("should handle target trials with empty grid", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        // stimulus_row and stimulus_col are null by default
        is_target: true, // This doesn't matter for empty grids
      },
    ]);

    // Respond to empty grid
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(1250); // 750ms stimulus + 500ms ISI
    await expectFinished();

    const data = getData().values()[0];
    expect(data.stimulus_row).toBe(null);
    expect(data.stimulus_col).toBe(null);
    expect(data.response).toBe(true);
    expect(data.correct).toBe(false); // Always incorrect to respond to empty grid
  });

  /**
   * Test 17: No response to empty grid
   * Tests that not responding to empty grid is always correct
   */
  test("should handle no response to empty grid", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        // stimulus_row and stimulus_col are null by default
        is_target: false,
      },
    ]);

    // Don't respond to empty grid
    jest.advanceTimersByTime(1251); // 750ms stimulus + 500ms ISI + 1ms to complete trial and collect data
    await expectFinished();

    const data = getData().values()[0];
    expect(data.stimulus_row).toBe(null);
    expect(data.stimulus_col).toBe(null);
    expect(data.response).toBe(false);
    expect(data.correct).toBe(true); // Always correct to not respond to empty grid
  });

  /**
   * Test 18: Feedback with empty grid trials
   * Tests that feedback works correctly with empty grid trials
   */
  test("should show feedback for empty grid trials", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        // stimulus_row and stimulus_col are null by default
        show_feedback_text: true,
        show_feedback_border: true,
        feedback_duration: 500,
        is_target: false,
      },
    ]);

    // Respond to empty grid (should be incorrect)
    document.getElementById("nback-response-btn")?.click();
    
    // Check feedback shows incorrect
    const feedbackDiv = document.getElementById("nback-feedback");
    expect(feedbackDiv?.textContent).toContain("Incorrect!");
    
    const grid = document.getElementById("nback-grid") as HTMLElement;
    expect(grid.style.border).toContain("3px solid #cc0000");
    
    jest.advanceTimersByTime(1750); // 750ms stimulus + 500ms ISI + 500ms feedback
    await expectFinished();
  });

  /**
   * Test 19: ISI timing consistency
   * Tests that ISI duration is waited when response occurs during ISI
   */
  test("should wait full ISI duration when response occurs during ISI", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        stimulus_row: 0,
        stimulus_col: 0,
        stimulus_duration: 500,
        isi_duration: 1000,
        feedback_duration: 0,
        is_target: true,
      },
    ]);

    // Wait for stimulus to end and respond during ISI
    jest.advanceTimersByTime(700); // 500ms stimulus + 200ms into ISI
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(800); // Remaining 800ms of ISI
    await expectFinished();
  });

  /**
   * Test 20: ISI timing with feedback
   * Tests that ISI duration is waited when response occurs during ISI with feedback
   */
  test("should wait full ISI duration when response occurs during ISI with feedback", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        stimulus_row: 0,
        stimulus_col: 0,
        stimulus_duration: 500,
        isi_duration: 1000,
        feedback_duration: 300,
        show_feedback_text: true,
        is_target: true,
      },
    ]);

    // Wait for stimulus to end and respond during ISI
    jest.advanceTimersByTime(700); // 500ms stimulus + 200ms into ISI
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(1100); // Remaining 800ms of ISI + 300ms feedback
    await expectFinished();
  });

  /**
   * Test 21: Button disabled after response even when feedback_duration is 0
   * Tests that button is disabled after response even when feedback_duration is 0
   */
  test("should disable button after response even when feedback_duration is 0", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        stimulus_row: 0,
        stimulus_col: 0,
        feedback_duration: 0,
        show_feedback_text: false,
        show_feedback_border: false,
        is_target: true,
      },
    ]);

    // Respond to trigger feedback period
    document.getElementById("nback-response-btn")?.click();
    
    // Check that button is disabled after response even when feedback_duration is 0
    const button = document.getElementById("nback-response-btn") as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    jest.advanceTimersByTime(1250); // 750ms stimulus + 500ms ISI
    await expectFinished();
  });

  /**
   * Test 22: No feedback flash when feedback_duration is 0 and no response
   * Tests that feedback doesn't flash when feedback_duration is 0 but feedback is enabled and no response is made
   */
  test("should not show feedback flash when feedback_duration is 0 and no response is made", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        stimulus_row: 0,
        stimulus_col: 0,
        feedback_duration: 0,
        show_feedback_text: true,
        show_feedback_border: true,
        is_target: false,
      },
    ]);

    jest.advanceTimersByTime(1250); // 750ms stimulus + 500ms ISI
    
    // Check that no feedback is shown (no text in feedback div and no border)
    const feedbackDiv = document.getElementById("nback-feedback");
    const grid = document.getElementById("nback-grid") as HTMLElement;
    
    expect(feedbackDiv?.textContent || "").toBe("Correct! (999ms)"); // Dummy text is present
    expect(feedbackDiv?.style.visibility || "").toBe("hidden"); // But hidden from view
    expect(grid?.style.border || "").not.toContain("3px solid #cc0000");
    jest.advanceTimersByTime(1); // 1ms to complete trial
    await expectFinished();
    
    // Verify the trial ended correctly with no response
    const data = getData().values()[0];
    expect(data.response).toBe(false);
    expect(data.correct).toBe(true); // Correct because is_target is false and no response was made
  });

});