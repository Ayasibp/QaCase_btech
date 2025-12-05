import { Page, expect } from "@playwright/test"
import { BasePage } from "./BasePage"

export class LoginPage extends BasePage {
  // Selectors
  private readonly usernameInput =
    '[data-testid="username-input"], #username, input[name="username"]'
  private readonly continueButton =
    '[data-testid="continue-btn"], button:has-text("Continue")'
  private readonly msLoginFrame =
    'iframe[name*="login"], iframe[src*="microsoft"]'
  private readonly msEmailInput = 'input[type="email"], input[name="loginfmt"]'
  private readonly msPasswordInput =
    'input[type="password"], input[name="passwd"]'
  private readonly msNextButton = 'input[type="submit"], button[type="submit"]'
  private readonly msSignInButton =
    'input[type="submit"][value*="Sign in"], button:has-text("Sign in")'
  private readonly msStaySignedInButton =
    'input[type="submit"], button:has-text("Yes")'
  private readonly progressBar = '[data-testid="progress-bar"], .progress-bar'
  private readonly restartPrompt =
    '[data-testid="restart-prompt"], .restart-notification'
  private readonly profileIcon = '[data-testid="profile-icon"], .user-profile'

  constructor(page: Page) {
    super(page)
  }

  async navigateToLogin() {
    await this.navigateTo("/login")
    await this.waitForPageLoad()
  }

  async enterUsername(username: string) {
    await this.page.waitForSelector(this.usernameInput)
    await this.fillInput(this.usernameInput, username)
  }

  async clickContinue() {
    await this.clickElement(this.continueButton)
  }

  async waitForUserLookupAPI() {
    // Wait for /user/who API call
    const response = await this.waitForAPIResponse(/\/user\/who/)
    expect(response.status()).toBe(200)
    return response
  }

  async waitForTenantInfoAPI() {
    // Backend looks up tenant information
    const response = await this.waitForAPIResponse(
      /\/tenant\/info|\/tenant\/lookup/
    )
    expect(response.status()).toBe(200)
    return response
  }

  async handleMicrosoftLogin(email: string, password: string) {
    // Wait for Microsoft login screen
    await this.page.waitForTimeout(2000) // Wait for redirect

    try {
      // Check if we're on Microsoft login page
      const isMSLoginPage =
        (await this.page.url().includes("microsoft")) ||
        (await this.page.url().includes("login.microsoftonline.com"))

      if (isMSLoginPage) {
        // Enter email
        await this.page.waitForSelector(this.msEmailInput, { timeout: 10000 })
        await this.fillInput(this.msEmailInput, email)
        await this.clickElement(this.msNextButton)

        // Enter password
        await this.page.waitForSelector(this.msPasswordInput, {
          timeout: 10000,
        })
        await this.fillInput(this.msPasswordInput, password)
        await this.clickElement(this.msSignInButton)

        // Handle "Stay signed in?" prompt
        try {
          await this.page.waitForSelector(this.msStaySignedInButton, {
            timeout: 5000,
          })
          await this.clickElement(this.msStaySignedInButton)
        } catch {
          // Prompt may not appear
        }
      }
    } catch (error) {
      console.log("Microsoft login handling error:", error)
      throw error
    }
  }

  async waitForUserProfileAPI() {
    // Wait for /user/me API call
    const response = await this.waitForAPIResponse(/\/user\/me/)
    expect(response.status()).toBe(200)
    return response
  }

  async waitForMasterDataAPI() {
    // Wait for /tenant/master API call
    const response = await this.waitForAPIResponse(/\/tenant\/master/)
    expect(response.status()).toBe(200)
    return response
  }

  async waitForProgressBarToComplete() {
    // Wait for progress bar to appear
    await this.page.waitForSelector(this.progressBar, { timeout: 15000 })

    // Wait for multiple endpoint calls (locations, sublocations, areas, employees, forms, etc.)
    const expectedAPIs = [
      /\/locations/,
      /\/sublocations/,
      /\/areas/,
      /\/employees/,
      /\/forms/,
    ]

    for (const apiPattern of expectedAPIs) {
      try {
        await this.waitForAPIResponse(apiPattern)
      } catch {
        console.log(`Optional API ${apiPattern} not called`)
      }
    }

    // Wait for progress bar to disappear or reach 100%
    await this.page.waitForSelector(this.progressBar, {
      state: "hidden",
      timeout: 60000,
    })
  }

  async checkRestartPrompt(): Promise<boolean> {
    try {
      return await this.isVisible(this.restartPrompt)
    } catch {
      return false
    }
  }

  async isLoginSuccessful(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.profileIcon, { timeout: 10000 })
      return true
    } catch {
      return false
    }
  }

  async performCompleteLogin(
    username: string,
    msEmail: string,
    msPassword: string
  ) {
    await this.navigateToLogin()
    await this.enterUsername(username)
    await this.clickContinue()
    await this.waitForUserLookupAPI()
    await this.waitForTenantInfoAPI()
    await this.handleMicrosoftLogin(msEmail, msPassword)
    await this.waitForUserProfileAPI()
    await this.waitForMasterDataAPI()
    await this.waitForProgressBarToComplete()
  }
}
