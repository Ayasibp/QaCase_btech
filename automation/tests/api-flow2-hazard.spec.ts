import { test, expect } from "@playwright/test"
import { TEST_USERS, TEST_LOCATIONS } from "../utils/constants"

test.describe("API Flow 2 - Safety Hazard Report", () => {
  const baseURL = process.env.API_BASE_URL || "https://api-staging.wemine.com"
  let authToken: string
  let picAuthToken: string
  let supervisorAuthToken: string
  let createdHazardId: string
  let followupTaskId: string

  test.beforeAll(async () => {
    // Setup auth tokens for different user roles
    authToken = process.env.API_AUTH_TOKEN || "mock-reporter-token"
    picAuthToken = process.env.PIC_AUTH_TOKEN || "mock-pic-token"
    supervisorAuthToken =
      process.env.SUPERVISOR_AUTH_TOKEN || "mock-supervisor-token"
  })

  test("should create hazard report with all mandatory fields", async ({
    request,
  }) => {
    const hazardData = {
      location: TEST_LOCATIONS.MAIN_SITE.location,
      sublocation: TEST_LOCATIONS.MAIN_SITE.sublocation,
      area: TEST_LOCATIONS.MAIN_SITE.area,
      areaDescription: "Near the heavy equipment parking zone",
      evidence: "data:image/jpeg;base64,/9j/4AAQSkZJRg...", // Base64 image
      pic: TEST_USERS.PIC_USER.username,
      reportedBy: TEST_USERS.VALID_USER.username,
      reportedAt: new Date().toISOString(),
    }

    const response = await request.post(`${baseURL}/safety/hazard`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      data: hazardData,
    })

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(201)

    const body = await response.json()

    // Validate hazard creation response
    expect(body).toHaveProperty("id")
    expect(body).toHaveProperty("hazardNumber")
    expect(body).toHaveProperty("status")
    expect(body).toHaveProperty("followupTaskId")

    // Store IDs for subsequent tests
    createdHazardId = body.id
    followupTaskId = body.followupTaskId

    // Validate hazard details
    expect(body.location).toBe(hazardData.location)
    expect(body.sublocation).toBe(hazardData.sublocation)
    expect(body.area).toBe(hazardData.area)
    expect(body.pic).toBe(hazardData.pic)
    expect(body.status).toBe("OPEN")

    // Validate hazard number format (e.g., HZD-2024-001)
    expect(body.hazardNumber).toMatch(/^HZD-\d{4}-\d{3,}$/)
  })
})
