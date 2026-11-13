import { ROLES } from '../data/statusValues';
import { DEGREE_LABEL, STUDY_LOAD_LABEL } from './studyRules';

export const DEGREE_OPTIONS = [
    { value: 'all', label: 'All degrees' },
    ...Object.entries(DEGREE_LABEL).map(([value, label]) => ({ value, label })),
];

export const STUDY_LOAD_OPTIONS = [
    { value: 'all', label: 'All study loads' },
    ...Object.entries(STUDY_LOAD_LABEL).map(([value, label]) => ({ value, label })),
];

// Name of a user id, falling back to the roster, then to the id itself.
export function nameOfUser(data, userId) {
    return (data.users ?? []).find((u) => u.id === userId)?.name ?? 'Student ' + String(userId).replace(/^u-student-/, '#');
}

// Dean and chairperson read what is sent to the coordinator.
export function audienceRole(role) {
    return role === ROLES.DEAN || role === ROLES.CHAIRPERSON ? ROLES.COORDINATOR : role;
}

export const AUDIENCE_OPTIONS = [
    { value: ROLES.STUDENT, label: 'Students' },
    { value: ROLES.ADVISOR, label: 'Advisors' },
    { value: ROLES.COORDINATOR, label: 'Coordinator, dean and chairperson' },
];

export function audienceText(audience = []) {
    const labels = { [ROLES.STUDENT]: 'Students', [ROLES.ADVISOR]: 'Advisors', [ROLES.COORDINATOR]: 'Coordinators' };
    return audience.map((a) => labels[a] ?? a).join(', ') || 'Nobody';
}

export function newId(prefix) {
    return `${prefix}-${Date.now()}`;
}
