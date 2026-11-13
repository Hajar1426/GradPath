import { PUBLISH_STATUS } from './statusValues';

// area: A, B, C or D (the course area used in program rules and the schedule colors).
// Member 4 creates and edits offerings. Member 3 shows only PUBLISHED ones to students.
export const offerings = [
    { id: 'off-1', area: 'A', courseCode: 'ICS 553', title: 'Advanced Machine Learning', term: '261', section: '01', instructor: 'Dr. Yahya Osais', days: 'Sun Tue', time: '08:00-09:15', seats: 25, status: PUBLISH_STATUS.PUBLISHED, updatedAt: '2026-10-29T10:05:00' },
    { id: 'off-2', area: 'B', courseCode: 'ICS 571', title: 'Distributed Systems', term: '261', section: '01', instructor: 'Dr. Huda Alsaleh', days: 'Mon Wed', time: '10:00-11:15', seats: 20, status: PUBLISH_STATUS.PUBLISHED, updatedAt: '2026-10-29T10:05:00' },
    { id: 'off-3', area: 'C', courseCode: 'SWE 530', title: 'Software Architecture', term: '261', section: '01', instructor: 'Dr. Faisal Alzahrani', days: 'Sun Tue', time: '13:00-14:15', seats: 18, status: PUBLISH_STATUS.PUBLISHED, updatedAt: '2026-10-29T10:05:00' },
    { id: 'off-4', area: 'D', courseCode: 'SEC 520', title: 'Network Security', term: '261', section: '01', instructor: 'Dr. Reem Alotaibi', days: 'Mon Wed', time: '16:00-17:15', seats: 0, status: PUBLISH_STATUS.DRAFT, updatedAt: '2026-10-29T10:05:00' },
    { id: 'off-5', area: 'A', courseCode: 'ICS 610', title: 'Research Methods', term: '262', section: '01', instructor: 'Dr. Yahya Osais', days: 'Thu', time: '09:00-11:45', seats: 30, status: PUBLISH_STATUS.DRAFT, updatedAt: '2026-11-02T10:00:00' },
    { id: 'off-7', area: 'B', courseCode: 'ICS 574', title: 'Cloud Computing', term: '261', section: '01', instructor: 'Dr. Huda Alsaleh', days: 'Sun Tue', time: '08:30-09:45', seats: 20, status: PUBLISH_STATUS.DRAFT, updatedAt: '2026-11-03T10:00:00' },
    { id: 'off-6', area: 'A', courseCode: 'ICS 535', title: 'Design and Analysis of Algorithms', term: '252', section: '01', instructor: 'Dr. Huda Alsaleh', days: 'Sun Tue', time: '10:00-11:15', seats: 25, status: PUBLISH_STATUS.ARCHIVED, updatedAt: '2026-06-01T10:00:00' },
];
