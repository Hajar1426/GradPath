import { PLAN_STATUS } from './statusValues';
import { PROGRAMS } from './programRules';

export const degreePlans = [
    {
        id: 'plan-1',
        userId: 'u-student-1',

        program: PROGRAMS.PHD_CS,
        majorArea: 'A',

        status: PLAN_STATUS.DRAFT,
        currentVersion: 1,

        terms: [
            // Historical coursework is entered by the student.
            // Only successfully completed courses should be added here.
            {
                term: '251',
                type: 'historical',
                courses: [
                    'ICS 553',
                    'ICS 531',
                    'ICS 570',
                ],
            },

            // Future coursework represents planning only.
            // Adding a course here does not register the student.
            {
                term: '261',
                type: 'planned',
                courses: [
                    'ICS 557',
                    'ICS 611',
                ],
            },
            {
                term: '262',
                type: 'planned',
                courses: [],
            },
            {
                term: '271',
                type: 'planned',
                courses: [],
            },
        ],

        updatedAt: '2026-11-14T00:00:00',
    },
];