import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { EquipmentInspectionPage } from '../pages/EquipmentInspectionPage';
import { SafetyHazardPage } from '../pages/SafetyHazardPage';
import { NetworkHelper, WaitHelper, FormHelper, AuthHelper } from '../utils/helpers';

type MyFixtures = {
  loginPage: LoginPage;
  equipmentPage: EquipmentInspectionPage;
  hazardPage: SafetyHazardPage;
  networkHelper: NetworkHelper;
  waitHelper: WaitHelper;
  formHelper: FormHelper;
  authHelper: AuthHelper;
  authenticatedPage: void;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  equipmentPage: async ({ page }, use) => {
    const equipmentPage = new EquipmentInspectionPage(page);
    await use(equipmentPage);
  },

  hazardPage: async ({ page }, use) => {
    const hazardPage = new SafetyHazardPage(page);
    await use(hazardPage);
  },

  networkHelper: async ({ page }, use) => {
    const networkHelper = new NetworkHelper(page);
    await use(networkHelper);
  },

  waitHelper: async ({ page }, use) => {
    const waitHelper = new WaitHelper(page);
    await use(waitHelper);
  },

  formHelper: async ({ page }, use) => {
    const formHelper = new FormHelper(page);
    await use(formHelper);
  },

  authHelper: async ({ page }, use) => {
    const authHelper = new AuthHelper(page);
    await use(authHelper);
  },

  // Auto-authenticated page fixture
  authenticatedPage: async ({ page, loginPage }, use) => {
    const username = process.env.TEST_USERNAME || 'testuser@mining.com';
    const msEmail = process.env.MS_USERNAME || 'testuser@mining.com';
    const msPassword = process.env.MS_PASSWORD || 'TestPassword123!';

    // Perform login
    await loginPage.performCompleteLogin(username, msEmail, msPassword);
    
    await use();
  },
});

export { expect } from '@playwright/test';

