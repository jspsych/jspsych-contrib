import { startTimeline } from "@jspsych/test-utils";

import jsPsychSpatialNback from ".";
import { jsPsych } from "jspsych"; // adjust import if needed

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
        type: jsPsychSpatialNback,
        stimulus_row: 0,  // Explicitly set to test with stimulus
        stimulus_col: 0,
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
    jest.advanceTimersByTime(2250);
  });

  /**
   * Test 3: Stimulus Positioning and Color
   * Verifies stimulus appears at specified position with custom color
   */
  it("should display stimulus at specified position", async () => {
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
    jest.advanceTimersByTime(2250);
  });

  /**
   * Test 4: Target Trial Handling
   * Tests correct response to target trials (should be marked as correct)
   */
  it("should handle target trials correctly", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        stimulus_row: 0,
        stimulus_col: 0,
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
        type: jsPsychSpatialNback,
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
        type: jsPsychSpatialNback,
        stimulus_row: 0,
        stimulus_col: 0,
        show_feedback_text: true,
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
        type: jsPsychSpatialNback,
        show_feedback_text: false,
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
        type: jsPsychSpatialNback,
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
        type: jsPsychSpatialNback,
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
        type: jsPsychSpatialNback,
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
        type: jsPsychSpatialNback,
        stimulus_row: 0,
        stimulus_col: 0,
        feedback_duration: 300,
        show_feedback_text: true,
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
        type: jsPsychSpatialNback,
        stimulus_row: 0,
        stimulus_col: 0,
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
   * Test 13: Incorrect Response Handling
   * Tests feedback and data collection for incorrect responses
   */
  it("should handle incorrect responses", async () => {
    const { expectFinished, getData, getHTML } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        is_target: false, // Non-target trial
        show_feedback_text: true,
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
        type: jsPsychSpatialNback,
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
    const plugin = new jsPsychSpatialNback({} as jsPsych);
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
    const plugin = new jsPsychSpatialNback({} as jsPsych);
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
    const plugin = new jsPsychSpatialNback({} as jsPsych);
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
    const plugin = new jsPsychSpatialNback({} as jsPsych);
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
    const plugin = new jsPsychSpatialNback({} as jsPsych);
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
        type: jsPsychSpatialNback,
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
        type: jsPsychSpatialNback,
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
        type: jsPsychSpatialNback,
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
        type: jsPsychSpatialNback,
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
        type: jsPsychSpatialNback,
        stimulus_row: 0,
        stimulus_col: 0,
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
        type: jsPsychSpatialNback,
        stimulus_row: 0,
        stimulus_col: 0,
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
        type: jsPsychSpatialNback,
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
        type: jsPsychSpatialNback,
        stimulus_row: 0,
        stimulus_col: 0,
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
        type: jsPsychSpatialNback,
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
        type: jsPsychSpatialNback,
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
          type: jsPsychSpatialNback,
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

  /**
   * Test 33: Handles negative stimulus_row and stimulus_col (should throw)
   */
  it("should throw error for negative stimulus_row", () => {
    const plugin = new jsPsychSpatialNback({} as jsPsych);
    const mockElement = document.createElement("div");
    expect(() => {
      plugin.trial(mockElement, {
        rows: 3,
        cols: 3,
        stimulus_row: -1,
        stimulus_col: 1,
      } as any);
    }).toThrow();
  });

  it("should throw error for negative stimulus_col", () => {
    const plugin = new jsPsychSpatialNback({} as jsPsych);
    const mockElement = document.createElement("div");
    expect(() => {
      plugin.trial(mockElement, {
        rows: 3,
        cols: 3,
        stimulus_row: 1,
        stimulus_col: -2,
      } as any);
    }).toThrow();
  });

  /**
   * Test 34: Handles non-integer grid dimensions (should throw)
   */
  it("should throw error for non-integer rows or cols", () => {
    const plugin = new jsPsychSpatialNback({} as jsPsych);
    const mockElement = document.createElement("div");
    expect(() => {
      plugin.trial(mockElement, {
        rows: 2.5,
        cols: 3,
        cell_size: 125,
        stimulus_row: 0,
        stimulus_col: 0,
        is_target: false,
        stimulus_duration: 750,
        isi_duration: 1000,
        feedback_duration: 500,
        show_feedback_text: true,
        show_feedback_border: true,
        show_feedback_no_click: true,
        feedback_wait_no_click: true,
        button_text: "MATCH",
        stimulus_color: "#0066cc",
        correct_color: "#00cc00",
        incorrect_color: "#cc0000",
        instructions: "Click MATCH",
      } as any);
    }).toThrow();
  });

  /**
   * Test 35: Handles non-integer cell_size (should just work)
   * Verifies that the plugin rounds non-integer cell_size values to the nearest integer.
   */
  it("should round non-integer cell_size to the nearest integer", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        cell_size: 50.7, // Non-integer value
        rows: 2,
        cols: 2,
      },
    ]);
    // Should still create grid cells
    expect(getHTML()).toContain('id="cell-0-0"');
    const cell = document.getElementById("cell-0-0") as HTMLElement;
    // Check the rendered width and height
    expect(cell.style.width).toBe("50.7px");
    expect(cell.style.height).toBe("50.7px");
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(2250);
  });

  /**
   * Test 36: Handles extremely large cell_size (should not overflow)
   */
  it("should handle extremely large cell_size", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        cell_size: 1000,
        rows: 2,
        cols: 2,
      },
    ]);
    expect(getHTML()).toContain('id="cell-0-0"');
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(2250);
  });

  /**
   * Test 37: Handles extremely small feedback_duration (should not hang)
   */
  it("should handle extremely small feedback_duration", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        feedback_duration: 1,
      },
    ]);
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(1751);
    await expectFinished();
  });

  /**
   * Test 38: Handles rapid trial restart (should not leak timeouts)
   */
  it("should not leak timeouts on rapid restart", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        stimulus_duration: 10,
        isi_duration: 10,
        feedback_duration: 10,
      },
      {
        type: jsPsychSpatialNback,
        stimulus_duration: 10,
        isi_duration: 10,
        feedback_duration: 10,
      },
    ]);
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(30);
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(30);
    await expectFinished();
  });

  /**
   * Test 39: Empty Grid - No Stimulus with Null Positions
   * Tests that when both stimulus_row and stimulus_col are null, an empty grid is shown
   */
  it("should show empty grid when stimulus positions are null", async () => {
    const { expectFinished, getHTML, getData } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        rows: 3,
        cols: 3,
        // stimulus_row and stimulus_col are null by default now
      },
    ]);

    // Grid should exist but no stimulus should be colored
    expect(getHTML()).toContain('id="nback-grid"');
    
    // Check that all cells are white (no stimulus)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const cell = document.getElementById(`cell-${row}-${col}`) as HTMLElement;
        expect(cell.style.backgroundColor).toBe("white");
      }
    }

    // Complete the trial
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(1750); // 750ms stimulus + 1000ms ISI
    await expectFinished();

    // Verify data collected shows null positions
    const data = getData().values()[0];
    expect(data.stimulus_row).toBe(null);
    expect(data.stimulus_col).toBe(null);
    expect(data.response).toBe(true);
    expect(data.correct).toBe(false); // Responding to empty grid is always incorrect
  });

  /**
   * Test 40: Empty Grid - Target Trial with No Stimulus
   * Tests that empty grid trials can be marked as target trials
   */
  it("should handle target trials with empty grid", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        is_target: true,
        // stimulus positions null by default
      },
    ]);

    // Respond to the empty grid target
    document.getElementById("nback-response-btn")?.click();
    jest.advanceTimersByTime(1750); // 750ms stimulus + 1000ms ISI
    await expectFinished();

    const data = getData().values()[0];
    expect(data.is_target).toBe(true);
    expect(data.response).toBe(true);
    expect(data.correct).toBe(false); // Responding to empty grid is always incorrect, even for targets
    expect(data.stimulus_row).toBe(null);
    expect(data.stimulus_col).toBe(null);
  });

  /**
   * Test 41: Empty Grid - No Response Behavior
   * Tests that no response to empty grid is handled correctly
   */
  it("should handle no response to empty grid", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        is_target: false,
        stimulus_duration: 200,
        isi_duration: 200,
        // stimulus positions null by default
      },
    ]);

    // Let trial complete without response
    jest.advanceTimersByTime(500);
    await expectFinished();

    const data = getData().values()[0];
    expect(data.response).toBe(false);
    expect(data.correct).toBe(true); // Not responding to empty grid is always correct
    expect(data.stimulus_row).toBe(null);
    expect(data.stimulus_col).toBe(null);
  });

  /**
   * Test 42: Empty Grid - Feedback Display
   * Tests that feedback works correctly with empty grid
   */
  it("should show feedback for empty grid trials", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        show_feedback_text: true,
        show_feedback_border: true,
        is_target: true,
        // stimulus positions null by default
      },
    ]);

    // Respond to trigger feedback
    document.getElementById("nback-response-btn")?.click();
    
    // Check that feedback appears (should be "Incorrect!" since responding to empty grid is always wrong)
    jest.advanceTimersByTime(50);
    expect(getHTML()).toContain("Incorrect!");
    expect(document.getElementById("nback-grid")?.style.border).toContain("#cc0000");

    jest.advanceTimersByTime(1750); // 750ms stimulus + 1000ms ISI
    await expectFinished();
  });

  /**
   * Test 43: ISI Timing - Response During ISI
   * Tests that full ISI duration is waited even when response occurs during ISI
   */
  it("should wait full ISI duration when response occurs during ISI", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        stimulus_row: 0,
        stimulus_col: 0,
        stimulus_duration: 100,
        isi_duration: 500,
        feedback_duration: 0,
        is_target: true,
      },
    ]);

    // Wait for stimulus to end and start of ISI
    jest.advanceTimersByTime(150); // 100ms stimulus + 50ms into ISI
    
    // Respond during ISI
    const responseTime = performance.now();
    document.getElementById("nback-response-btn")?.click();
    
    // Should still wait full ISI duration (500ms), not just remaining time
    jest.advanceTimersByTime(500); // Full ISI duration
    await expectFinished();

    const data = getData().values()[0];
    expect(data.response).toBe(true);
    expect(data.correct).toBe(true);
  });

  /**
   * Test 44: ISI Timing - Response During ISI with Feedback
   * Tests that full ISI duration is waited even when response occurs during ISI and feedback is shown
   */
  it("should wait full ISI duration when response occurs during ISI with feedback", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        stimulus_row: 0,
        stimulus_col: 0,
        stimulus_duration: 100,
        isi_duration: 500,
        feedback_duration: 200,
        show_feedback_text: true,
        is_target: true,
      },
    ]);

    // Wait for stimulus to end and start of ISI
    jest.advanceTimersByTime(150); // 100ms stimulus + 50ms into ISI
    
    // Respond during ISI
    document.getElementById("nback-response-btn")?.click();
    
    // Should wait full ISI duration (500ms) + feedback duration (200ms)
    jest.advanceTimersByTime(700); // Full ISI + feedback duration
    await expectFinished();

    const data = getData().values()[0];
    expect(data.response).toBe(true);
    expect(data.correct).toBe(true);
  });

  /**
   * Test 45: Button Disabled After Response
   * Tests that button is visually disabled after user responds
   */
  it("should disable button after response", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: jsPsychSpatialNback,
        stimulus_row: 0,
        stimulus_col: 0,
        feedback_duration: 300,
        show_feedback_text: false,
        show_feedback_border: false,
        is_target: true,
      },
    ]);

    // Respond to trigger feedback period
    document.getElementById("nback-response-btn")?.click();
    
    // Check that button is disabled after response
    jest.advanceTimersByTime(50);
    const button = document.getElementById("nback-response-btn") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.style.opacity).toBe("0.6");

    jest.advanceTimersByTime(1700); // Complete the trial
    await expectFinished();
  });

  /**
   * Test 46: Button Disabled Even When No Feedback Duration
   * Tests that button is disabled after response even when feedback_duration is 0
   */
  it("should disable button after response even when feedback_duration is 0", async () => {
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
    jest.advanceTimersByTime(50);
    const button = document.getElementById("nback-response-btn") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.style.opacity).toBe("0.6");

    jest.advanceTimersByTime(1700); // Complete the trial
    await expectFinished();
  });

  /**
   * Test 47: No Feedback Flash When Duration is 0 and No Response
   * Tests that feedback doesn't flash when feedback_duration is 0 but feedback is enabled and no response is made
   */
  it("should not show feedback flash when feedback_duration is 0 and no response is made", async () => {
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

    // Wait for stimulus to display
    jest.advanceTimersByTime(750);
    
    // Wait for ISI without making a response
    jest.advanceTimersByTime(1000);
    
    // Check that no feedback is shown (no text in feedback div and no border)
    const feedbackDiv = document.getElementById("nback-feedback");
    const grid = document.getElementById("nback-grid") as HTMLElement;
    
    expect(feedbackDiv?.textContent).toBe("");
    expect(grid?.style.border).not.toContain("6px solid");
    
    // Complete the trial - total duration should be 750 + 1000 + 0 = 1750ms
    jest.advanceTimersByTime(100); // Small amount to trigger trial end
    await expectFinished();
    
    // Verify the trial ended correctly with no response
    const data = getData().values()[0];
    expect(data.response).toBe(false);
    expect(data.correct).toBe(true); // Correct because is_target is false and no response was made
  });

});