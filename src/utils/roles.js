import { ROLES } from '../data/statusValues';

// Roles that have their own set of pages.
export const BASE_ROLES = [ROLES.STUDENT, ROLES.ADVISOR, ROLES.COORDINATOR, ROLES.ADMIN];

// Roles that see everything the coordinator sees, but cannot change anything.
export const VIEW_ONLY_ROLES = [ROLES.DEAN, ROLES.CHAIRPERSON];

// Who may open each group of pages.
export const ROLES_WITH_ACCESS = {
    [ROLES.STUDENT]: [ROLES.STUDENT],
    [ROLES.ADVISOR]: [ROLES.ADVISOR],
    [ROLES.COORDINATOR]: [ROLES.COORDINATOR, ...VIEW_ONLY_ROLES],
    [ROLES.ADMIN]: [ROLES.ADMIN],
};

export const HOME_BY_ROLE = {
    [ROLES.STUDENT]: '/student',
    [ROLES.ADVISOR]: '/advisor',
    [ROLES.COORDINATOR]: '/coordinator',
    [ROLES.ADMIN]: '/admin',
    [ROLES.DEAN]: '/coordinator',
    [ROLES.CHAIRPERSON]: '/coordinator',
};

const COORDINATOR_NAV = [
    { to: '/coordinator', label: 'nav.dashboard' },
    { to: '/coordinator/capacity', label: 'nav.capacity' },
    { to: '/coordinator/import', label: 'nav.import' },
    { to: '/coordinator/statistics', label: 'nav.statistics' },
    { to: '/coordinator/announcements', label: 'nav.announcements' },
    { to: '/notifications', label: 'nav.notifications' },
    { to: '/settings', label: 'nav.settings' },
];

export const NAV_BY_ROLE = {
    [ROLES.STUDENT]: [
        { to: '/student', label: 'nav.dashboard' },
        { to: '/student/advisors', label: 'nav.advisors' },
        { to: '/student/plan', label: 'nav.plan' },
        { to: '/student/reports', label: 'nav.reports' },
        { to: '/student/profile', label: 'nav.profile', hidden: true },
        { to: '/announcements', label: 'nav.announcements' },
        { to: '/notifications', label: 'nav.notifications' },
        { to: '/settings', label: 'nav.settings' },
    ],
    [ROLES.ADVISOR]: [
        { to: '/advisor', label: 'nav.dashboard' },
        { to: '/advisor/students', label: 'nav.students' },
        { to: '/advisor/reports', label: 'nav.reports' },
        { to: '/advisor/alerts', label: 'nav.alerts' },
        { to: '/advisor/profile', label: 'nav.profile', hidden: true },
        { to: '/announcements', label: 'nav.announcements' },
        { to: '/notifications', label: 'nav.notifications' },
        { to: '/settings', label: 'nav.settings' },
    ],
    [ROLES.COORDINATOR]: COORDINATOR_NAV,
    [ROLES.DEAN]: COORDINATOR_NAV,
    [ROLES.CHAIRPERSON]: COORDINATOR_NAV,
    [ROLES.ADMIN]: [
        { to: '/admin', label: 'nav.dashboard' },
        { to: '/admin/users', label: 'nav.users' },
        { to: '/admin/roles', label: 'nav.roles' },
        { to: '/admin/audit', label: 'nav.audit' },
        { to: '/admin/security', label: 'nav.security' },
        { to: '/notifications', label: 'nav.notifications' },
        { to: '/settings', label: 'nav.settings' },
    ],
};

export function labelOf(key) {
    const word = key.split('.').pop();
    return word.charAt(0).toUpperCase() + word.slice(1);
}