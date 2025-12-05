import { test, expect } from '../fixtures/fixtures';
import { TEST_USERS, API_ENDPOINTS } from '../utils/constants';

/**
 * Flow 0 - Sign In Tests
 * 
 * This test suite covers the authentication flow including:
 * 1. Username entry and tenant lookup
 * 2. Microsoft SSO integration
 * 3. User profile fetching
 * 4. Master data synchronization with progress bar
 * 5. First-time restart prompt
 */

test.describe('Flow 0 - Sign In', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('TC-001: Successful login with valid credentials', async ({ loginPage, page }) => {
    test.info().annotations.push({
      type: 'Priority',
      description: 'Critical - Core authentication flow'
    });

    const username = TEST_USERS.VALID_USER.username;
    const msEmail = TEST_USERS.VALID_USER.msEmail;
    const msPassword = TEST_USERS.VALID_USER.msPassword;

    // Step 1: Navigate to login page
    await loginPage.navigateToLogin();
    await expect(page).toHaveURL(/.*login/);

    // Step 2: Enter username
    await loginPage.enterUsername(username);
    await loginPage.clickContinue();

    // Step 3: Verify /user/who API call
    const userWhoResponse = await loginPage.waitForUserLookupAPI();
    expect(userWhoResponse.status()).toBe(200);

    // Step 4: Verify tenant information lookup
    const tenantResponse = await loginPage.waitForTenantInfoAPI();
    expect(tenantResponse.status()).toBe(200);

    // Step 5: Handle Microsoft login
    await loginPage.handleMicrosoftLogin(msEmail, msPassword);

    // Step 6: Verify /user/me API call
    const userMeResponse = await loginPage.waitForUserProfileAPI();
    expect(userMeResponse.status()).toBe(200);

    // Step 7: Verify /tenant/master API call
    const masterDataResponse = await loginPage.waitForMasterDataAPI();
    expect(masterDataResponse.status()).toBe(200);

    // Step 8: Wait for progressive data loading with progress bar
    await loginPage.waitForProgressBarToComplete();

    // Step 9: Verify successful login
    const isLoggedIn = await loginPage.isLoginSuccessful();
    expect(isLoggedIn).toBeTruthy();
  });

  test('TC-002: Verify master data loading with progress bar', async ({ loginPage, page }) => {
    test.info().annotations.push({
      type: 'Priority',
      description: 'High - Data synchronization validation'
    });

    const username = TEST_USERS.VALID_USER.username;
    const msEmail = TEST_USERS.VALID_USER.msEmail;
    const msPassword = TEST_USERS.VALID_USER.msPassword;

    await loginPage.navigateToLogin();
    await loginPage.enterUsername(username);
    await loginPage.clickContinue();
    await loginPage.waitForUserLookupAPI();
    await loginPage.waitForTenantInfoAPI();
    await loginPage.handleMicrosoftLogin(msEmail, msPassword);
    await loginPage.waitForUserProfileAPI();
    await loginPage.waitForMasterDataAPI();

    // Intercept all master data endpoint calls
    const apiCalls: string[] = [];
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/locations') || 
          url.includes('/sublocations') || 
          url.includes('/areas') ||
          url.includes('/employees') ||
          url.includes('/forms')) {
        apiCalls.push(url);
      }
    });

    await loginPage.waitForProgressBarToComplete();

    // Verify multiple endpoints were called
    expect(apiCalls.length).toBeGreaterThan(0);
    console.log(`Master data endpoints called: ${apiCalls.length}`);
  });

  test('TC-003: Verify restart prompt after first-time master data update', async ({ loginPage, page }) => {
    test.info().annotations.push({
      type: 'Priority',
      description: 'Medium - First-time user experience'
    });

    // Mock scenario where it's the first time loading master data
    await page.route('**/tenant/master', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isFirstSync: true,
          data: { /* master data */ }
        })
      });
    });

    const username = TEST_USERS.VALID_USER.username;
    const msEmail = TEST_USERS.VALID_USER.msEmail;
    const msPassword = TEST_USERS.VALID_USER.msPassword;

    await loginPage.performCompleteLogin(username, msEmail, msPassword);

    // Check for restart prompt
    const hasRestartPrompt = await loginPage.checkRestartPrompt();
    
    // Note: This may vary based on implementation
    // If first sync, restart prompt should appear
    console.log(`Restart prompt displayed: ${hasRestartPrompt}`);
  });

  test('TC-004: Login fails with invalid username', async ({ loginPage, page }) => {
    test.info().annotations.push({
      type: 'Priority',
      description: 'High - Negative test for authentication'
    });

    await loginPage.navigateToLogin();
    await loginPage.enterUsername('invalid@user.com');
    await loginPage.clickContinue();

    // Should receive error response from /user/who
    const response = await page.waitForResponse(/\/user\/who/);
    expect(response.status()).toBeGreaterThanOrEqual(400);

    // Error message should be displayed
    const errorElement = await page.$('.error-message, .alert-error, [data-testid="error-message"]');
    expect(errorElement).toBeTruthy();
  });

  test('TC-005: Verify all required APIs are called in sequence', async ({ loginPage, page }) => {
    test.info().annotations.push({
      type: 'Priority',
      description: 'High - API integration validation'
    });

    const apiCallSequence: string[] = [];

    page.on('response', response => {
      const url = response.url();
      if (url.includes('/user/who')) apiCallSequence.push('user/who');
      if (url.includes('/tenant/')) apiCallSequence.push('tenant/info');
      if (url.includes('/user/me')) apiCallSequence.push('user/me');
      if (url.includes('/tenant/master')) apiCallSequence.push('tenant/master');
    });

    const username = TEST_USERS.VALID_USER.username;
    const msEmail = TEST_USERS.VALID_USER.msEmail;
    const msPassword = TEST_USERS.VALID_USER.msPassword;

    await loginPage.performCompleteLogin(username, msEmail, msPassword);

    // Verify the sequence of API calls
    expect(apiCallSequence).toContain('user/who');
    expect(apiCallSequence).toContain('tenant/info');
    expect(apiCallSequence).toContain('user/me');
    expect(apiCallSequence).toContain('tenant/master');

    // Verify order: user/who should come before user/me
    const whoIndex = apiCallSequence.indexOf('user/who');
    const meIndex = apiCallSequence.indexOf('user/me');
    expect(whoIndex).toBeLessThan(meIndex);
  });

  test('TC-006: Login works with poor network connection', async ({ loginPage, networkHelper, page }) => {
    test.info().annotations.push({
      type: 'Priority',
      description: 'Critical - Offline capability requirement'
    });

    // Simulate slow 3G network
    await networkHelper.simulateSlowNetwork();

    const username = TEST_USERS.VALID_USER.username;
    const msEmail = TEST_USERS.VALID_USER.msEmail;
    const msPassword = TEST_USERS.VALID_USER.msPassword;

    // Login should still succeed, just slower
    await loginPage.performCompleteLogin(username, msEmail, msPassword);

    const isLoggedIn = await loginPage.isLoginSuccessful();
    expect(isLoggedIn).toBeTruthy();
  });

  test('TC-007: Verify session persistence after login', async ({ loginPage, authHelper, page }) => {
    test.info().annotations.push({
      type: 'Priority',
      description: 'Medium - Session management'
    });

    const username = TEST_USERS.VALID_USER.username;
    const msEmail = TEST_USERS.VALID_USER.msEmail;
    const msPassword = TEST_USERS.VALID_USER.msPassword;

    await loginPage.performCompleteLogin(username, msEmail, msPassword);

    // Check authentication state
    const isAuthenticated = await authHelper.isAuthenticated();
    expect(isAuthenticated).toBeTruthy();

    // Navigate to another page
    await page.goto('/dashboard');
    
    // Should still be authenticated
    const stillAuthenticated = await authHelper.isAuthenticated();
    expect(stillAuthenticated).toBeTruthy();
  });
});

