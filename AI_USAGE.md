# AI Usage Declaration – SWE 363 Term Project

## Part A – Team Information

| Field | Value |
|---|---|
| Team numbers | Group 2 |
| Section | F12 |
| Project title | Grad Path |
| Phase | 4 |
| Submission date | 14 November 2026 |

---

## Part B – Individual Declarations

### Phase 4

#### Member: Maha Alsubaie – 202340830 – Team Member

**Tools and models:** Claude (`claude-opus-5-5`), claude.ai.

**Purposes:**

- Used Claude to generate an initial version of the Member 4 pages based on the team guide and existing codebase. I then reviewed the code, compared the pages with the Figma designs, made the necessary changes, organized the work into branches and pull requests, and tested the results.
- Independently developed the configurable advisor capacity feature (Edit slots, PR #40) and the “Email student” button, using Claude mainly for guidance and code review.
- Used Claude to help implement the student program importing feature based on a requirement identified during my interview with the coordinator. I reviewed the implementation, integrated it into the project, and tested it.
- Handled the integration and refinement of my assigned features, including reviewing the code, fixing issues, checking compatibility with the existing project, and verifying the results in the browser.
- Also used Claude for technical guidance on Git, GitHub, and VS Code, and for preparing documentation, including the Member 4 README section and AI_USAGE.md.

**Parts of the deliverable affected:** Coordinator pages (`src/pages/coordinator/`), shared utilities (`computeAvailability.js`, `importRules.js`, `coordinatorReports.js`), demo data files, `NavIcon.jsx`, sample Excel files, the Member 4 section of the README, and `AI_USAGE.md`.

#### Member: Zainab Aljarrash – 202347030 – Team Member

**Option 1 – I used AI tools in this milestone.**

**Tools and models:** ChatGPT (GPT-5.6 Sol).

**Purposes:** Used ChatGPT to help understand my assigned requirements, generate and explain React code, implement and refine the degree-plan and course-planning features, debug errors, resolve Git merge conflicts, and align my work with the existing project and Figma design. I reviewed, adjusted, and tested the suggested code in the browser.

**Parts of the deliverable affected:** Degree-plan builder, course planning, planning components and styles, academic-rule and validation logic, related demo data, shared integration files, and Git/GitHub integration.

#### Member: Hajar alboali – 202333510 – Team Member

**Option 1 – I used AI tools in this milestone.**

**Tools and models:** Claude.

**Purposes:** I used Claude to generate and explain React code step by step, to explain git, GitHub and IntelliJ steps, to help write the README and the team guide. I applied the code in my own project, adjusted it to our team’s decisions, and tested it in the browser as each role.

**Parts of the deliverable affected:** Shared interface and sidebar; sign in, sign up, forgot and reset password; settings; notifications; the System Administrator pages (user accounts, audit log, security settings, dashboard); the repository workflow; the README and team guide; the requirements document.

**Usage Log IDs (Part C):** C01, C02, C03.

**Note:** I couldn’t restore all the conversations but I restored as much as I can.

#### Member: Leen Alhelal – 202360550 – Team Member

**Option 1 – I used AI tools in this milestone.**

**Tools and models:** Claude.

**Purpose:** Used Claude to generate code with step-by-step explanations, and made necessary adjustments where necessary.

**Parts of the deliverable affected:** Advisor, coordinator, and student views.

**User Log IDs:** C10.

---

## Part C – AI Usage Log

| ID | Member | Tool (model) | Date(s) | Purpose | Part of deliverable affected | What you changed and how you verified it | Evidence file |
|---|---|---|---|---|---|---|---|
| C01 | Hajar Alboali | Claude | 30 Oct | Explain git, GitHub and IntelliJ steps | Repository, branches, pull requests | I followed the steps myself and confirmed the result on GitHub. | Attach complete, unedited C01 Claude conversation |
| C02 | Hajar Alboali | Claude | 7 Nov | Write the README and the team guide PDF | Documentation | I read both, corrected anything that didn’t match our project, and checked the commands in the README on my machine. | Attach complete, unedited C02 Claude conversation |
| C03 | Hajar Alboali | Claude | 30 Oct – 10 Nov | Generate and explain React code, step by step | Shared interface and sidebar; sign in, sign up, forgot and reset password; settings; notifications; admin pages (users, audit log, security settings, dashboard) | I applied the code in my own project, edited it to our decisions (roles, student list rule, layout) and fixed errors. I ran each page in the browser as every role and checked the results. Code went through pull requests that had to be approved. | Attach complete, unedited C03 Claude conversation |
| C04 | Maha | Claude | 13 Nov | Generate the initial Member 4 pages. Review the capacity feature. Provide Git, GitHub, and VS Code guidance. Draft team messages and README documentation. | Member 4 coordinator pages, shared utilities, demo data, sample Excel files, README | Compared the generated pages with Figma, modified the code, organized it into branches and commits, fixed issues, and tested the features in the browser. | Attach complete, unedited C04 Claude conversation |
| C05 | Maha | Claude | 14 Nov | Code review and guidance for the Email Student button. Assistance with student program importing | `coordinatorReports.js`, `CoordinatorDashboardPage.jsx`, `importRules.js`, `roster.js`, `RecordImportPage.jsx`, sample Excel file | Independently implemented the e-mail Student button, including missing e-mail handling and accessibility labels. Reviewed and integrated the program import code. Verified the e-mail link, static chart, and Excel import preview using demo data. | Attach complete, unedited C05 Claude conversation |
| C06 | Maha | Claude | 14 Nov | Organize the AI declaration and supporting evidence. | AI declaration and AI_USAGE.md (if applicable). | Reviewed the evidence against previous conversations and edited the declaration to accurately reflect my contribution and AI usage. | Attach complete, unedited C06 Claude conversation |
| A1 | Maha | Claude | 14 Nov | AI-generated initial code based on the team guide and existing codebase. | `src/pages/coordinator/` and related components and utilities. | Compared the generated pages with Figma, modified the UI and code, organized the implementation into branches and pull requests, and tested the features. | Attach complete, unedited A1 Claude conversation |
| C10 | Leen Alhelal | Claude | Nov 14 | Generating the main pages for the advisor but also making the necessary connections between all the pages. | Advisor, student, and coordinator pages. | I made Claude give me code files but also explain each line step by step. I changed some features that were not available on our Figma wireframe. | C10 file |
| C11 | Zainab Aljarrash | ChatGPT (GPT-5.6 Sol) | Nov 14 | Understand requirements; generate, explain, refine, and debug React code; improve UI; test functionality; and resolve Git/merge issues. | Degree-plan and course-planning features, planning components/styles, validation and demo data, shared integration files, and Git/GitHub integration. | Reviewed and adjusted the suggested code to match our requirements, existing project structure, and Figma, then tested the functionality in the browser and verified the merged repository. | Complete, unedited C11 ChatGPT conversation |

---

## Team Statement

We confirm that this declaration is complete and accurate. We take full responsibility for our submission, including AI-assisted parts, and understand that AI errors are not an excuse. We understand that a missing declaration results in a grade of zero, and that a false or incomplete declaration is an academic integrity violation.

| Member name | KFUPM ID | Signature | Date |
|---|---|---|---|
| Zainab Aljarrash | 202347030 | ZainabJ | 14 Nov |
| Hajar Alboali | 202333510 | Hajar | 14 Nov |
| Leen Alhelal | 202360550 | LeenH | 14 Nov |
| Maha Alsubaie | 202340830 | Maha | 14 Nov |
