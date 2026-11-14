# GradPath – Graduate Journey and Advising System

SWE363 Group 2 — a front-end prototype for planning and advising during a graduate student's journey.

GradPath helps students plan their degree, helps advisors follow their students, and gives the coordinator tools to manage offerings, capacity and announcements. 

## Getting started

You need Node.js (20.19 or newer, or 22.12 or newer) and Git.

```
git clone https://github.com/Hajar1426/GradPath.git
cd GradPath
npm install
npm run dev
```

Open the address that `npm run dev` prints (usually http://localhost:5173).

Other commands:

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the app with live reload |
| `npm run build` | Builds the production version into `dist/` |
| `npm run lint` | Checks the code style |

## Demo accounts

All demo accounts use the password **demo1234**.

| Role | Email | What it sees |
| --- | --- | --- |
| Student | student@kfupm.edu.sa | Student pages (Sara Alharbi, PhD, local, part-time) |
| Advisor | advisor@kfupm.edu.sa | Advisor pages |
| Coordinator | coordinator@kfupm.edu.sa | Coordinator pages |
| Dean | dean@kfupm.edu.sa | Coordinator pages, **view only** |
| Chairperson | chairperson@kfupm.edu.sa | Coordinator pages, **view only** |
| Admin | admin@kfupm.edu.sa | User accounts, audit log, security settings |

### Trying the sign-up flow

Students can create their own account, but only if their email is on the **approved student list** (in the real system this list comes from the coordinator's Excel upload). These demo students have not signed up yet:

| Email | Degree | Nationality | Study load |
| --- | --- | --- | --- |
| omar.alqahtani@kfupm.edu.sa | MS | Saudi Arabia | Part-time |
| aisha.khan@kfupm.edu.sa | PhD | Pakistan | Full-time |
| li.wei@kfupm.edu.sa | MS | China | Full-time |

Sign-up creates a **pending** account. The student then opens the activation link from their email. No administrator approval is needed. Advisors, coordinators, deans, chairpersons and admins are created by an administrator (Users → Add user).

## What is real and what is simulated

This is a prototype, so some things are simulated on purpose:

- **No server.** All data is saved in the browser's local storage (`gradpath:data` and `gradpath:session`). Use **Settings → Reset demo data** to start again.
- **No real emails.** Activation, password reset and notification emails are shown on screen as "Open … (demo)" links.
- **Passwords are stored as plain text in the browser.** This is only acceptable for a demo. A real system would store only secure hashes on a server.
- **Sign-in is simulated.** The real system is expected to use the university's single sign-on (SSO). The prototype uses email and password.
- **Planning only, no registration.** GradPath never registers anyone for a course. Students use *Add to Plan* and *Request Authorization*, and *Continue in University Portal* sends them to the university's registration portal, which stays the official place to register.
- **Advisor requests are out of scope.** A student contacts an advisor with the *Email advisor* button, which opens their email app.

## Rules built into the prototype

- **Roles:** student, advisor, coordinator, dean, chairperson and admin. Each role only sees its own pages.
- **View-only roles:** the dean and chairperson see everything the coordinator sees but cannot change anything. Pages use the `useReadOnly` hook and the `EditOnly` component, and the data store blocks changes as a backup.
- **Study load:** local students are part-time (plan at least 1 course per semester) and international students are full-time (plan at least 3). The rules are in `src/utils/studyRules.js`, and `useStudentInfo()` gives any page a student's degree and load.
- **Session timeout:** users are signed out after the number of idle minutes the admin sets in Security settings (30 by default).
- **Audit log:** account changes (created, activated, disabled, role changed, password reset and more) are recorded for the admin.

## How the code is organised

```
src/
├── assets/                                   Images
│   ├── hero.png
│   ├── react.svg
│   └── vite.svg
├── components/
│   ├── advising/                             Advisor profile pieces
│   │   └── TagInput.jsx
│   ├── common/                               Shared controls
│   │   ├── Alert.jsx
│   │   ├── BackLink.jsx
│   │   ├── Button.jsx
│   │   ├── ConfirmationDialog.jsx
│   │   ├── DataTable.jsx
│   │   ├── EditOnly.jsx                      Hides edit actions for view-only roles
│   │   ├── EmptyState.jsx
│   │   ├── ErrorState.jsx
│   │   ├── Input.jsx
│   │   ├── LoadingState.jsx
│   │   ├── Modal.jsx
│   │   ├── Pagination.jsx
│   │   ├── ReadOnlyBanner.jsx
│   │   ├── SearchBar.jsx
│   │   ├── Select.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── Tabs.jsx
│   │   ├── Textarea.jsx
│   │   └── Toast.jsx
│   ├── coordinator/                          Coordinator-only pieces (dialogs, charts, import tables, schedule)
│   │   ├── AnnouncementPreview.jsx
│   │   ├── AudienceSelector.jsx
│   │   ├── AuthorizationDecisionDialog.jsx
│   │   ├── AvailabilityBadge.jsx
│   │   ├── AvailabilityOverrideDialog.jsx
│   │   ├── CategoryChips.jsx
│   │   ├── Charts.jsx
│   │   ├── EditAdvisorCapacityDialog.jsx
│   │   ├── FileDropzone.jsx
│   │   ├── Icons.jsx
│   │   ├── ImportHistoryTable.jsx
│   │   ├── ImportPreviewTable.jsx
│   │   ├── ImportSummary.jsx
│   │   ├── OfferingWarnings.jsx
│   │   ├── ResourceActions.jsx
│   │   ├── StatCard.jsx
│   │   └── WeeklySchedule.jsx
│   ├── layout/                               App frame
│   │   ├── AppLayout.jsx
│   │   ├── NavIcon.jsx
│   │   ├── PageHeader.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── Sidebar.jsx
│   └── planning/                             Degree plan builder pieces
│       ├── CoursePicker.jsx
│       ├── PlanBoard.jsx
│       ├── PlanChecklist.jsx
│       ├── PlannedCourseCard.jsx
│       └── TermColumn.jsx
├── context/                                  Providers
│   ├── AuthContext.jsx
│   ├── contexts.js
│   ├── DataContext.jsx
│   └── ToastContext.jsx
├── data/                                     Demo data and the agreed status values
│   ├── academicCalendar.js
│   ├── advisors.js
│   ├── announcements.js
│   ├── annualReports.js
│   ├── attentionItems.js
│   ├── capacityOverrides.js
│   ├── courseAuthorizations.js
│   ├── courses.js
│   ├── degreePlans.js
│   ├── imports.js
│   ├── index.js
│   ├── notifications.js
│   ├── offerings.js
│   ├── programRules.js
│   ├── resources.js
│   ├── roster.js                             Approved student list
│   ├── statusValues.js                       Agreed status words
│   ├── students.js
│   └── users.js
├── hooks/                                    Custom hooks
│   ├── useAnnouncementCount.js
│   ├── useAuth.js
│   ├── useData.js
│   ├── useNotifications.js
│   ├── useReadOnly.js
│   ├── useSecuritySettings.js
│   ├── useSessionTimeout.js
│   ├── useStudentInfo.js
│   └── useToast.js
├── pages/
│   ├── admin/                                System Administrator pages
│   │   ├── AddUserPage.jsx
│   │   ├── AdminDashboardPage.jsx
│   │   ├── AuditLogPage.jsx
│   │   ├── SecuritySettingsPage.jsx
│   │   └── UserAccountsPage.jsx
│   ├── advisor/                              Advisor pages
│   │   ├── AdvisorAlertsPage.jsx
│   │   ├── AdvisorEditProfilePage.jsx
│   │   ├── AdvisorHomePage.jsx
│   │   ├── AdvisorReportReviewPage.jsx
│   │   ├── AdvisorReportsPage.jsx
│   │   ├── AdvisorStudentDetailPage.jsx
│   │   └── MyStudentsPage.jsx
│   ├── common/                               Pages for everyone
│   │   ├── ActivatePage.jsx
│   │   ├── AnnouncementsPage.jsx
│   │   ├── ForbiddenPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── LandingPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── NotificationsPage.jsx
│   │   ├── PlaceholderPage.jsx
│   │   ├── ResetPasswordPage.jsx
│   │   ├── SettingsPage.jsx
│   │   ├── SignInPage.jsx
│   │   └── SignUpPage.jsx
│   ├── coordinator/                          Coordinator pages
│   │   ├── AdvisorCapacityPage.jsx
│   │   ├── announcementActions.js
│   │   ├── AnnouncementEditorPage.jsx
│   │   ├── AnnouncementsManagePage.jsx
│   │   ├── CoordinatorDashboardPage.jsx
│   │   ├── CoursesSchedulePage.jsx
│   │   ├── ImportResultPage.jsx
│   │   ├── OfferingEditorPage.jsx
│   │   ├── OfferingsPanel.jsx
│   │   ├── RecordImportPage.jsx
│   │   ├── RequestsPanel.jsx
│   │   ├── ResourcesManagePage.jsx
│   │   ├── StatisticsPage.jsx
│   │   └── StudentListPage.jsx
│   └── student/                              Student pages
│       ├── AdvisorDirectoryPage.jsx
│       ├── AdvisorProfilePage.jsx
│       ├── CourseResourcesPage.jsx
│       └── DegreePlanBuilderPage.jsx
├── styles/                                   CSS, imported from index.css
│   ├── advisor.css
│   ├── controls.css
│   ├── coordinator.css
│   ├── landing.css
│   ├── layout.css
│   ├── notifications.css
│   ├── planning.css
│   ├── settings.css
│   └── variables.css
├── utils/                                    Small helpers
│   ├── activation.js
│   ├── advisorHelpers.js
│   ├── auditLabels.js
│   ├── checkConflicts.js
│   ├── checkPrerequisites.js
│   ├── computeAvailability.js
│   ├── coordinatorHelpers.js
│   ├── coordinatorReports.js
│   ├── downloadCsv.js
│   ├── downloadXlsx.js
│   ├── emailRules.js
│   ├── formatDate.js
│   ├── importRules.js
│   ├── matchesSearch.js
│   ├── offeringWarnings.js
│   ├── parseXlsx.js
│   ├── resourceFiles.js
│   ├── roles.js                              Roles and sidebar links
│   ├── schedule.js
│   ├── storage.js
│   ├── studyRules.js
│   ├── validatePlan.js
│   └── validateProgramRequirements.js
├── App.jsx                                   Providers and routes
├── index.css                                 Imports every CSS file
├── main.jsx                                  Starts the app
└── routes.jsx                                All routes and the page registry
```

### Adding a page

1. Create the page in the folder for your role, for example `src/pages/student/PlanPage.jsx`.
2. If it is in the sidebar, its path is already listed for your role in `src/utils/roles.js`. Register the page in the `PAGES` map in `src/routes.jsx`: `'/student/plan': PlanPage`.
3. If it is a details page that is not in the sidebar, add it to `EXTRA_ROUTES` instead.
4. Use the shared controls in `components/common`, and agree status words through `src/data/statusValues.js`.

New data collections are added in `src/data/index.js`. Read and write them with `useData()`.

## Working together

- Work on a **feature branch** created from `development`, for example `feature/plan-builder`.
- Open a **pull request into `development`**. One teammate must approve it before it is merged.
- `main` only receives tested work from `development`.
- Keep pull requests small and describe what changed and how to test it.

## Coordinator portal (Member 4)

Sign in as **coordinator@kfupm.edu.sa** to make changes. Sign in as **dean@kfupm.edu.sa** or **chairperson@kfupm.edu.sa** to see the same pages in view-only mode: every button that changes something is hidden. The pages follow the coordinator screens in the team's Figma file.

### Pages

| Sidebar link | Route | What the coordinator can do |
| --- | --- | --- |
| Home Page | `/coordinator` | Summary cards, quick actions, students needing attention (with *Email student*), latest announcements, Excel downloads and key dates. Each card shows its own error if its data cannot load (try `/coordinator?demoError=advisor`). |
| Statistics | `/coordinator/statistics` | Filter by term, program and study load. Charts for students by program, GradPath sign-up rate and advisor load. Attention table, exception report and *Export Report* (.xlsx). |
| Courses & Schedule | `/coordinator/offerings` | Three tabs. **Offerings**: create, edit, save as draft, publish, archive and restore, with warnings (0 seats, missing times, instructor clash, duplicates). **Authorization requests** (`?tab=requests`): approve or reject with a note; the student is notified. **Schedule** (`?tab=schedule`): weekly timetable coloured by course area, with a warning for time clashes. *Export Schedule* (.xlsx). |
| | `/coordinator/offerings/:id` | Offering editor (`/coordinator/offerings/new` for a new one). |
| CCM Faculty | `/coordinator/capacity` | Advisor cards with advisee slots. *Edit slots* sets each advisor's capacity. *Read More* shows details, where the coordinator can override availability with a reason or remove the override. All overrides are kept in the override history. |
| Students | `/coordinator/students` | The approved student list. Search, and filter by degree, study load, account, advisor and "not in latest sheet". Download as CSV. |
| Import | `/coordinator/import` | Import the approved student list or the course offerings from Excel: choose the kind, upload, check the preview (new, updated, duplicate, invalid), confirm. Import history and a result page (`/coordinator/import/result`). |
| Course Resources | `/coordinator/resources` | Upload a file or add a link, then publish or archive. Students see published resources at `/student/resources`. |
| Announcements | `/coordinator/announcements` | Write an announcement with a category (General, Deadline, Meeting, Policy) and an audience, preview it, publish (the audience gets a notification) or archive. Every role reads its own announcements at `/announcements`. |

### Rules

- **Advisor capacity.** Each advisor has their own number of advisee slots (`capacity` in `src/data/advisors.js`, 5 if missing). Only the coordinator can change it, and never below the advisor's current number of advisees.
- **Availability** is worked out in `src/utils/computeAvailability.js` from the share of slots used: under 75% is **Available**, 75% or more is **Limited**, and 100% is **Unavailable**. A coordinator override always wins until it is removed. The student advisor directory (Member 2) uses the same function, so both sides always show the same result.
- **Student import.** Rows are matched by email. A re-upload never resets whether a student has an account, and students missing from a new sheet are flagged, not deleted.
- **Authorizations.** A decision only records approval or rejection. It never registers the student or changes a seat.

### Try it

1. **Capacity:** open *CCM Faculty*. Dr. Huda Alsaleh has 4 advisees. Click *Edit slots* and change her capacity to 7: she turns from Limited to **Available** (4/7). Try 3: it is refused because she already has 4 advisees.
2. **Override:** click *Read More* on Dr. Yahya Osais, set *Unavailable* with a reason, then remove it. Both steps appear in the override history.
3. **Import:** open *Import*, keep *Approved student list*, download the sample file from the link on the page and upload it. The preview shows new, updated, duplicate and invalid rows. Confirm, then open *Students* to see the result. The offerings sample works the same way.
4. **Authorization:** in *Courses & Schedule → Authorization requests*, approve a request, then sign in as the student and open *Notifications*.
5. **Announcement:** publish one for students. Sign in as the student: the sidebar shows a number, which clears when *Announcements* is opened.
6. **View only:** sign in as the dean and open every coordinator page. Nothing can be changed.

### What is simulated in this part

- **Excel files** are read and written in the browser with the `xlsx` package. Nothing is uploaded to a server.
- **Uploaded resource files** are kept in the browser's local storage, so each file is limited to 1 MB. The demo files are in `public/resources/`, and the sample Excel files are in `public/samples/`.
- **The term key dates** on the Home Page are a fixed list in `CoordinatorDashboardPage.jsx`.

## Administrator portal and shared interface (Member 1)

Sign in as **admin@kfupm.edu.sa**. The sidebar of every role is built from the same layout, so the user name sits under the logo, the links have icons, **Sign out** is right under the last link, and **Notifications** and **Announcements** show a number when there is something new.

### Pages

| Sidebar link | Route | What the administrator can do |
| --- | --- | --- |
| Dashboard | `/admin` | Counts of all, active, pending and disabled accounts (each count opens Users with that filter), how many approved students have an account, and the latest audit events. |
| Users | `/admin/users` | Search and filter accounts by role and status. For each account: change role, disable or enable, send a password reset link, and resend the activation email. A "What each role can do" list helps choose the right role. |
| (Add user) | `/admin/users/new` | Create an account. Choose the role first. A student must be on the approved student list and their name comes from it. |
| Audit | `/admin/audit` | Who did what, to whom and when, in plain words. Events for the whole system show "Whole system". |
| Security | `/admin/security` | Set the idle session timeout (a whole number of minutes from 1 to 120). It is enforced for every signed-in user. |
| Notifications, Settings | `/notifications`, `/settings` | Shared by every role. Settings shows name, email and role as read-only, and lets the user change their password and notification preferences. |

### Rules

- Students create their own account only if their email is on the approved list (**Trying the sign-up flow** above). All other roles are created by the administrator.
- Sign in, sign up and forgot password all require an email ending in `@kfupm.edu.sa`.
- Disabled accounts cannot sign in. Their records and history are kept.
- Changes to accounts and security settings are written to the audit log (`addAuditEvent`, readable names in `src/utils/auditLabels.js`).

### Try it

- **Add user:** Users → Add user. Choose Student and type `omar.alqahtani@kfupm.edu.sa`: the name fills in from the approved list.
- **Reset link:** in Users, choose Send reset link, open the demo link, and set a new password.
- **Timeout:** in Security, set 1 minute, stay idle, and the next action returns to Sign in with a notice.
- **Audit:** do any of the actions above and open Audit.

### What is simulated in this part

- Activation and reset emails are shown on screen as demo links.
- Passwords are stored as plain text in the browser, only acceptable for a demo.
- Each browser has its own copy of the data. Use **Settings → Reset demo data** to start again.

## Team

| Member           | Area                                                                                                      |
|------------------|-----------------------------------------------------------------------------------------------------------|
| Hajar Alboali    | Foundation, shared interface, common pages, sign-in, settings, notifications and the administrator portal |
| Leen AlHelal     | Advisor profiles, advisor directory, advisor portal, annual reports and warning alerts                    |
| Zainab Aljarrash | Course offerings, degree plan builder, milestones and advisor plan review                                 |
| Maha AlSubaie    | Coordinator portal, capacity, Excel import, statistics, authorization review, announcements and resources |
