import { users } from './users';

export function getInitialData() {
    return {
        users: users.map((u) => ({ ...u })),
        notifications: [],
        auditEvents: [],
    };
}
