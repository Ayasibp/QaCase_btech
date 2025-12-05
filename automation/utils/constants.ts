export const TEST_USERS = {
  VALID_USER: {
    username: 'testuser@mining.com',
    msEmail: 'testuser@mining.com',
    msPassword: process.env.MS_PASSWORD || 'TestPassword123!',
    role: 'operator'
  },
  SUPERVISOR: {
    username: 'supervisor@mining.com',
    msEmail: 'supervisor@mining.com',
    msPassword: process.env.MS_PASSWORD || 'SupervisorPass123!',
    role: 'supervisor'
  },
  PIC_USER: {
    username: 'pic@mining.com',
    msEmail: 'pic@mining.com',
    msPassword: process.env.MS_PASSWORD || 'PICPass123!',
    role: 'pic'
  }
};

export const TEST_LOCATIONS = {
  MAIN_SITE: {
    location: 'Main Site',
    sublocation: 'North Section',
    area: 'Area A1'
  },
  SECONDARY_SITE: {
    location: 'Secondary Site',
    sublocation: 'South Section',
    area: 'Area B2'
  }
};

export const FORM_CODES = {
  BASIC_INSPECTION: 'FORM-001',
  DETAILED_INSPECTION: 'FORM-002',
  EQUIPMENT_CHECK: 'FORM-003'
};

export const API_ENDPOINTS = {
  USER_WHO: /\/user\/who/,
  USER_ME: /\/user\/me/,
  TENANT_MASTER: /\/tenant\/master/,
  TENANT_INFO: /\/tenant\/info/,
  LOCATIONS: /\/locations/,
  SUBLOCATIONS: /\/sublocations/,
  AREAS: /\/areas/,
  EMPLOYEES: /\/employees/,
  FORMS: /\/forms/,
  EQUIPMENT_SUBMISSION: /\/equipment\/submission/,
  HAZARD_CREATE: /\/safety\/hazard|\/hazard\/create/,
  TASK_CREATE: /\/workflow\/task/,
  NOTIFICATION_SEND: /\/notification\/send/
};

export const TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 15000,
  LONG: 30000,
  EXTRA_LONG: 60000
};

export const ERROR_MESSAGES = {
  MANDATORY_FIELD: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  NETWORK_ERROR: 'Network error',
  UNAUTHORIZED: 'Unauthorized access'
};

