import { EnvironmentReport, mergeEnvironmentReports, probeEnvironment } from "./environment";

function report(overrides: Partial<EnvironmentReport> = {}): EnvironmentReport {
  return {
    webdriver: false,
    headless_user_agent: false,
    automation_globals: [],
    no_languages: false,
    zero_outer_window: false,
    missing_chrome_runtime: false,
    user_agent_platform_mismatch: false,
    hardware_concurrency: 8,
    screen: { width: 1920, height: 1080, avail_width: 1920, avail_height: 1040 },
    viewport: { width: 1400, height: 900 },
    timezone: "Europe/Oslo",
    user_agent: "Mozilla/5.0",
    ...overrides,
  };
}

describe("probeEnvironment", () => {
  it("reports a clean jsdom window without claiming automation", () => {
    const probed = probeEnvironment(window);
    expect(probed.webdriver).toBe(false);
    expect(probed.automation_globals).toEqual([]);
    expect(probed).toHaveProperty("user_agent");
    expect(probed).toHaveProperty("timezone");
  });

  it("notices an automation global and a headless user agent", () => {
    const fake = {
      navigator: {
        userAgent: "Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/120.0.0.0",
        webdriver: true,
        languages: ["en"],
        platform: "Linux x86_64",
        hardwareConcurrency: 2,
      },
      document: { __proto__: null, $cdc_asdjflasutopfhvcZLmcfl_: {} },
      outerWidth: 0,
      outerHeight: 0,
      innerWidth: 800,
      innerHeight: 600,
      screen: { width: 800, height: 600, availWidth: 800, availHeight: 600 },
      __playwright: {},
    } as unknown as Window;

    const probed = probeEnvironment(fake);
    expect(probed.webdriver).toBe(true);
    expect(probed.headless_user_agent).toBe(true);
    expect(probed.zero_outer_window).toBe(true);
    expect(probed.automation_globals).toEqual(expect.arrayContaining(["__playwright"]));
  });
});

describe("mergeEnvironmentReports", () => {
  it("returns whichever report exists when one is missing", () => {
    const only = report();
    expect(mergeEnvironmentReports(null, only)).toBe(only);
    expect(mergeEnvironmentReports(only, null)).toBe(only);
    expect(mergeEnvironmentReports(null, null)).toBeNull();
  });

  it("forgets a window that reported 0x0 only while the page was loading", () => {
    const merged = mergeEnvironmentReports(report({ zero_outer_window: true }), report());
    expect(merged!.zero_outer_window).toBe(false);
  });

  it("keeps a window that never reports a size, as a headless browser does", () => {
    const merged = mergeEnvironmentReports(
      report({ zero_outer_window: true }),
      report({ zero_outer_window: true })
    );
    expect(merged!.zero_outer_window).toBe(true);
  });

  it("keeps automation signs that only one of the probes saw", () => {
    const merged = mergeEnvironmentReports(
      report({ webdriver: true, automation_globals: ["__playwright"] }),
      report({ headless_user_agent: true, automation_globals: ["_phantom"] })
    );
    expect(merged!.webdriver).toBe(true);
    expect(merged!.headless_user_agent).toBe(true);
    expect(merged!.automation_globals).toEqual(["__playwright", "_phantom"]);
  });

  it("does not report the same automation global twice", () => {
    const merged = mergeEnvironmentReports(
      report({ automation_globals: ["__playwright"] }),
      report({ automation_globals: ["__playwright"] })
    );
    expect(merged!.automation_globals).toEqual(["__playwright"]);
  });
});
