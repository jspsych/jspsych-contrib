export interface EnvironmentReport {
  webdriver: boolean;
  headless_user_agent: boolean;
  automation_globals: string[];
  no_languages: boolean;
  zero_outer_window: boolean;
  missing_chrome_runtime: boolean;
  user_agent_platform_mismatch: boolean;
  hardware_concurrency: number | null;
  screen: { width: number; height: number; avail_width: number; avail_height: number };
  viewport: { width: number; height: number };
  timezone: string;
  user_agent: string;
}

const AUTOMATION_GLOBALS = [
  "__playwright",
  "__pw_manual",
  "__pwInitScripts",
  "__puppeteer_evaluation_script__",
  "_phantom",
  "callPhantom",
  "__nightmare",
  "domAutomation",
  "domAutomationController",
  "_selenium",
  "__webdriver_evaluate",
  "__selenium_unwrapped",
  "__driver_evaluate",
  "__fxdriver_unwrapped",
];

const CHROMEDRIVER_DOCUMENT_KEY = /^\$?cdc_|^\$wdc_/;

function findAutomationGlobals(win: Window, doc: Document): string[] {
  const windowHits = AUTOMATION_GLOBALS.filter((key) => key in win);
  const documentHits = Object.keys(doc).filter((key) => CHROMEDRIVER_DOCUMENT_KEY.test(key));
  return [...windowHits, ...documentHits];
}

function platformFromUserAgent(userAgent: string): string | null {
  if (/Windows/i.test(userAgent)) return "win";
  if (/Android/i.test(userAgent)) return "android";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios";
  if (/Mac OS X|Macintosh/i.test(userAgent)) return "mac";
  if (/Linux|X11/i.test(userAgent)) return "linux";
  return null;
}

function platformFromNavigator(nav: Navigator): string | null {
  const platform =
    (nav as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    nav.platform ??
    "";
  if (/win/i.test(platform)) return "win";
  if (/android/i.test(platform)) return "android";
  if (/iphone|ipad|ipod/i.test(platform)) return "ios";
  if (/mac/i.test(platform)) return "mac";
  if (/linux/i.test(platform)) return "linux";
  return null;
}

function platformsDisagree(nav: Navigator): boolean {
  const claimed = platformFromUserAgent(nav.userAgent);
  const actual = platformFromNavigator(nav);
  if (!claimed || !actual) return false;
  const iPadReportingAsMac = claimed === "mac" && actual === "ios";
  const androidReportingAsLinux = claimed === "android" && actual === "linux";
  if (iPadReportingAsMac || androidReportingAsLinux) return false;
  return claimed !== actual;
}

export function probeEnvironment(win: Window = window): EnvironmentReport {
  const nav = win.navigator;
  const userAgent = nav.userAgent ?? "";
  const claimsChrome = /Chrome\//.test(userAgent) && !/Edg\/|OPR\//.test(userAgent);
  const isDesktop = !/Mobile|Android/i.test(userAgent);

  return {
    webdriver: nav.webdriver === true,
    headless_user_agent: /HeadlessChrome|PhantomJS|Electron/i.test(userAgent),
    automation_globals: findAutomationGlobals(win, win.document),
    no_languages: !nav.languages || nav.languages.length === 0,
    zero_outer_window: win.outerWidth === 0 && win.outerHeight === 0,
    missing_chrome_runtime: claimsChrome && isDesktop && !("chrome" in win),
    user_agent_platform_mismatch: platformsDisagree(nav),
    hardware_concurrency: nav.hardwareConcurrency ?? null,
    screen: {
      width: win.screen?.width ?? 0,
      height: win.screen?.height ?? 0,
      avail_width: win.screen?.availWidth ?? 0,
      avail_height: win.screen?.availHeight ?? 0,
    },
    viewport: { width: win.innerWidth, height: win.innerHeight },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
    user_agent: userAgent,
  };
}

/**
 * Combine the probe taken when the experiment started with a later one.
 *
 * Signs of automation are kept if either probe saw them, because an agent can remove its traces
 * part way through. A zero-sized outer window is the exception: a real window reports 0x0 while it
 * is still opening, so it only counts as evidence when it never recovers.
 */
export function mergeEnvironmentReports(
  first: EnvironmentReport | null,
  latest: EnvironmentReport | null
): EnvironmentReport | null {
  if (first === null) return latest;
  if (latest === null) return first;
  return {
    ...latest,
    webdriver: first.webdriver || latest.webdriver,
    headless_user_agent: first.headless_user_agent || latest.headless_user_agent,
    automation_globals: [...new Set([...first.automation_globals, ...latest.automation_globals])],
    no_languages: first.no_languages || latest.no_languages,
    missing_chrome_runtime: first.missing_chrome_runtime || latest.missing_chrome_runtime,
    user_agent_platform_mismatch:
      first.user_agent_platform_mismatch || latest.user_agent_platform_mismatch,
    zero_outer_window: first.zero_outer_window && latest.zero_outer_window,
  };
}
