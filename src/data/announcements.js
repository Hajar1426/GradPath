import { PUBLISH_STATUS, ROLES } from './statusValues';

// Category tag shown on the announcement (Figma: Deadline, Meeting, Policy).
export const ANNOUNCEMENT_CATEGORIES = [
    { value: 'general', label: 'General' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'policy', label: 'Policy' },
];

// Owned by Member 4. audience is a list of role words. Dean and chairperson read 'coordinator' announcements.
export const announcements = [
    {
        id: 'ann-1',
        title: 'Term 261 offerings published',
        category: 'general',
        body: 'The graduate course offerings for Term 261 are now published. Add the courses you intend to take to your plan, then continue in the university portal to register.',
        audience: [ROLES.STUDENT, ROLES.ADVISOR],
        status: PUBLISH_STATUS.PUBLISHED,
        createdAt: '2026-11-01T09:30:00',
        publishedAt: '2026-11-01T10:00:00',
    },
    {
        id: 'ann-2',
        title: 'Annual progress reports open',
        category: 'deadline',
        body: 'Annual progress reports for 2026 are open. Students submit by 30 November. Advisors evaluate submitted reports by 15 December.',
        audience: [ROLES.STUDENT, ROLES.ADVISOR],
        status: PUBLISH_STATUS.PUBLISHED,
        createdAt: '2026-10-20T08:00:00',
        publishedAt: '2026-10-20T08:00:00',
    },
    {
        id: 'ann-3',
        title: 'Advisor capacity review meeting',
        category: 'meeting',
        body: 'The department will review advisor capacity for next term on 25 November. Please send any capacity changes to the coordinator before then.',
        audience: [ROLES.ADVISOR, ROLES.COORDINATOR],
        status: PUBLISH_STATUS.DRAFT,
        createdAt: '2026-11-10T12:00:00',
        publishedAt: null,
    },
    {
        id: 'ann-4',
        title: 'Updated credit transfer policy',
        category: 'policy',
        body: 'The rules for transferring graduate credits from other universities were updated. Read the new policy in Course Resources before you plan to transfer a course.',
        audience: [ROLES.STUDENT, ROLES.ADVISOR, ROLES.COORDINATOR],
        status: PUBLISH_STATUS.PUBLISHED,
        createdAt: '2026-10-05T09:00:00',
        publishedAt: '2026-10-05T09:00:00',
    },
];
