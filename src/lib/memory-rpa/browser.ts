import { chromium, type Browser, type BrowserContext } from "playwright";

const BROWSER_CONFIG = {
  headless: process.env.RPA_HEADLESS !== "false",
  viewport: { width: 1280, height: 900 },
  timeout: 30_000,
  screenshotsDir: process.env.RPA_SCREENSHOTS_DIR ?? "/tmp/blueblinq-rpa",
} as const;

let browserInstance: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (browserInstance?.isConnected()) {
    return browserInstance;
  }
  browserInstance = await chromium.launch({
    headless: BROWSER_CONFIG.headless,
  });
  return browserInstance;
}

export async function createContext(): Promise<BrowserContext> {
  const browser = await getBrowser();
  return browser.newContext({
    viewport: BROWSER_CONFIG.viewport,
    locale: "es-UY",
    timezoneId: "America/Montevideo",
  });
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

export function getScreenshotsDir(): string {
  return BROWSER_CONFIG.screenshotsDir;
}
