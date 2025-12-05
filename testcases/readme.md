# Manual Test Cases - WeMine Application

## FLOW 0 - SIGN IN

### TC-F0-001: Mobile App - Successful First Time Login

**Preconditions:**

1. User has valid registered account and tenant
2. WeMine Mobile app is installed
3. Internet connection is available

**Steps:**

1. Open WeMine Mobile Application
2. Enter valid username in the username field
3. Click "Sign In" button
4. Wait for Microsoft login screen to appear
5. Enter valid password in Microsoft login screen
6. Click "Sign In" in Microsoft screen
7. Wait for master data download with progress bar
8. Observe restart prompt

**Expected Results:**

1. API call to `/user/who` is successful
2. Tenant information is retrieved
3. Microsoft login screen opens correctly
4. User profile is retrieved from `/user/me`
5. Master data is requested from `/tenant/master`
6. Progress bar displays data download (locations, sublocations, areas, employees, forms)
7. User redirects to main WeMine application
8. Restart prompt appears after first-time master data update

---

### TC-F0-002: Web App - Successful Login

**Preconditions:**

1. User has valid registered account and tenant
2. WeMineOffice web app URL is accessible
3. Internet connection is available

**Steps:**

1. Navigate to WeMineOffice URL
2. Enter valid username in the username field
3. Click "Sign In" button
4. Enter valid password in Microsoft login screen
5. Click "Sign In"

**Expected Results:**

1. User successfully authenticates
2. User redirects to WeMineOffice dashboard
3. Master data is loaded in background

---

### TC-F0-003: Invalid Username

**Preconditions:**

1. WeMine app is installed/accessible

**Steps:**

1. Open WeMine application
2. Enter invalid/non-existent username
3. Click "Sign In" button

**Expected Results:**

1. System shows error message indicating user not found
2. User remains on login screen
3. No redirect to Microsoft login occurs

---

### TC-F0-004: Invalid Password

**Preconditions:**

1. User has valid registered account
2. WeMine app is opened

**Steps:**

1. Enter valid username
2. Click "Sign In" button
3. On Microsoft login screen, enter incorrect password
4. Click "Sign In"

**Expected Results:**

1. Microsoft authentication fails
2. Error message displays indicating incorrect credentials
3. User remains on Microsoft login screen

---

### TC-F0-005: Login with No Internet Connection

**Preconditions:**

1. User has valid credentials
2. No internet connection available

**Steps:**

1. Open WeMine application
2. Enter valid username
3. Click "Sign In" button

**Expected Results:**

1. System shows connection error message
2. User is prompted to check internet connection
3. Login process does not proceed

---

### TC-F0-006: Login with Poor Internet Connection

**Preconditions:**

1. User has valid credentials
2. Poor/unstable internet connection

**Steps:**

1. Open WeMine application
2. Enter valid username and complete login
3. Observe master data download progress

**Expected Results:**

1. Login proceeds but may take longer
2. Progress bar shows slower download
3. System handles connection drops gracefully
4. Data syncs when connection stabilizes

---

### TC-F0-007: Subsequent Login (Not First Time)

**Preconditions:**

1. User has logged in before
2. Master data was previously downloaded

**Steps:**

1. Open WeMine application
2. Enter valid username
3. Complete Microsoft authentication

**Expected Results:**

1. Login successful
2. Master data updates in background if needed
3. No restart prompt appears
4. User goes directly to main app

---

## FLOW 1 - EQUIPMENT INSPECTION FORM

### TC-F1-001: Create Equipment Inspection Form with All Field Types

**Preconditions:**

1. User is logged into WeMineOffice web app
2. User has form builder permissions

**Steps:**

1. Navigate to Form Builder
2. Create new Equipment Inspection form
3. Add Input Text field
4. Add Input Date Picker field
5. Add Input Select field
6. Add Input Radio field with 4 options
7. Add Image Picker field
8. Save the form

**Expected Results:**

1. All field types are available and selectable
2. Form saves successfully
3. Form appears in Equipment Inspection forms list
4. Form is accessible on mobile app

---

### TC-F1-002: Create Form with Maximum Fields (50 Fields)

**Preconditions:**

1. User is logged into WeMineOffice
2. User has form builder permissions

**Steps:**

1. Navigate to Form Builder
2. Create new Equipment Inspection form
3. Add 50 fields (mix of all types)
4. Save the form

**Expected Results:**

1. System allows adding up to 50 fields
2. Form saves successfully
3. All 50 fields display correctly
4. Form is usable on mobile app

---

### TC-F1-003: Attempt to Add More Than 50 Fields

**Preconditions:**

1. User is logged into WeMineOffice
2. Form has 50 fields already

**Steps:**

1. Open form with 50 fields
2. Attempt to add 51st field

**Expected Results:**

1. System prevents adding more than 50 fields
2. Error message displays: "Maximum 50 fields allowed"
3. Existing 50 fields remain intact

---

### TC-F1-004: Submit Equipment Inspection Form (Mobile)

**Preconditions:**

1. User is logged into WeMine mobile app
2. Equipment Inspection form is available
3. User has submission permissions

**Steps:**

1. Navigate to "Equipment Inspection" feature
2. Click button to open submission form
3. Select Form Code from dropdown
4. Fill all dynamic form fields based on selected form
5. Submit the form

**Expected Results:**

1. Form loads with correct fields based on Form Code
2. All fields are properly validated
3. Form submission is successful
4. Success message displays
5. Submission appears in previous submissions list

---

### TC-F1-005: View Previous Equipment Inspection Submissions

**Preconditions:**

1. User is logged into WeMine mobile app
2. Previous submissions exist

**Steps:**

1. Navigate to "Equipment Inspection" feature
2. View list of previous submissions

**Expected Results:**

1. List displays all previous submissions
2. Each submission shows relevant details (date, form code, status)
3. User can tap to view submission details

---

### TC-F1-006: Submit Form with Missing Mandatory Fields

**Preconditions:**

1. User has Equipment Inspection form open
2. Form has mandatory fields

**Steps:**

1. Fill form partially, leaving mandatory fields empty
2. Attempt to submit

**Expected Results:**

1. System prevents submission
2. Error messages highlight missing mandatory fields
3. Form remains on screen with entered data preserved

---

### TC-F1-007: Submit Form Offline

**Preconditions:**

1. User has Equipment Inspection form open
2. No internet connection

**Steps:**

1. Fill all required form fields
2. Submit form while offline

**Expected Results:**

1. Form saves locally
2. Success message indicates form will sync when online
3. Form appears in pending submissions queue
4. Form syncs automatically when connection restored

---

### TC-F1-008: Image Upload in Equipment Form

**Preconditions:**

1. Form has Image Picker field
2. User has camera/photo permissions

**Steps:**

1. Open Equipment Inspection form
2. Click Image Picker field
3. Take photo or select from gallery
4. Complete and submit form

**Expected Results:**

1. Camera opens or gallery is accessible
2. Image is captured/selected successfully
3. Image preview displays in form
4. Image uploads with form submission
5. Image is viewable in submission details

---

### TC-F1-009: Dynamic Form Field Population Based on Form Code

**Preconditions:**

1. Multiple Equipment Inspection forms exist
2. Each form has different field configurations

**Steps:**

1. Open Equipment Inspection submission
2. Select Form Code A
3. Observe loaded fields
4. Fill in some form fields with test data
5. Change to Form Code B
6. Observe field changes and verify data from Form Code A is cleared

**Expected Results:**

1. Fields dynamically load based on selected Form Code
2. Field types, labels, and validations match form configuration
3. Previously entered data clears when form code changes
4. No errors during field switching

---

## FLOW 2 - SAFETY HAZARD REPORT

### TC-F2-001: Submit Safety Hazard Report Successfully

**Preconditions:**

1. User is logged into WeMine mobile app
2. Master data (locations, sublocations, areas, employees) is loaded
3. User has camera permissions

**Steps:**

1. Navigate to "Hazard" menu
2. Click button to create new hazard report
3. Select Location (mandatory)
4. Select Sublocation (mandatory)
5. Select Area (mandatory)
6. Enter Area Description (optional)
7. Capture/select Evidence image (mandatory)
8. Select PIC (pre-selected to reporter, but can change)
9. Submit the report

**Expected Results:**

1. All mandatory fields are filled
2. Hazard entry is created successfully
3. Follow-up task is automatically generated
4. PIC receives notification for follow-up task
5. All people in the selected area receive hazard notification
6. Report appears in hazard list

---

### TC-F2-002: View List of Hazard Reports

**Preconditions:**

1. User is logged into WeMine mobile app
2. Hazard reports exist in system

**Steps:**

1. Navigate to "Hazard" menu
2. View list of hazard reports

**Expected Results:**

1. List displays all hazard reports relevant to user
2. Each report shows key information (location, status, date)
3. User can tap to view report details

---

### TC-F2-003: Submit Hazard Report with Missing Mandatory Fields

**Preconditions:**

1. User has hazard report form open

**Steps:**

1. Leave one or more mandatory fields empty (Location, Sublocation, Area, Evidence, PIC)
2. Attempt to submit

**Expected Results:**

1. System prevents submission
2. Error messages indicate which mandatory fields are missing
3. Form data is preserved

---

### TC-F2-004: PIC Completes Follow-up Task

**Preconditions:**

1. Hazard report exists with follow-up task assigned
2. PIC user is logged in
3. PIC has received notification

**Steps:**

1. PIC opens notification for follow-up task
2. Navigate to the follow-up task
3. Capture/select Evidence image
4. Select Resolution Date and time (mandatory)
5. Add Co Observer(s) using (+) button
6. Submit follow-up task

**Expected Results:**

1. Follow-up task form opens correctly
2. Evidence image uploads successfully
3. Resolution DateTime is recorded
4. Multiple Co Observers can be added
5. Follow-up task submission is successful
6. Direct Supervisor of the area receives notification
7. Hazard status updates to resolved

---

### TC-F2-005: Add Multiple Co Observers

**Preconditions:**

1. PIC is completing follow-up task

**Steps:**

1. Open follow-up task form
2. Click (+) button to add Co Observer
3. Select first Co Observer
4. Click (+) button again
5. Select second Co Observer
6. Repeat for additional observers

**Expected Results:**

1. Each click of (+) adds new Co Observer select field
2. Each select field allows unique observer selection
3. All selected Co Observers are saved with submission

---

### TC-F2-006: Submit Hazard Report Offline

**Preconditions:**

1. User has hazard report form open
2. No internet connection available

**Steps:**

1. Fill all mandatory fields
2. Capture evidence image
3. Submit report while offline

**Expected Results:**

1. Report saves locally
2. Success message indicates pending sync
3. Report appears in pending queue
4. Report syncs when connection restored
5. Notifications sent after successful sync

---

### TC-F2-007: PIC Pre-selection Verification

**Preconditions:**

1. User is creating hazard report

**Steps:**

1. Open hazard report form
2. Observe PIC field

**Expected Results:**

1. PIC field is pre-selected with current user (reporter)
2. User can change PIC to someone else if needed
3. Selected PIC persists through form

---

### TC-F2-008: Verify Notifications - PIC Receives Follow-up Task Notification

**Preconditions:**

1. Hazard report is submitted
2. PIC is assigned

**Steps:**

1. Submit hazard report with PIC assigned
2. Check PIC user's notifications

**Expected Results:**

1. PIC receives push notification about follow-up task
2. Notification contains relevant hazard details
3. Notification links to follow-up task form

---

### TC-F2-009: Verify Notifications - Area Users Receive Hazard Notification

**Preconditions:**

1. Multiple users are assigned to selected area
2. Hazard report is submitted for that area

**Steps:**

1. Submit hazard report for specific area
2. Check notifications for all users in that area

**Expected Results:**

1. All users in the selected area receive hazard notification
2. Notification includes hazard details (location, area, description)
3. Users can view hazard report from notification

---

### TC-F2-010: Verify Notifications - Supervisor Receives Completion Notification

**Preconditions:**

1. Follow-up task is submitted by PIC
2. Area has assigned Direct Supervisor

**Steps:**

1. PIC completes and submits follow-up task
2. Check Direct Supervisor's notifications

**Expected Results:**

1. Direct Supervisor receives notification
2. Notification indicates follow-up task completion
3. Notification includes resolution details
4. Supervisor can review completed task

---

### TC-F2-011: Submit Follow-up Task with Missing Mandatory Fields

**Preconditions:**

1. PIC has follow-up task open

**Steps:**

1. Leave Resolution Date empty
2. Attempt to submit without required fields

**Expected Results:**

1. System prevents submission
2. Error message highlights missing mandatory fields
3. Form data is preserved

---

### TC-F2-012: Hazard Report with Optional Area Description

**Preconditions:**

1. User has hazard report form open

**Steps:**

1. Fill all mandatory fields
2. Leave Area Description empty
3. Submit report

**Expected Results:**

1. Report submits successfully without Area Description
2. Optional field does not block submission

---

### TC-F2-013: Image Capture Quality for Evidence

**Preconditions:**

1. User is capturing evidence for hazard report

**Steps:**

1. Open hazard report form
2. Click Evidence image picker
3. Capture image using camera
4. Observe image preview

**Expected Results:**

1. Image captures in sufficient quality
2. Image preview displays clearly
3. Image file size is optimized for upload
4. Image maintains quality after compression

---

### TC-F2-014: Cascading Selection - Location, Sublocation, Area

**Preconditions:**

1. Master data includes hierarchical location data

**Steps:**

1. Open hazard report form
2. Select Location
3. Observe Sublocation dropdown options
4. Select Sublocation
5. Observe Area dropdown options

**Expected Results:**

1. Sublocation dropdown shows only options under selected Location
2. Area dropdown shows only options under selected Sublocation
3. Changing Location resets Sublocation and Area
4. Dropdown hierarchy is maintained correctly

---

# Why i choose the test tools

Since WeMine project is a multi-platform Application

- Mobile App (WemMine) - likely iOS and Android (Native)
- Web App (WeMineOffice)
- Multiple Backend

## Web Automation

My Primary Choice: Playwright

### Why Playwright

1. It is support for modern web apps
2. As far that i know, it is built in network interception (so suitable for testing offline mode)
3. Possible to handle dynamic forms
4. Cross-browser testing
5. Better for testing progressive web apps with poor connectivity
6. API testing capabilities built in

## Mobile Testing (Native)

My Choice: Appium

### Why Appium

1. Cross-platform (iOS & Android)
2. As far that i know, it is possibe to test offline functionality
3. Large community, so we can ask or theres a lot of documents or references

## Backend Automation

My Choice: Playwright

## Why Playwright

1. we can do API testing in playwright, so it is more efficient if we use 1 tool for cross testing
