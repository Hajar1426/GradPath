import { users } from './users';
import { notifications } from './notifications';
import { studentRoster } from './roster';
export function getInitialData() {
    return {
        users: users.map((u) => ({ ...u })),
        notifications: notifications.map((n) => ({ ...n })),
        studentRoster,
        auditEvents: [],
        announcements: [
            { id: 'a-test', title: 'Term 261 offerings published', status: 'published', publishedAt: '2026-11-01T10:00:00' },
            { id: 'b-test', title: 'Test', status: 'published', publishedAt: '2026-11-10T10:00:00', audience: ['student', 'advisor'] },
        ],
    };
}
