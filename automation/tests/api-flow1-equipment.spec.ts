import { test, expect } from "@playwright/test"
import { TEST_USERS, FORM_CODES } from "../utils/constants"

test.describe("API Flow 1 - Equipment Inspection Form", () => {
  const baseURL = process.env.API_BASE_URL || "https://api-staging.wemine.com"
  let authToken: string
  let formId: string
  let submissionId: string

  test.beforeAll(async () => {
    authToken = process.env.API_AUTH_TOKEN || "mock-token-for-testing"
  })

  test("should retrieve form definition by form code", async ({ request }) => {
    const formCode = FORM_CODES.BASIC_INSPECTION

    const response = await request.get(`${baseURL}/forms/${formCode}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    })

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    const body = await response.json()

    // Validate form structure
    expect(body).toHaveProperty("id")
    expect(body).toHaveProperty("code")
    expect(body).toHaveProperty("name")
    expect(body).toHaveProperty("fields")
    expect(body).toHaveProperty("version")
    expect(body).toHaveProperty("active")

    formId = body.id

    // Validate fields array
    expect(Array.isArray(body.fields)).toBeTruthy()
    expect(body.fields.length).toBeGreaterThan(0)
    expect(body.fields.length).toBeLessThanOrEqual(50) // Max 50 fields

    // Validate each field has required properties
    body.fields.forEach((field: any) => {
      expect(field).toHaveProperty("id")
      expect(field).toHaveProperty("name")
      expect(field).toHaveProperty("type")
      expect(field).toHaveProperty("label")
      expect(field).toHaveProperty("required")
      expect(field).toHaveProperty("order")
    })
  })

  test("should enforce maximum 50 fields per form", async ({ request }) => {
    const response = await request.get(
      `${baseURL}/forms/${FORM_CODES.DETAILED_INSPECTION}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    )

    const form = await response.json()

    // Validate field count constraint
    expect(form.fields.length).toBeLessThanOrEqual(50)
  })

  test("should successfully submit equipment inspection with valid data", async ({
    request,
  }) => {
    // First get the form structure
    const formResponse = await request.get(
      `${baseURL}/forms/${FORM_CODES.BASIC_INSPECTION}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    )

    const form = await formResponse.json()

    // Build dynamic submission data based on form fields
    const submissionData: any = {
      formCode: FORM_CODES.BASIC_INSPECTION,
      formId: form.id,
      submittedBy: TEST_USERS.VALID_USER.username,
      submittedAt: new Date().toISOString(),
      equipmentId: "EQ-12345",
      fields: {},
    }

    // Fill in field values based on field types
    form.fields.forEach((field: any) => {
      switch (field.type) {
        case "text":
          submissionData.fields[field.id] = "Test value for " + field.name
          break
        case "date":
          submissionData.fields[field.id] = new Date().toISOString()
          break
        case "select":
          submissionData.fields[field.id] =
            field.options?.[0]?.value || "option1"
          break
        case "radio":
          submissionData.fields[field.id] =
            field.options?.[0]?.value || "option1"
          break
        case "image":
          submissionData.fields[field.id] =
            "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
          break
      }
    })

    // Submit the form
    const submitResponse = await request.post(
      `${baseURL}/equipment/inspection/submit`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        data: submissionData,
      }
    )

    expect(submitResponse.ok()).toBeTruthy()
    expect(submitResponse.status()).toBe(201)

    const submission = await submitResponse.json()

    // Validate submission response
    expect(submission).toHaveProperty("id")
    expect(submission).toHaveProperty("submissionNumber")
    expect(submission).toHaveProperty("formCode")
    expect(submission).toHaveProperty("status")
    expect(submission).toHaveProperty("submittedAt")

    submissionId = submission.id

    // Validate submission details
    expect(submission.formCode).toBe(FORM_CODES.BASIC_INSPECTION)
    expect(submission.submittedBy).toBe(TEST_USERS.VALID_USER.username)
    expect(submission.status).toBe("SUBMITTED")

    // Validate submission number format (e.g., INS-2024-001)
    expect(submission.submissionNumber).toMatch(/^INS-\d{4}-\d{3,}$/)
  })
})
