import { startTimeline } from "@jspsych/test-utils";

import jsPsychPluginSpatialNback from ".";
import { JsPsych } from "jspsych"; // adjust import if needed

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
    const stimulusCell = document.getElementById("cell-1-1") as HTMLElement;
    expect(stimulusCell.style.backgroundColor).not.toBe("white");

    // Check stimulus is hidden after duration expires
    jest.advanceTimersByTime(200); // Total 250ms > 200ms duration
    expect(stimulusCell.style.backgroundColor).toBe("white");

    // Complete the trial
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(1000+500);
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
    jest.advanceTimersByTime(1); // Allow stimulus to appear
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

  /**
   * Test 17: Grid Dimension Validation - Both Dimensions Too Small
   * Tests error thrown when both rows and cols are 1 or less
   */
  it("should throw error when both rows and cols are 1 or less", () => {
    const plugin = new jsPsychPluginSpatialNback({} as JsPsych);
    const mockElement = document.createElement("div");
    expect(() => {
      plugin.trial(mockElement, {
        rows: 1,
        cols: 1,
      } as any);
    }).toThrow("Grid must have more than one cell. Both rows and cols cannot be 1 or less.");
  });

  /**
   * Test 18: Grid Dimension Validation - Zero Rows
   * Tests error thrown when rows is zero
   */
  it("should throw error when rows is zero", () => {
    const plugin = new jsPsychPluginSpatialNback({} as JsPsych);
    const mockElement = document.createElement("div");
    expect(() => {
      plugin.trial(mockElement, {
        rows: 0,
        cols: 3,
      } as any);
    }).toThrow("Grid dimensions must be positive integers. Rows and cols must be greater than 0.");
  });

  /**
   * Test 19: Grid Dimension Validation - Negative Columns
   * Tests error thrown when cols is negative
   */
  it("should throw error when cols is negative", () => {
    const plugin = new jsPsychPluginSpatialNback({} as JsPsych);
    const mockElement = document.createElement("div");
    expect(() => {
      plugin.trial(mockElement, {
        rows: 3,
        cols: -2,
      } as any);
    }).toThrow("Grid dimensions must be positive integers. Rows and cols must be greater than 0.");
  });

  /**
   * Test 20: Stimulus Position Validation - Row Out of Bounds
   * Tests error thrown when stimulus_row exceeds grid bounds
   */
  it("should throw error when stimulus position is out of bounds (row)", () => {
    const plugin = new jsPsychPluginSpatialNback({} as JsPsych);
    const mockElement = document.createElement("div");
    expect(() => {
      plugin.trial(mockElement, {
        rows: 3,
        cols: 3,
        stimulus_row: 5, // Out of bounds
        stimulus_col: 1,
      } as any);
    }).toThrow("Stimulus position (5, 1) is outside grid bounds (3x3).");
  });

  /**
   * Test 21: Stimulus Position Validation - Column Out of Bounds
   * Tests error thrown when stimulus_col exceeds grid bounds
   */
  it("should throw error when stimulus position is out of bounds (col)", () => {
    const plugin = new jsPsychPluginSpatialNback({} as JsPsych);
    const mockElement = document.createElement("div");
    expect(() => {
      plugin.trial(mockElement, {
        rows: 4,
        cols: 2,
        stimulus_row: 1,
        stimulus_col: 3, // Out of bounds
      } as any);
    }).toThrow("Stimulus position (1, 3) is outside grid bounds (4x2).");
  });

  /**
   * Test 22: Edge Case - Valid Single Row Grid
   * Tests that a 1xN grid works correctly (only cols > 1)
   */
  it("should work with single row grid", async () => {
    const { expectFinished, getHTML, getData } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        rows: 1,
        cols: 5,
        stimulus_row: 0,
        stimulus_col: 2,
      },
    ]);

    // Verify grid is created correctly
    for (let col = 0; col < 5; col++) {
      expect(getHTML()).toContain(`id="cell-0-${col}"`);
    }

    // Complete trial
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(2250);

    const data = getData().values()[0];
    expect(data.stimulus_row).toBe(0);
    expect(data.stimulus_col).toBe(2);
  });

  /**
   * Test 23: Edge Case - Valid Single Column Grid
   * Tests that a Nx1 grid works correctly (only rows > 1)
   */
  it("should work with single column grid", async () => {
    const { expectFinished, getHTML, getData } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        rows: 4,
        cols: 1,
        stimulus_row: 2,
        stimulus_col: 0,
      },
    ]);

    // Verify grid is created correctly
    for (let row = 0; row < 4; row++) {
      expect(getHTML()).toContain(`id="cell-${row}-0"`);
    }

    // Complete trial
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(2250);

    const data = getData().values()[0];
    expect(data.stimulus_row).toBe(2);
    expect(data.stimulus_col).toBe(0);
  });

  /**
   * Test 24: Edge Case - Very Large Grid
   * Tests plugin handles very large grids (should scale down)
   */
  it("should handle very large grids", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        rows: 20,
        cols: 20,
        cell_size: 100,
        stimulus_row: 10,
        stimulus_col: 15,
      },
    ]);

    // Verify all cells exist
    expect(getHTML()).toContain('id="cell-10-15"');
    expect(getHTML()).toContain('id="cell-0-0"');
    expect(getHTML()).toContain('id="cell-19-19"');

    // Complete trial
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(2250);
  });

  /**
   * Test 25: Edge Case - Zero Durations
   * Tests plugin behavior with zero stimulus/feedback durations
   */
  it("should handle zero durations", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        stimulus_duration: 0,
        feedback_duration: 0,
        isi_duration: 100,
      },
    ]);

    // Stimulus should be hidden immediately
    jest.advanceTimersByTime(10);
    const stimulusCell = document.getElementById("cell-0-0") as HTMLElement;
    expect(stimulusCell.style.backgroundColor).toBe("white");

    // Complete trial
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(150);

    const data = getData().values()[0];
    expect(data.response).toBe(true);
  });

  /**
   * Test 26: Edge Case - Very Short Response Time
   * Tests plugin handles very fast responses correctly
   */
  it("should handle very fast responses", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        is_target: true,
      },
    ]);

    // Respond immediately after stimulus appears
    jest.advanceTimersByTime(1);
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(2250);

    const data = getData().values()[0];
    expect(data.response).toBe(true);
    expect(data.response_time).toBeGreaterThan(0);
    expect(data.response_time).toBeLessThan(10); // Very fast response
    expect(data.correct).toBe(true);
  });

  /**
   * Test 27: Edge Case - Multiple Rapid Clicks
   * Tests that multiple button clicks don't cause issues
   */
  it("should handle multiple rapid button clicks", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        is_target: true,
      },
    ]);

    
    // Click button multiple times rapidly
    const button = document.getElementById("nback-response-btn");
    button?.click();
    button?.click();
    button?.click();
    
    jest.advanceTimersByTime(2250);

    // Should only record one response
    const data = getData().values()[0];
    expect(data.response).toBe(true);
    expect(data.correct).toBe(true);
  });

  /**
   * Test 28: Edge Case - Minimum Cell Size
   * Tests plugin with very small cell size
   */
  it("should handle minimum cell size", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        cell_size: 1, // Very small
        rows: 2,
        cols: 2,
      },
    ]);

    // Grid should still be created
    expect(getHTML()).toContain('id="nback-grid"');
    expect(getHTML()).toContain('id="cell-0-0"');

    // Complete trial
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(2250);
  });

  /**
   * Test 29: Edge Case - Response During Exact Timing Boundaries
   * Tests response exactly at stimulus duration boundary
   */
  it("should handle response at timing boundaries", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        stimulus_duration: 200,
        isi_duration: 300,
        is_target: true,
      },
    ]);

    // Respond exactly when stimulus should disappear
    jest.advanceTimersByTime(200);
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(300+500);
    await expectFinished();
    // Verify experiment finished at correct time 

    const data = getData().values()[0];
    expect(data.response).toBe(true);
    expect(data.correct).toBe(true);
  });

  /**
   * Test 30: Edge Case - Empty Button Text
   * Tests plugin with empty button text
   */
  it("should handle empty button text", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        button_text: "",
      },
    ]);

    // Button should exist but be empty
    expect(getHTML()).toContain('id="nback-response-btn"');
    const button = document.getElementById("nback-response-btn") as HTMLButtonElement;
    expect(button.textContent).toBe("");

    // Should still function
    button.click();
    jest.advanceTimersByTime(2250);
  });

  /**
   * Test 31: Edge Case - Invalid Color Values
   * Tests plugin gracefully handles invalid color strings
   */
  it("should handle invalid color values", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: jsPsychPluginSpatialNback,
        stimulus_color: "invalid-color",
        correct_color: "also-invalid",
        incorrect_color: "#gggggg", // Invalid hex
      },
    ]);

    // Should not crash, just use invalid colors
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(2250);
  });

  /**
   * Test 32: Edge Case - Boundary Stimulus Positions
   * Tests stimulus at grid boundaries (corners and edges)
   */
  it("should handle boundary stimulus positions", async () => {
    const positions = [
      { row: 0, col: 0 }, // Top-left corner
      { row: 0, col: 2 }, // Top-right corner  
      { row: 2, col: 0 }, // Bottom-left corner
      { row: 2, col: 2 }, // Bottom-right corner
    ];

    for (const pos of positions) {
      const { expectFinished, getData } = await startTimeline([
        {
          type: jsPsychPluginSpatialNback,
          rows: 3,
          cols: 3,
          stimulus_row: pos.row,
          stimulus_col: pos.col,
        },
      ]);

        document.getElementById("nback-response-btn")?.click();
      jest.advanceTimersByTime(2250);

      const data = getData().values()[0];
      expect(data.stimulus_row).toBe(pos.row);
      expect(data.stimulus_col).toBe(pos.col);
    }
  });
});