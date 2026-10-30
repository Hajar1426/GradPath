import { ROLES } from '../data/statusValues';

export const HOME_BY_ROLE = {
    [ROLES.STUDENT]: '/student',
    [ROLES.ADVISOR]: '/advisor',
    [ROLES.COORDINATOR]: '/coordinator',
    [ROLES.ADMIN]: '/admin',
};

export const NAV_BY_ROLE = {
    [ROLES.STUDENT]: [
        { to: '/student', label: 'nav.dashboard' },
        { to: '/student/advisors', label: 'nav.advisors' },
        { to: '/student/plan', label: 'nav.plan' },
        { to: '/student/reports', label: 'nav.reports' },
        { to: '/announcements', label: 'nav.announcements' },
        { to: '/settings', label: 'nav.settings' },
    ],
    [ROLES.ADVISOR]: [
        { to: '/advisor', label: 'nav.dashboard' },
        { to: '/advisor/students', label: 'nav.students' },
        { to: '/advisor/reports', label: 'nav.reports' },
        { to: '/advisor/alerts', label: 'nav.alerts' },
        { to: '/announcements', label: 'nav.announcements' },
        { to: '/settings', label: 'nav.settings' },
    ],
    [ROLES.COORDINATOR]: [
        { to: '/coordinator', label: 'nav.dashboard' },
        { to: '/coordinator/capacity', label: 'nav.capacity' },
        { to: '/coordinator/import', label: 'nav.import' },
        { to: '/coordinator/statistics', label: 'nav.statistics' },
        { to: '/coordinator/announcements', label: 'nav.announcements' },
        { to: '/settings', label: 'nav.settings' },
    ],
    [ROLES.ADMIN]: [
        { to: '/admin', label: 'nav.dashboard' },
        { to: '/admin/users', label: 'nav.users' },
        { to: '/admin/audit', label: 'nav.audit' },
        { to: '/admin/security', label: 'nav.security' },
        { to: '/settings', label: 'nav.settings' },
    ],
};
export function labelOf(key) {
    const word = key.split('.').pop();
    return word.charAt(0).toUpperCase() + word.slice(1);
}