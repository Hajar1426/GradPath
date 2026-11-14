import { ALERT_STATUS } from '../data/statusValues';

// Small helpers shared by the advisor pages (Member 2).

// The term the advisor pages work with. Change this when a new term starts.
export const CURRENT_TERM = '261';

// The academic year of the current annual progress report.
export const CURRENT_ACADEMIC_YEAR = '2025-2026';

// The annual report questions, in order. The student answers them and the advisor reads them.
// required: the student must answer before submitting.
export const REPORT_QUESTIONS = [
    { key: 'progress', label: 'Research progress this year', required: true, hint: 'What did you work on and finish this year?' },
    { key: 'coursesCompleted', label: 'Courses completed', required: true, hint: 'Course codes, for example ICS 553, ICS 531.' },
    { key: 'publications', label: 'Publications and presentations', required: false, hint: 'Papers submitted or published, talks or posters. Write "None" if none.' },
    { key: 'challenges', label: 'Challenges', required: false, hint: 'Anything that slowed you down that your advisor should know about.' },
    { key: 'nextSteps', label: 'Plans for next year', required: true, hint: 'Your goals and milestones for the coming year.' },
];

// Where "View plan" goes: Member 3's plan review page, which is opened by the plan's id.
export function planReviewPath(plan) {
    return `/advisor/plans/${plan.id}`;
}

const list = (value) => (Array.isArray(value) ? value : []);

// The advisor profile of the signed-in user, or undefined.
export function findMyAdvisor(data, user) {
    return list(data.advisors).find((a) => a.userId === user?.id);
}

// The student's degree plan from Member 3's degreePlans.js, or undefined if they have none yet.
export function planOf(data, studentUserId) {
    return list(data.degreePlans).find((p) => p.userId === studentUserId);
}

// Courses the student has planned for one term (an empty list if none).
export function plannedCourses(plan, term) {
    return plan?.terms?.find((t) => t.term === term)?.courses ?? [];
}

// Warning alerts about this student that are not resolved yet.
export function openAlertsFor(data, studentUserId) {
    return list(data.attentionItems).filter((a) => a.studentId === studentUserId && a.status !== ALERT_STATUS.RESOLVED);
}
// Total credits of a list of course codes, using the course catalog. Unknown codes count as 0.
export function creditsOf(codes, catalog) {
    return codes.reduce((sum, code) => sum + (catalog.find((c) => c.code === code)?.credits ?? 0), 0);
}

// Course codes the student has completed (the "historical" terms of their plan).
export function completedCourses(plan) {
    return (plan?.terms ?? []).filter((t) => t.type === 'historical').flatMap((t) => t.courses);
}