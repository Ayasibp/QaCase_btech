import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class EquipmentInspectionPage extends BasePage {
  // Selectors
  private readonly equipmentInspectionMenu = '[data-testid="equipment-inspection-menu"], a:has-text("Equipment Inspection")';
  private readonly submissionsList = '[data-testid="submissions-list"], .submissions-list';
  private readonly newSubmissionButton = '[data-testid="new-submission-btn"], button:has-text("New Submission")';
  private readonly formCodeSelect = '[data-testid="form-code-select"], select[name="formCode"], #formCode';
  private readonly submitButton = '[data-testid="submit-btn"], button[type="submit"]';
  private readonly successMessage = '[data-testid="success-message"], .alert-success, .success-notification';
  private readonly formContainer = '[data-testid="dynamic-form"], .dynamic-form-container';
  
  // Dynamic field selectors
  private readonly textInput = (fieldName: string) => `input[name="${fieldName}"], #${fieldName}`;
  private readonly dateInput = (fieldName: string) => `input[type="date"][name="${fieldName}"], [data-testid="${fieldName}-date"]`;
  private readonly selectInput = (fieldName: string) => `select[name="${fieldName}"], #${fieldName}`;
  private readonly radioInput = (fieldName: string, option: string) => `input[type="radio"][name="${fieldName}"][value="${option}"]`;
  private readonly imageInput = (fieldName: string) => `input[type="file"][name="${fieldName}"], [data-testid="${fieldName}-image"]`;

  constructor(page: Page) {
    super(page);
  }

  async navigateToEquipmentInspection() {
    await this.clickElement(this.equipmentInspectionMenu);
    await this.waitForPageLoad();
  }

  async verifySubmissionsListVisible(): Promise<boolean> {
    return await this.isVisible(this.submissionsList);
  }

  async clickNewSubmission() {
    await this.clickElement(this.newSubmissionButton);
    await this.waitForPageLoad();
  }

  async selectFormCode(formCode: string) {
    await this.page.waitForSelector(this.formCodeSelect);
    await this.selectOption(this.formCodeSelect, formCode);
    // Wait for dynamic form to load
    await this.page.waitForTimeout(1000);
    await this.waitForElement(this.formContainer);
  }

  async waitForDynamicFormLoad() {
    await this.page.waitForSelector(this.formContainer, { timeout: 10000 });
    // Verify form has loaded by checking for at least one input field
    await this.page.waitForSelector('input, select, textarea', { timeout: 5000 });
  }

  async fillTextField(fieldName: string, value: string) {
    const selector = this.textInput(fieldName);
    await this.page.waitForSelector(selector);
    await this.fillInput(selector, value);
  }

  async fillDateField(fieldName: string, date: string) {
    const selector = this.dateInput(fieldName);
    await this.page.waitForSelector(selector);
    await this.fillInput(selector, date);
  }

  async selectDropdownOption(fieldName: string, value: string) {
    const selector = this.selectInput(fieldName);
    await this.page.waitForSelector(selector);
    await this.selectOption(selector, value);
  }

  async selectRadioOption(fieldName: string, option: string) {
    const selector = this.radioInput(fieldName, option);
    await this.page.waitForSelector(selector);
    await this.clickElement(selector);
  }

  async uploadImage(fieldName: string, imagePath: string) {
    const selector = this.imageInput(fieldName);
    await this.page.waitForSelector(selector);
    await this.uploadFile(selector, imagePath);
  }

  async verifyFieldCount(expectedMinCount: number = 1, expectedMaxCount: number = 50) {
    const fields = await this.page.$$('input, select, textarea');
    const actualCount = fields.length;
    expect(actualCount).toBeGreaterThanOrEqual(expectedMinCount);
    expect(actualCount).toBeLessThanOrEqual(expectedMaxCount);
    return actualCount;
  }

  async submitForm() {
    await this.clickElement(this.submitButton);
  }

  async waitForSubmissionSuccess() {
    await this.page.waitForSelector(this.successMessage, { timeout: 15000 });
  }

  async verifySubmissionInList(formCode: string): Promise<boolean> {
    await this.navigateToEquipmentInspection();
    const listContent = await this.getText(this.submissionsList);
    return listContent.includes(formCode);
  }

  async getSubmissionCount(): Promise<number> {
    const submissions = await this.page.$$(`${this.submissionsList} .submission-item, ${this.submissionsList} li, ${this.submissionsList} tr`);
    return submissions.length;
  }

  async fillCompleteForm(formCode: string, formData: Record<string, any>) {
    await this.selectFormCode(formCode);
    await this.waitForDynamicFormLoad();

    for (const [fieldName, fieldValue] of Object.entries(formData)) {
      const fieldType = fieldValue.type || 'text';
      
      switch (fieldType) {
        case 'text':
          await this.fillTextField(fieldName, fieldValue.value);
          break;
        case 'date':
          await this.fillDateField(fieldName, fieldValue.value);
          break;
        case 'select':
          await this.selectDropdownOption(fieldName, fieldValue.value);
          break;
        case 'radio':
          await this.selectRadioOption(fieldName, fieldValue.value);
          break;
        case 'image':
          await this.uploadImage(fieldName, fieldValue.value);
          break;
      }
    }
  }

  async testOfflineFormSubmission() {
    // Simulate offline mode
    await this.page.context().setOffline(true);
    
    await this.submitForm();
    
    // Verify form is queued for submission
    const queueMessage = await this.page.textContent('body');
    expect(queueMessage).toContain('queued' || 'offline' || 'pending');
    
    // Go back online
    await this.page.context().setOffline(false);
    
    // Wait for auto-sync
    await this.page.waitForTimeout(3000);
  }
}

