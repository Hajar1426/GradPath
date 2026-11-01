import { users } from './users';
import { notifications } from './notifications';
export function getInitialData() {
    return {
        users: users.map((u) => ({ ...u })),
        notifications: notifications.map((n) => ({ ...n })),
        auditEvents: [],
    };
}
