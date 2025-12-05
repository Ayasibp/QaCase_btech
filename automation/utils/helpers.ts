import { Page } from '@playwright/test';

export class NetworkHelper {
  constructor(private page: Page) {}

  /**
   * Simulate offline mode
   */
  async goOffline() {
    await this.page.context().setOffline(true);
  }

  /**
   * Simulate online mode
   */
  async goOnline() {
    await this.page.context().setOffline(false);
  }

  /**
   * Simulate slow network (3G)
   */
  async simulateSlowNetwork() {
    await this.page.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Add 1s delay
      await route.continue();
    });
  }

  /**
   * Simulate flaky network (random failures)
   */
  async simulateFlakyNetwork(failureRate: number = 0.3) {
    await this.page.route('**/*', async (route) => {
      if (Math.random() < failureRate) {
        await route.abort('failed');
      } else {
        await route.continue();
      }
    });
  }

  /**
   * Block specific API endpoints
   */
  async blockAPI(urlPattern: string | RegExp) {
    await this.page.route(urlPattern, route => route.abort());
  }

  /**
   * Mock API response
   */
  async mockAPIResponse(urlPattern: string | RegExp, mockData: any, status: number = 200) {
    await this.page.route(urlPattern, route => {
      route.fulfill({
        status: status,
        contentType: 'application/json',
        body: JSON.stringify(mockData)
      });
    });
  }

  /**
   * Intercept and log all network requests
   */
  async interceptAllRequests() {
    const requests: any[] = [];
    
    this.page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      });
    });

    this.page.on('response', response => {
      console.log(`${response.status()} ${response.url()}`);
    });

    return requests;
  }
}

export class WaitHelper {
  constructor(private page: Page) {}

  /**
   * Wait for multiple API calls
   */
  async waitForMultipleAPIs(urlPatterns: (string | RegExp)[], timeout: number = 30000) {
    const promises = urlPatterns.map(pattern => 
      this.page.waitForResponse(pattern, { timeout })
    );
    
    return await Promise.all(promises);
  }

  /**
   * Wait for element with custom condition
   */
  async waitForCondition(condition: () => Promise<boolean>, timeout: number = 10000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return true;
      }
      await this.page.waitForTimeout(500);
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * Wait for loading indicator to disappear
   */
  async waitForLoadingComplete(loadingSelector: string = '.loading, .spinner') {
    try {
      await this.page.waitForSelector(loadingSelector, { state: 'visible', timeout: 2000 });
      await this.page.waitForSelector(loadingSelector, { state: 'hidden', timeout: 30000 });
    } catch {
      // Loading indicator might not appear
    }
  }
}

export class FormHelper {
  constructor(private page: Page) {}

  /**
   * Fill form dynamically based on data object
   */
  async fillForm(formData: Record<string, string>) {
    for (const [fieldName, value] of Object.entries(formData)) {
      const input = await this.page.$(`[name="${fieldName}"], #${fieldName}`);
      
      if (input) {
        const tagName = await input.evaluate((el: any) => el.tagName.toLowerCase());
        const type = await input.evaluate((el: any) => el.type);

        if (tagName === 'select') {
          await input.selectOption(value);
        } else if (type === 'radio' || type === 'checkbox') {
          await this.page.check(`[name="${fieldName}"][value="${value}"]`);
        } else if (type === 'file') {
          await input.setInputFiles(value);
        } else {
          await input.fill(value);
        }
      }
    }
  }

  /**
   * Get all form field names
   */
  async getFormFields(): Promise<string[]> {
    return await this.page.$$eval(
      'input[name], select[name], textarea[name]',
      elements => elements.map((el: any) => el.name).filter(Boolean)
    );
  }

  /**
   * Validate required fields
   */
  async validateRequiredFields(): Promise<string[]> {
    const requiredFields = await this.page.$$eval(
      'input[required], select[required], textarea[required]',
      elements => elements.map((el: any) => ({
        name: el.name,
        value: el.value,
        type: el.type
      }))
    );

    return requiredFields
      .filter(field => !field.value || field.value.trim() === '')
      .map(field => field.name);
  }
}

export class TestDataGenerator {
  /**
   * Generate random string
   */
  static randomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate random email
   */
  static randomEmail(): string {
    return `test_${this.randomString(8)}@wemine.com`;
  }

  /**
   * Generate current date in ISO format
   */
  static currentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Generate current datetime in ISO format
   */
  static currentDateTime(): string {
    return new Date().toISOString().slice(0, 16);
  }

  /**
   * Generate test image file path
   */
  static getTestImagePath(): string {
    return './fixtures/test-image.jpg';
  }
}

export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Store authentication state
   */
  async saveAuthState(path: string = './auth-state.json') {
    await this.page.context().storageState({ path });
  }

  /**
   * Clear authentication
   */
  async clearAuth() {
    await this.page.context().clearCookies();
    await this.page.evaluate(() => localStorage.clear());
    await this.page.evaluate(() => sessionStorage.clear());
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.page.evaluate(() => 
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
    );
    return !!token;
  }
}

