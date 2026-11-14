export const PROGRAMS = {
    MS_CS: 'ms_computer_science',
    PHD_CS: 'phd_computer_science',
    MS_SECURITY: 'ms_security',
};

export const programRules = {
    // =========================================================
    // MS COMPUTER SCIENCE
    // =========================================================
    [PROGRAMS.MS_CS]: {
        name: 'MS Computer Science',

        allowedMajorAreas: ['A', 'B'],

        coreCourses: [
            'ICS 500',
            'ICS 535',
            'ICS 553',
        ],

        majorAreaElectives: {
            count: 2,
        },

        generalElectives: {
            count: 3,

            // At least one general elective must be outside
            // Areas A and B.
            minOutsideAB: 1,

            // At least one general elective must specifically
            // come from Area C or Area D.
            minFromCD: 1,
        },

        seminar: 'ICS 599',
        thesis: 'ICS 610',
    },

    // =========================================================
    // PhD COMPUTER SCIENCE
    // =========================================================
    [PROGRAMS.PHD_CS]: {
        name: 'PhD Computer Science',

        allowedMajorAreas: ['A', 'B', 'C', 'D'],

        majorAreaCourses: {
            count: 3,

            // At least one of the three major-area courses
            // must be a qualifying 600-level course.
            min600Level: 1,
        },

        breadthCourses: {
            count: 3,

            // Breadth courses must cover at least two
            // different areas other than the major area.
            minDifferentAreas: 2,
            excludeMajorArea: true,
        },

        csElectives: {
            count: 1,
            allowedAreas: ['A', 'B', 'C', 'D'],
        },

        generalElectives: {
            count: 3,

            // At least two general electives must be outside
            // the Area A-D course lists.
            minOutsideAreas: 2,
        },

        seminar: 'ICS 699',
        preDissertation: 'ICS 711',
        dissertation: 'ICS 712',
    },

    // =========================================================
    // MS SECURITY & INFORMATION ASSURANCE
    // =========================================================
    [PROGRAMS.MS_SECURITY]: {
        name: 'MS Security & Information Assurance',

        coreCourses: [
            'ICS 555',
            'SEC 511',
            'SEC 521',
        ],

        securityElectives: {
            count: 3,
        },

        generalElectives: {
            count: 2,

            // The coordinator template recommends ICS and SWE
            // graduate courses at the 500 and 600 levels.
            recommendedPrefixes: [
                'ICS 5',
                'ICS 6',
                'SWE 5',
                'SWE 6',
            ],

            // Other individually recommended courses are marked
            // with "security_recommended_elective" in courses.js.
            useRecommendedCategory: true,
        },

        seminar: 'SEC 599',
        thesis: 'SEC 610',
    },
};