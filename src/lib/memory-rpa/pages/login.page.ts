import type { Page } from "playwright";
import type { MemoryCredentials } from "../types";

// ─── Selectors (TODO: update with real Memory selectors) ────────
const SELECTORS = {
  emailInput: 'input[name="email"], input[type="email"], #email',
  passwordInput: 'input[name="password"], input[type="password"], #password',
  submitButton: 'button[type="submit"], .login-btn, #login-button',
  loggedInIndicator: ".dashboard, .main-menu, .user-avatar",
  errorMessage: ".error-message, .alert-danger, .login-error",
} as const;

const MEMORY_LOGIN_URL = process.env.MEMORY_LOGIN_URL ?? "https://app.memory.com.uy/login";

const DEFAULT_TIMEOUT = 15_000;

export class LoginPage {
  constructor(private page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto(MEMORY_LOGIN_URL, {
      waitUntil: "networkidle",
      timeout: 30_000,
    });
  }

  async login(credentials: MemoryCredentials): Promise<void> {
    await this.page.waitForSelector(SELECTORS.emailInput, {
      timeout: DEFAULT_TIMEOUT,
    });

    await this.page.fill(SELECTORS.emailInput, credentials.email);
    await this.page.fill(SELECTORS.passwordInput, credentials.password);
    await this.page.click(SELECTORS.submitButton);

    // Wait for either success or error
    await Promise.race([
      this.page.waitForSelector(SELECTORS.loggedInIndicator, {
        timeout: DEFAULT_TIMEOUT,
      }),
      this.page.waitForSelector(SELECTORS.errorMessage, {
        timeout: DEFAULT_TIMEOUT,
      }),
    ]);

    const hasError = await this.page.$(SELECTORS.errorMessage);
    if (hasError) {
      const errorText = await hasError.textContent();
      throw new Error(`Memory login failed: ${errorText}`);
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await this.page.waitForSelector(SELECTORS.loggedInIndicator, {
        timeout: 5_000,
      });
      return true;
    } catch {
      return false;
    }
  }

  async takeScreenshot(path: string): Promise<void> {
    await this.page.screenshot({ path, fullPage: true });
  }
}
