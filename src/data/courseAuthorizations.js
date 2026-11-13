import { AUTHORIZATION_STATUS } from './statusValues';

// TEMPORARY demo data (Member 3 creates these from the offerings page, Member 4 decides them).
export const courseAuthorizations = [
    { id: 'ca-1', studentId: 'u-student-1', courseCode: 'ICS 571', term: '261', reason: 'I need distributed systems for my thesis topic and have taken the undergraduate prerequisite.', status: AUTHORIZATION_STATUS.PENDING, requestedAt: '2026-11-08T10:00:00', decidedAt: null, note: '' },
    { id: 'ca-2', studentId: 'u-student-1', courseCode: 'SWE 530', term: '261', reason: 'Elective from another area, recommended by my advisor.', status: AUTHORIZATION_STATUS.PENDING, requestedAt: '2026-11-10T14:20:00', decidedAt: null, note: '' },
    { id: 'ca-3', studentId: 'u-student-1', courseCode: 'ICS 553', term: '252', reason: 'Section was full.', status: AUTHORIZATION_STATUS.APPROVED, requestedAt: '2026-02-01T09:00:00', decidedAt: '2026-02-03T11:00:00', note: 'Approved. Continue in the university portal.', decidedBy: 'u-coord-1' },
];
