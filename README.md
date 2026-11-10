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
  components/
    common/      Shared controls (Button, Input, Select, DataTable, Modal, Toast, ...)
    layout/      Sidebar, page header, protected route, app layout
  context/       Data, authentication and toast providers
  data/          Demo data and the agreed status values (statusValues.js)
  hooks/         useData, useAuth, useToast, useNotifications, useStudentInfo, useReadOnly, ...
  pages/
    common/      Landing, sign in, sign up, notifications, settings, ...
    admin/       Admin pages
    student/ advisor/ coordinator/   One folder per member's pages
  styles/        CSS files, imported from index.css
  utils/         Small helpers (roles and navigation, study rules, email rules, search, dates)
  routes.jsx     All routes, plus the page registry
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

## Team

| Member | Area                                                                                                      |
|--------|-----------------------------------------------------------------------------------------------------------|
| Hajar Alboali | Foundation, shared interface, common pages, sign-in, settings, notifications and the administrator portal |
| Leen AlHelal | Advisor profiles, advisor directory, advisor portal, annual reports and warning alerts                    |
| Zainab Aljarrash | Course offerings, degree plan builder, milestones and advisor plan review                                 |
| Maha AlSubaie | Coordinator portal, capacity, Excel import, statistics, authorization review, announcements and resources |

