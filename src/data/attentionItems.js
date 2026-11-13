import { ALERT_STATUS } from './statusValues';

// Shared with Member 2: an unsatisfactory annual report evaluation adds one of these.
// Member 4 shows them on the coordinator dashboard and statistics page.
export const attentionItems = [
    { id: 'att-1', type: 'report_unsatisfactory', studentId: 'u-student-3', advisorId: 'adv-3', reportId: 'rep-9', status: ALERT_STATUS.OPEN, createdAt: '2026-10-30' },
    { id: 'att-2', type: 'report_unsatisfactory', studentId: 'u-student-7', advisorId: 'adv-2', reportId: 'rep-12', status: ALERT_STATUS.RESOLVED, createdAt: '2026-10-12', resolvedAt: '2026-10-20' },
];
