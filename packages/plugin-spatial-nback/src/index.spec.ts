import { startTimeline } from "@jspsych/test-utils";

import jsPsychPluginSpatialNback from ".";

// Use fake timers to control time-based operations in tests
jest.useFakeTimers();

/**
 * Test suite for the spatial n-back plugin
 * Tests all parameters, functionality, and data collection
 */
describe("plugin-spatial-nback", () => {
  
  /**
   * Test 1: Basic Plugin Loading
   * Verifies that the plugin loads with default parameters and basic functionality works
   */
  it("should load with default parameters", async () => {
    const { expectFinished, getHTML, getData } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
      },
    ]);

    // Check that essential DOM elements are created
    expect(getHTML()).toContain('id="nback-grid"');
    expect(getHTML()).toContain('id="nback-response-btn"');
    expect(getHTML()).toContain("Click MATCH");

    // Simulate user clicking response button
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(2250); // Wait for complete trial duration (750ms stimulus + 1000ms ISI + 500ms feedback)
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
  it("should create grid with custom rows and columns", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        rows: 15,
        cols: 5,
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
    jest.advanceTimersByTime(2250);
  });

  /**
   * Test 3: Stimulus Positioning and Color
   * Verifies stimulus appears at specified position with custom color
   */
  it("should display stimulus at specified position", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        stimulus_row: 1,
        stimulus_col: 2,
        stimulus_color: "#ff0000", // Red color
      },
    ]);

    // Allow stimulus to appear
    jest.advanceTimersByTime(100);
    
    // Check that stimulus cell has correct background color
    const stimulusCell = document.getElementById("cell-1-2") as HTMLElement;
    expect(stimulusCell.style.backgroundColor).toBe("rgb(255, 0, 0)"); // #ff0000 converted to RGB

    // Complete the trial
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(2250);
  });

  /**
   * Test 4: Target Trial Handling
   * Tests correct response to target trials (should be marked as correct)
   */
  it("should handle target trials correctly", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        is_target: true,
      },
    ]);

    // Wait briefly then respond
    jest.advanceTimersByTime(100);
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(2250);
    
    // Verify response to target is marked as correct
    const data = getData().values()[0];
    expect(data.is_target).toBe(true);
    expect(data.correct).toBe(true);
  });

  /**
   * Test 5: No Response Behavior
   * Tests what happens when participant doesn't respond within time limit
   */
  it("should handle no response correctly", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        stimulus_duration: 500,
        isi_duration: 500,
        is_target: false,
      },
    ]);

    // Let entire trial duration pass without any response
    jest.advanceTimersByTime(1200);
    jest.advanceTimersByTime(2250);
    
    // Verify no response data is correctly recorded
    const data = getData().values()[0];
    expect(data.response).toBe(false);
    expect(data.response_time).toBe(null);
    expect(data.correct).toBe(true); // Correct because no response to non-target is appropriate
  });

  /**
   * Test 6: Feedback Display (Enabled)
   * Tests that feedback appears when feedback parameters are enabled
   */
  it("should show feedback when enabled", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        show_feedback_time: true,
        show_feedback_border: true,
        is_target: true,
      },
    ]);

    // Respond to target trial
    jest.advanceTimersByTime(100);
    document.getElementById("nback-response-btn")?.click();
    
    // Check that feedback appears
    jest.advanceTimersByTime(50);
    expect(getHTML()).toContain("Correct!");
    expect(document.getElementById("nback-grid")?.style.border).toContain("#00cc00");

    jest.advanceTimersByTime(2250);
  });

  /**
   * Test 7: Feedback Display (Disabled)
   * Tests that feedback is hidden when feedback parameters are disabled
   */
  it("should hide feedback when disabled", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        show_feedback_time: false,
        show_feedback_border: false,
      },
    ]);

    // Make a response
    jest.advanceTimersByTime(100);
    document.getElementById("nback-response-btn")?.click();
    
    // Verify no feedback text appears
    jest.advanceTimersByTime(50);
    expect(getHTML()).not.toContain("Correct!");
    expect(getHTML()).not.toContain("Incorrect!");

    jest.advanceTimersByTime(2250);
  });

  /**
   * Test 8: Custom Button Text
   * Verifies that custom button text parameter works correctly
   */
  it("should use custom button text", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        button_text: "TARGET",
      },
    ]);

    // Check that custom button text appears
    expect(getHTML()).toContain("TARGET");

    // Complete the trial
    jest.advanceTimersByTime(100);
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(2250);
  });

  /**
   * Test 9: Custom Instructions
   * Tests that custom instruction text is displayed correctly
   */
  it("should use custom instructions", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        instructions: "Press button when you see a match",
      },
    ]);

    // Verify custom instructions appear in HTML
    expect(getHTML()).toContain("Press button when you see a match");

    // Complete the trial
    jest.advanceTimersByTime(100);
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(2250);
  });

  /**
   * Test 10: Stimulus Duration Timing
   * Tests that stimulus appears and disappears according to specified duration
   */
  it("should respect stimulus duration", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        stimulus_duration: 200, // Short duration for testing
        stimulus_row: 1,
        stimulus_col: 1,
      },
    ]);

    // Check stimulus is visible during duration
    jest.advanceTimersByTime(100);
    const stimulusCell = document.getElementById("cell-1-1") as HTMLElement;
    expect(stimulusCell.style.backgroundColor).not.toBe("white");

    // Check stimulus is hidden after duration expires
    jest.advanceTimersByTime(150); // Total 250ms > 200ms duration
    expect(stimulusCell.style.backgroundColor).toBe("white");

    // Complete the trial
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(2250);
  });

  /**
   * Test 11: Feedback Duration
   * Tests that feedback appears for the specified duration
   */
  it("should handle feedback duration correctly", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        feedback_duration: 300,
        show_feedback_time: true,
        is_target: true,
      },
    ]);

    // Respond to trigger feedback
    jest.advanceTimersByTime(100);
    document.getElementById("nback-response-btn")?.click();
    
    // Verify feedback is visible during feedback period
    jest.advanceTimersByTime(50);
    expect(getHTML()).toContain("Correct!");
    
    jest.advanceTimersByTime(2250);
  });

  /**
   * Test 12: Custom Color Scheme
   * Tests that custom stimulus and feedback colors are applied correctly
   */
  it("should use custom colors", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        stimulus_color: "#123456", // Custom stimulus color
        correct_color: "#abcdef",   // Custom feedback color
        show_feedback_border: true,
        is_target: true,
      },
    ]);

    // Check custom stimulus color is applied
    jest.advanceTimersByTime(100);
    const stimulusCell = document.getElementById("cell-0-0") as HTMLElement;
    expect(stimulusCell.style.backgroundColor).toBe("rgb(18, 52, 86)"); // #123456 in RGB

    // Trigger feedback and check custom feedback color
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(50);
    expect(document.getElementById("nback-grid")?.style.border).toContain("#abcdef");

    jest.advanceTimersByTime(2250);
  });

  /**
   * Test 13: No-Response Feedback Control
   * Tests the showFeedbackNoResponse parameter functionality
   */
  it("should handle showFeedbackNoResponse parameter", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        showFeedbackNoResponse: false, // Disable feedback for no response
        stimulus_duration: 200,
        isi_duration: 200,
        is_target: true, // Target trial with no response should show "Incorrect" if feedback enabled
      },
    ]);

    // Let trial complete without any response
    jest.advanceTimersByTime(500);

    // Verify no feedback appears for no-response trial
    expect(getHTML()).not.toContain("Incorrect!");

    jest.advanceTimersByTime(2250);
  });

  /**
   * Test 14: No-Response Wait Control  
   * Tests the feedbackWaitNoResponse parameter functionality
   */
  it("should handle feedbackWaitNoResponse parameter", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        feedbackWaitNoResponse: false, // Don't wait for feedback duration on no response
        stimulus_duration: 200,
        isi_duration: 200,
        feedback_duration: 500,
      },
    ]);

    // Let trial complete without response
    jest.advanceTimersByTime(500);
    await expectFinished();

    // Verify trial ended without waiting for feedback duration
    const data = getData().values()[0];
    expect(data.response).toBe(false);
  });

  /**
   * Test 15: Incorrect Response Handling
   * Tests feedback and data collection for incorrect responses
   */
  it("should handle incorrect responses", async () => {
    const { expectFinished, getData, getHTML } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        is_target: false, // Non-target trial
        show_feedback_time: true,
        incorrect_color: "#ff0000",
      },
    ]);

    // Respond to non-target (incorrect behavior)
    jest.advanceTimersByTime(100);
    document.getElementById("nback-response-btn")?.click();

    // Check incorrect feedback appears
    jest.advanceTimersByTime(50);
    expect(getHTML()).toContain("Incorrect!");

    jest.advanceTimersByTime(2250);
    
    // Verify response is marked as incorrect
    const data = getData().values()[0];
    expect(data.correct).toBe(false);
  });

  /**
   * Test 16: Complete Data Collection
   * Comprehensive test of all data fields collected by the plugin
   */
  it("should collect all expected data", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        stimulus_row: 2,
        stimulus_col: 1,
        is_target: true,
      },
    ]);

    // Make a response to generate complete data
    jest.advanceTimersByTime(100);
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(2250);
    
    // Verify all expected data fields are present and correct
    const data = getData().values()[0];
    expect(data).toMatchObject({
      stimulus_row: 2,        // Position data
      stimulus_col: 1,
      is_target: true,        // Trial type
      response: true,         // Response made
      correct: true,          // Correct response to target
    });
    
    // Verify response time is recorded as a positive number
    expect(typeof data.response_time).toBe("number");
    expect(data.response_time).toBeGreaterThan(0);
  });
});