import { BehaviorRecorder, coefficientOfVariation } from "./behavior";

function fakeClock() {
  let time = 0;
  return { now: () => time, advance: (ms: number) => (time += ms) };
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("BehaviorRecorder", () => {
  it("counts a click with no approaching pointer movement", () => {
    const clock = fakeClock();
    const recorder = new BehaviorRecorder(document, clock.now);
    document.body.innerHTML = "<button>Go</button>";
    recorder.start();
    document
      .querySelector("button")!
      .dispatchEvent(
        new MouseEvent("click", { bubbles: true, clientX: 50, clientY: 50, detail: 1 })
      );
    const metrics = recorder.stop();
    expect(metrics.clicks).toBe(1);
    expect(metrics.clicks_without_approach).toBe(1);
    expect(metrics.untrusted_events).toBe(1);
  });

  it("accepts a click that the pointer moved to", () => {
    const clock = fakeClock();
    const recorder = new BehaviorRecorder(document, clock.now);
    recorder.start();
    for (const [x, y] of [
      [10, 10],
      [30, 25],
      [48, 49],
      [50, 50],
    ]) {
      clock.advance(16);
      document.dispatchEvent(new MouseEvent("pointermove", { clientX: x, clientY: y }));
    }
    clock.advance(80);
    document.body.dispatchEvent(
      new MouseEvent("click", { bubbles: true, clientX: 50, clientY: 50, detail: 1 })
    );
    const metrics = recorder.stop();
    expect(metrics.pointer_moves).toBe(4);
    expect(metrics.clicks_without_approach).toBe(0);
    expect(metrics.pointer_path_px).toBeGreaterThan(50);
  });

  it("ignores keyboard-activated clicks for approach checks", () => {
    const recorder = new BehaviorRecorder(document);
    recorder.start();
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 0 }));
    expect(recorder.stop().clicks_without_approach).toBe(0);
  });

  it("detects text that appears without keystrokes", () => {
    const recorder = new BehaviorRecorder(document);
    document.body.innerHTML = "<input>";
    const input = document.querySelector("input")!;
    recorder.start();
    input.value = "injected";
    input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText" }));
    input.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "a" }));
    input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText" }));
    const metrics = recorder.stop();
    expect(metrics.text_inserted_without_keys).toBe(1);
    expect(metrics.keydowns).toBe(1);
  });

  it("does not count pastes as silent insertion", () => {
    const recorder = new BehaviorRecorder(document);
    recorder.start();
    document.dispatchEvent(new Event("paste"));
    document.dispatchEvent(new InputEvent("input", { inputType: "insertFromPaste" }));
    const metrics = recorder.stop();
    expect(metrics.pastes).toBe(1);
    expect(metrics.text_inserted_without_keys).toBe(0);
  });

  it("stops listening after stop()", () => {
    const recorder = new BehaviorRecorder(document);
    recorder.start();
    recorder.stop();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    recorder.start();
    expect(recorder.stop().keydowns).toBe(0);
  });
});

describe("coefficientOfVariation", () => {
  it("is near zero for metronomic intervals and larger for human ones", () => {
    expect(coefficientOfVariation([100, 100, 100, 101])).toBeLessThan(0.01);
    expect(coefficientOfVariation([80, 210, 130, 340, 95])).toBeGreaterThan(0.4);
  });
});
