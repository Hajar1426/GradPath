// TEMPORARY demo data so the capacity page has something to show.
// Member 2 owns this list. When Member 2's advisors.js is merged, keep theirs and make sure each
// advisor has `coordinatorOverride` (null or { value, reason, by, at }), which Member 4 writes.
export const advisors = [
    { id: 'adv-1', office: '22-X02', userId: 'u-advisor-1', name: 'Dr. Yahya Osais', email: 'advisor@kfupm.edu.sa', department: 'ICS', researchAreas: ['Machine learning'], coordinatorOverride: null },
    { id: 'adv-2', office: '22-X10', userId: null, name: 'Dr. Huda Alsaleh', email: 'huda.alsaleh@kfupm.edu.sa', department: 'ICS', researchAreas: ['Distributed systems'], coordinatorOverride: null },
    { id: 'adv-3', office: '24-105', userId: null, name: 'Dr. Faisal Alzahrani', email: 'faisal.alzahrani@kfupm.edu.sa', department: 'SWE', researchAreas: ['Software architecture'], coordinatorOverride: null },
    { id: 'adv-4', office: '22-X15', userId: null, name: 'Dr. Reem Alotaibi', email: 'reem.alotaibi@kfupm.edu.sa', department: 'ICS', researchAreas: ['Security'], coordinatorOverride: { value: 'unavailable', reason: 'On sabbatical leave for Term 261.', by: 'u-coord-1', at: '2026-10-15T09:00:00' } },
];
