import { ALERT_STATUS } from '../data/statusValues';

// Small helpers shared by the advisor pages (Member 2).

// The term the advisor pages work with. Change this when a new term starts.
export const CURRENT_TERM = '261';

// Where "View plan" goes. Zainab (Member 3) owns plan review, so this is the only line to change
// once her page is ready.
export function planReviewPath(studentUserId) {
    return `/advisor/students/${studentUserId}/plan`;
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