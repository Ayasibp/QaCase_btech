import { test, expect } from "@playwright/test"
import { TEST_USERS } from "../utils/constants"

test.describe("API Flow 0 - Sign In Authentication", () => {
  const baseURL = process.env.API_BASE_URL || "https://api-staging.wemine.com"
  let authToken: string
  let tenantId: string

  test.beforeAll(async () => {
    // This would typically be obtained through OAuth flow
    authToken = process.env.API_AUTH_TOKEN || "mock-token-for-testing"
  })

  test("should successfully lookup user tenant information via /user/who", async ({
    request,
  }) => {
    const response = await request.post(`${baseURL}/user/who`, {
      data: {
        username: TEST_USERS.VALID_USER.username,
      },
    })

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    const body = await response.json()

    // Validate response structure
    expect(body).toHaveProperty("tenant")
    expect(body).toHaveProperty("userId")
    expect(body.tenant).toHaveProperty("id")
    expect(body.tenant).toHaveProperty("name")
    expect(body.tenant).toHaveProperty("domain")

    // Store tenant ID for subsequent tests
    tenantId = body.tenant.id

    // Validate tenant configuration
    expect(body.tenant.name).toBeTruthy()
    expect(body.tenant.domain).toMatch(/^[a-z0-9-]+$/)
  })

  test("should retrieve user profile from /user/me with valid token", async ({
    request,
  }) => {
    const response = await request.get(`${baseURL}/user/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    })

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    const body = await response.json()

    // Validate user profile structure
    expect(body).toHaveProperty("id")
    expect(body).toHaveProperty("username")
    expect(body).toHaveProperty("email")
    expect(body).toHaveProperty("role")
    expect(body).toHaveProperty("tenantId")
    expect(body).toHaveProperty("permissions")

    // Validate data types and formats
    expect(typeof body.id).toBe("string")
    expect(typeof body.username).toBe("string")
    expect(body.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    expect(Array.isArray(body.permissions)).toBeTruthy()
  })

  test("should return proper error for invalid username in /user/who", async ({
    request,
  }) => {
    const response = await request.post(`${baseURL}/user/who`, {
      data: {
        username: "nonexistent@invalid.com",
      },
    })

    // Should return 404 for user not found
    expect(response.status()).toBe(404)

    const body = await response.json()
    expect(body).toHaveProperty("error")
    expect(body.error).toMatch(/not found|user/i)
  })
})
