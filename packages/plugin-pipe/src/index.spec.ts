import { flushPromises } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

import PluginPipe from ".";

function mockFetch(impl: (url: string, init?: RequestInit) => any) {
  const fn = jest.fn(async (url: string, init?: RequestInit) => {
    const result = impl(url, init);
    return {
      ok: result?.ok ?? true,
      status: result?.status ?? 200,
      json: async () => result,
    };
  });
  (global as any).fetch = fn;
  return fn;
}

beforeEach(() => {
  jest.clearAllMocks();
  PluginPipe.setBaseURL("");
});

describe("base URL", () => {
  it("defaults to production", () => {
    expect(PluginPipe.getBaseURL()).toBe("https://pipe.jspsych.org");
  });

  it("can be pointed at another deployment", async () => {
    // The reason this parameter exists: before it, nothing in this plugin
    // could be exercised anywhere but production.
    PluginPipe.setBaseURL("https://datapipe-test.web.app");
    const fetchMock = mockFetch(() => ({ message: "Success" }));

    await PluginPipe.saveData("EXP12345", "p01.csv", "a,b\n1,2\n", false);

    expect(fetchMock.mock.calls[0][0]).toBe("https://datapipe-test.web.app/api/data/");
  });

  it("does not double the slash when the base URL has a trailing one", async () => {
    PluginPipe.setBaseURL("https://datapipe-test.web.app/");
    const fetchMock = mockFetch(() => ({ message: "Success" }));

    await PluginPipe.getCondition("EXP12345");

    expect(fetchMock.mock.calls[0][0]).toBe("https://datapipe-test.web.app/api/condition/");
  });

  it("lets a single call override the global setting", async () => {
    const fetchMock = mockFetch(() => ({ message: "Success" }));

    await PluginPipe.saveBase64Data("EXP12345", "a.wav", "AAAA", false, {
      base_url: "https://other.example",
    });

    expect(fetchMock.mock.calls[0][0]).toBe("https://other.example/api/base64/");
  });
});

describe("saveData", () => {
  it("sends the expected request body", async () => {
    const fetchMock = mockFetch(() => ({ message: "Success" }));

    await PluginPipe.saveData("EXP12345", "p01.csv", "a,b\n1,2\n", false);

    const body = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    expect(body).toEqual({
      experimentID: "EXP12345",
      filename: "p01.csv",
      data: "a,b\n1,2\n",
    });
  });
});

/**
 * Route fetch by URL. A handler returning an Error makes that fetch REJECT,
 * which is what a dropped connection looks like to the plugin.
 */
function routeFetch(routes: Record<string, () => any>) {
  const fn = jest.fn(async (url: string, _init?: RequestInit) => {
    const key = Object.keys(routes).find((k) => url.includes(k));
    if (!key) throw new Error(`unexpected fetch to ${url}`);
    const result = routes[key]();
    if (result instanceof Error) throw result;
    return { ok: result?.ok ?? true, status: result?.status ?? 200, json: async () => result };
  });
  (global as any).fetch = fn;
  return fn;
}

/** Let the trial's chain of awaits (POST, finishTrial) run out. */
async function settle() {
  for (let i = 0; i < 20; i++) await flushPromises();
}

/**
 * Run one trial on jsPsych 8 and return its data.
 *
 * Deliberately NOT @jspsych/test-utils' startTimeline: that package lives at
 * the monorepo root and resolves the ROOT `jspsych`, which is 7.3.4, while
 * this plugin requires jsPsych 8 -- so a trial run through it exercises a
 * jsPsych this plugin does not support. (It also only accepts its own
 * version's JsPsych instance, so it cannot simply be handed an 8.x one.) The
 * version check keeps this harness honest if module resolution ever changes.
 */
async function runTrial(trial: any) {
  const jsPsych = initJsPsych();
  expect(jsPsych.version()).toMatch(/^8\./);
  const finished = jsPsych.run([trial]);
  await settle();
  // Hangs -- and fails on the test timeout -- if the trial never finishes,
  // which is the failure mode that matters most here.
  await finished;
  return jsPsych.data.get().values()[0];
}

const saveTrial = () => ({
  type: PluginPipe,
  action: "save",
  experiment_id: "EXP12345",
  filename: "p01.csv",
  data_string: "trial,rt\n0,500\n",
  compression: false,
});

describe("trial success", () => {
  it("reports a network failure as a failure", async () => {
    // It used to read `result.error`, and the Error a failed fetch produces
    // has no such property -- so data that never left the browser was
    // recorded as a success.
    routeFetch({ "/api/data/": () => new TypeError("Failed to fetch") });

    const data = await runTrial(saveTrial());

    expect(data.success).toBe(false);
  });

  it("finishes rather than hanging when a condition request is refused", async () => {
    // getCondition returns `response.condition`, which is undefined on an
    // error response; reading `.error` off it threw inside the trial, which
    // never finished and left the participant on the spinner.
    routeFetch({
      "/api/condition/": () => ({
        error: "CONDITION_ASSIGNMENT_NOT_ACTIVE",
        message: "Condition assignment is not active for this experiment",
      }),
    });

    const data = await runTrial({
      type: PluginPipe,
      action: "condition",
      experiment_id: "EXP12345",
    });

    expect(data.success).toBe(false);
  });

  it("finishes rather than hanging when the condition response is not JSON", async () => {
    // A mistyped base_url typically gets an HTML 404 page back, and parsing
    // it threw outside getCondition's try.
    (global as any).fetch = jest.fn(async () => ({
      ok: false,
      status: 404,
      json: async () => {
        throw new SyntaxError("Unexpected token '<'");
      },
    }));

    const data = await runTrial({
      type: PluginPipe,
      action: "condition",
      experiment_id: "EXP12345",
    });

    expect(data.success).toBe(false);
  });

  it("finishes rather than hanging when a required parameter is missing", async () => {
    // saveData throws on an empty data_string -- e.g. a save placed before
    // anything has been recorded -- and that throw escaped the trial.
    const fetchMock = routeFetch({ "/api/data/": () => ({ message: "Success" }) });

    const data = await runTrial({ ...saveTrial(), data_string: "" });

    expect(data.success).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("treats condition 0 as a success", async () => {
    routeFetch({ "/api/condition/": () => ({ condition: 0 }) });

    const data = await runTrial({
      type: PluginPipe,
      action: "condition",
      experiment_id: "EXP12345",
    });

    expect(data).toMatchObject({ result: 0, success: true });
  });
});
