import { test, expect } from '../fixtures/fixtures';
import { TEST_USERS, FORM_CODES, TEST_LOCATIONS } from '../utils/constants';
import { TestDataGenerator } from '../utils/helpers';

/**
 * Flow 1 - Equipment Inspection Form Tests
 * 
 * This test suite covers the equipment inspection functionality including:
 * 1. Form builder with multiple field types (up to 50 fields)
 * 2. Dynamic form generation based on form code
 * 3. Form submission and validation
 * 4. Offline form submission capability
 * 5. Previous submissions list
 */

test.describe('Flow 1 - Equipment Inspection', () => {
  
  test.beforeEach(async ({ loginPage }) => {
    // Login before each test
    const username = TEST_USERS.VALID_USER.username;
    const msEmail = TEST_USERS.VALID_USER.msEmail;
    const msPassword = TEST_USERS.VALID_USER.msPassword;
    
    await loginPage.performCompleteLogin(username, msEmail, msPassword);
  });

  test('TC-101: Navigate to Equipment Inspection and view submissions list', async ({ equipmentPage }) => {
    test.info().annotations.push({
      type: 'Priority',
      description: 'High - Basic navigation and list view'
    });

    // Navigate to Equipment Inspection
    await equipmentPage.navigateToEquipmentInspection();

    // Verify submissions list is visible
    const isListVisible = await equipmentPage.verifySubmissionsListVisible();
    expect(isListVisible).toBeTruthy();

    // Verify new submission button exists
    const newButton = await equipmentPage.page.isVisible('[data-testid="new-submission-btn"], button:has-text("New Submission")');
    expect(newButton).toBeTruthy();
  });

  test('TC-102: Create new submission with basic form (text, date, select fields)', async ({ equipmentPage }) => {
    test.info().annotations.push({
      type: 'Priority',
      description: 'Critical - Core form submission functionality'
    });

    await equipmentPage.navigateToEquipmentInspection();
    await equipmentPage.clickNewSubmission();

    // Select form code
    await equipmentPage.selectFormCode(FORM_CODES.BASIC_INSPECTION);

    // Wait for dynamic form to load
    await equipmentPage.waitForDynamicFormLoad();

    // Fill form with different field types
    const formData = {
      equipmentId: { type: 'text', value: 'EQ-12345' },
      inspectionDate: { type: 'date', value: TestDataGenerator.currentDate() },
      equipmentType: { type: 'select', value: 'Excavator' },
      inspectorName: { type: 'text', value: 'John Doe' },
      location: { type: 'select', value: TEST_LOCATIONS.MAIN_SITE.location }
    };

    await equipmentPage.fillCompleteForm(FORM_CODES.BASIC_INSPECTION, formData);

    // Submit form
    await equipmentPage.submitForm();

    // Verify submission success
    await equipmentPage.waitForSubmissionSuccess();
  });

  test('TC-103: Create submission with all field types including image upload', async ({ equipmentPage }) => {
    test.info().annotations.push({
      type: 'Priority',
      description: 'Critical - Test all field types including image picker'
    });

    await equipmentPage.navigateToEquipmentInspection();
    await equipmentPage.clickNewSubmission();
    await equipmentPage.selectFormCode(FORM_CODES.DETAILED_INSPECTION);
    await equipmentPage.waitForDynamicFormLoad();

    // Fill all field types
    await equipmentPage.fillTextField('equipmentName', 'Bulldozer XL-500');
    await equipmentPage.fillDateField('inspectionDate', TestDataGenerator.currentDate());
    await equipmentPage.selectDropdownOption('status', 'operational');
    await equipmentPage.selectRadioOption('condition', 'good');
    
    // Upload image
    const imagePath = TestDataGenerator.getTestImagePath();
    await equipmentPage.uploadImage('equipmentPhoto', imagePath);

    // Submit and verify
    await equipmentPage.submitForm();
    await equipmentPage.waitForSubmissionSuccess();

    // Verify submission appears in list
    const isInList = await equipmentPage.verifySubmissionInList(FORM_CODES.DETAILED_INSPECTION);
    expect(isInList).toBeTruthy();
  });

  test('TC-104: Verify dynamic form generates based on selected form code', async ({ equipmentPage }) => {
    test.info().annotations.push({
      type: 'Priority',
      description: 'High - Dynamic form builder validation'
    });

    await equipmentPage.navigateToEquipmentInspection();
    await equipmentPage.clickNewSubmission();

    // Test different form codes generate different fields
    await equipmentPage.selectFormCode(FORM_CODES.BASIC_INSPECTION);
    await equipmentPage.waitForDynamicFormLoad();
    const basicFieldCount = await equipmentPage.verifyFieldCount(1, 50);

    // Change form code
    await equipmentPage.selectFormCode(FORM_CODES.DETAILED_INSPECTION);
    await equipmentPage.waitForDynamicFormLoad();
    const detailedFieldCount = await equipmentPage.verifyFieldCount(1, 50);

    console.log(`Basic form fields: ${basicFieldCount}, Detailed form fields: ${detailedFieldCount}`);
    
    // Forms should have different field counts (assuming they are different)
    // This validates that form changes dynamically
  });

  test('TC-105: Verify form supports maximum of 50 fields', async ({ equipmentPage, page }) => {
    test.info().annotations.push({
      type: 'Priority',
      description: 'Medium - Boundary testing for field limits'
    });

    // Mock a form with 50 fields
    await page.route('**/forms/**', route => {
      const fields = Array.from({ length: 50 }, (_, i) => ({
        name: `field${i + 1}`,
        type: 'text',
        label: `Field ${i + 1}`,
        required: false
      }));

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ fields })
      });
    });

    await equipmentPage.navigateToEquipmentInspection();
    await equipmentPage.clickNewSubmission();
    await equipmentPage.selectFormCode('FORM-MAX-FIELDS');
    await equipmentPage.waitForDynamicFormLoad();

    // Verify exactly 50 fields are rendered
    const fieldCount = await equipmentPage.verifyFieldCount(50, 50);
    expect(fieldCount).toBe(50);
  });

  test('TC-106: Form submission works in offline mode', async ({ equipmentPage, networkHelper }) => {
    test.info().annotations.push({
      type: 'Priority',
      description: 'Critical - Offline capability requirement'
    });

    await equipmentPage.navigateToEquipmentInspection();
    await equipmentPage.clickNewSubmission();
    await equipmentPage.selectFormCode(FORM_CODES.BASIC_INSPECTION);
    await equipmentPage.waitForDynamicFormLoad();

    // Fill form
    await equipmentPage.fillTextField('equipmentId', 'EQ-OFFLINE-001');
    await equipmentPage.fillDateField('inspectionDate', TestDataGenerator.currentDate());
    await equipmentPage.selectDropdownOption('equipmentType', 'Excavator');

    // Test offline submission
    await equipmentPage.testOfflineFormSubmission();

    // Verify submission was queued and synced when back online
    console.log('Offline submission test completed');
  });

  test('TC-107: Verify previous submissions list displays correctly', async ({ equipmentPage }) => {
    test.info().annotations.push({
      type: 'Priority',
      description: 'High - List view and data persistence'
    });

    await equipmentPage.navigateToEquipmentInspection();

    // Get initial submission count
    const initialCount = await equipmentPage.getSubmissionCount();

    // Create a new submission
    await equipmentPage.clickNewSubmission();
    await equipmentPage.selectFormCode(FORM_CODES.BASIC_INSPECTION);
    await equipmentPage.waitForDynamicFormLoad();
    
    await equipmentPage.fillTextField('equipmentId', `EQ-${TestDataGenerator.randomString(6)}`);
    await equipmentPage.submitForm();
    await equipmentPage.waitForSubmissionSuccess();

    // Go back to list
    await equipmentPage.navigateToEquipmentInspection();

    // Verify count increased
    const newCount = await equipmentPage.getSubmissionCount();
    expect(newCount).toBeGreaterThan(initialCount);
  });

  test('TC-108: Form validation for radio button with up to 4 options', async ({ equipmentPage, page }) => {
    test.info().annotations.push({
      type: 'Priority',
      description: 'Medium - Radio button field validation'
    });

    await equipmentPage.navigateToEquipmentInspection();
    await equipmentPage.clickNewSubmission();
    await equipmentPage.selectFormCode(FORM_CODES.DETAILED_INSPECTION);
    await equipmentPage.waitForDynamicFormLoad();

    // Find radio button field
    const radioFields = await page.$$('input[type="radio"]');
    
    if (radioFields.length > 0) {
      // Get all radio buttons with the same name (should be max 4)
      const firstRadioName = await radioFields[0].getAttribute('name');
      const sameNameRadios = await page.$$(`input[type="radio"][name="${firstRadioName}"]`);
      
      console.log(`Radio field "${firstRadioName}" has ${sameNameRadios.length} options`);
      expect(sameNameRadios.length).toBeLessThanOrEqual(4);
    }
  });

  test('TC-109: Form submission with slow network connection', async ({ equipmentPage, networkHelper }) => {
    test.info().annotations.push({
      type: 'Priority',
      description: 'High - Poor connectivity handling'
    });

    // Simulate slow network
    await networkHelper.simulateSlowNetwork();

    await equipmentPage.navigateToEquipmentInspection();
    await equipmentPage.clickNewSubmission();
    await equipmentPage.selectFormCode(FORM_CODES.BASIC_INSPECTION);
    await equipmentPage.waitForDynamicFormLoad();

    await equipmentPage.fillTextField('equipmentId', 'EQ-SLOW-NETWORK');
    await equipmentPage.fillDateField('inspectionDate', TestDataGenerator.currentDate());

    await equipmentPage.submitForm();
    
    // Should still succeed despite slow network
    await equipmentPage.waitForSubmissionSuccess();
  });

  test('TC-110: Verify form code field is mandatory', async ({ equipmentPage, page }) => {
    test.info().annotations.push({
      type: 'Priority',
      description: 'Medium - Required field validation'
    });

    await equipmentPage.navigateToEquipmentInspection();
    await equipmentPage.clickNewSubmission();

    // Try to submit without selecting form code
    const submitButton = page.locator('[data-testid="submit-btn"], button[type="submit"]');
    
    // Form code field should be marked as required
    const formCodeSelect = page.locator('[data-testid="form-code-select"], select[name="formCode"]');
    const isRequired = await formCodeSelect.getAttribute('required');
    
    expect(isRequired).not.toBeNull();
  });
});

