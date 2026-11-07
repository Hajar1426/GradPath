import { users } from './users';
import { notifications } from './notifications';
export function getInitialData() {
    return {
        users: users.map((u) => ({ ...u })),
        notifications: notifications.map((n) => ({ ...n })),
        auditEvents: [],
        announcements: [
            { id: 'a-test', title: 'Term 261 offerings published', status: 'published', publishedAt: '2026-11-01T10:00:00' },
        ],
    };
}
