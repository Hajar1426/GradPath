import { PROGRAMS, programRules } from '../data/programRules';

function findCourse(courses, courseCode) {
    return courses.find((course) => course.code === courseCode);
}

function getUniqueCourseCodes(terms) {
    return [
        ...new Set(
            terms.flatMap((term) => term.courses ?? [])
        ),
    ];
}

function getCourseLevel(courseCode) {
    const match = courseCode.match(/\b(\d{3})\b/);

    if (!match) {
        return null;
    }

    return Math.floor(Number(match[1]) / 100) * 100;
}

function calculateCredits(courseList) {
    return courseList.reduce(
        (total, course) => total + (course.credits ?? 0),
        0
    );
}


function makeRequirement({
    id,
    group,
    label,
    met,
    current,
    required,
    courses,
}) {
    return {
        id,
        group,
        label,
        met,
        type: 'requirement',
        ...(current !== undefined && { current }),
        ...(required !== undefined && { required }),
        ...(courses !== undefined && { courses }),
    };
}

// =========================================================
// MS COMPUTER SCIENCE
// =========================================================

function validateMSCS(majorArea, selectedCourses, courseCodes) {
    const rule = programRules[PROGRAMS.MS_CS];
    const results = [];

    rule.coreCourses.forEach((coreCode) => {
        results.push(
            makeRequirement({
                id: `core-${coreCode}`,
                group: 'Core Courses',
                label: coreCode,
                met: courseCodes.includes(coreCode),
            })
        );
    });

    const excludedCodes = new Set([
        ...rule.coreCourses,
        rule.seminar,
        rule.thesis,
    ]);

    const electiveCandidates = selectedCourses.filter(
        (course) => !excludedCodes.has(course.code)
    );

    const majorElectives = electiveCandidates
        .filter((course) => course.area === majorArea)
        .slice(0, rule.majorAreaElectives.count);

    results.push(
        makeRequirement({
            id: 'major-area-electives',
            group: 'Major Area',
            label:
                `${rule.majorAreaElectives.count} electives ` +
                `from Area ${majorArea}`,
            met:
                majorElectives.length >=
                rule.majorAreaElectives.count,
            current: majorElectives.length,
            required: rule.majorAreaElectives.count,
            courses: majorElectives.map((course) => course.code),
        })
    );

    const usedMajorCodes = new Set(
        majorElectives.map((course) => course.code)
    );

    const generalElectives = electiveCandidates
        .filter((course) => !usedMajorCodes.has(course.code))
        .slice(0, rule.generalElectives.count);

    results.push(
        makeRequirement({
            id: 'general-electives',
            group: 'General Electives',
            label: `${rule.generalElectives.count} general electives`,
            met:
                generalElectives.length >=
                rule.generalElectives.count,
            current: generalElectives.length,
            required: rule.generalElectives.count,
            courses: generalElectives.map((course) => course.code),
        })
    );

    const outsideAB = generalElectives.filter(
        (course) =>
            course.area !== 'A' &&
            course.area !== 'B'
    );

    results.push(
        makeRequirement({
            id: 'general-outside-ab',
            group: 'General Electives',
            label:
                'At least 1 general elective outside Areas A and B',
            met:
                outsideAB.length >=
                rule.generalElectives.minOutsideAB,
            current: outsideAB.length,
            required: rule.generalElectives.minOutsideAB,
            courses: outsideAB.map((course) => course.code),
        })
    );

    const fromCD = generalElectives.filter(
        (course) =>
            course.area === 'C' ||
            course.area === 'D'
    );

    results.push(
        makeRequirement({
            id: 'general-from-cd',
            group: 'General Electives',
            label:
                'At least 1 general elective from Area C or D',
            met:
                fromCD.length >=
                rule.generalElectives.minFromCD,
            current: fromCD.length,
            required: rule.generalElectives.minFromCD,
            courses: fromCD.map((course) => course.code),
        })
    );

    generalElectives
        .filter((course) => course.area === null)
        .forEach((course) => {
            results.push({
                id: `approval-${course.code}`,
                group: 'General Electives',
                label: course.code,
                met: true,
                type: 'warning',
                message:
                    `${course.code} is outside the listed electives. ` +
                    'Please ask your advisor whether it is approved ' +
                    'for your degree plan.',
            });
        });

    results.push(
        makeRequirement({
            id: 'seminar',
            group: 'Other Requirements',
            label: rule.seminar,
            met: courseCodes.includes(rule.seminar),
        })
    );

    results.push(
        makeRequirement({
            id: 'thesis',
            group: 'Other Requirements',
            label: rule.thesis,
            met: courseCodes.includes(rule.thesis),
        })
    );
    // =========================================================
// COURSEWORK CREDITS
// =========================================================

// Thesis is not part of the 24 coursework credits.
// The seminar is 0 credits, so including/excluding it does not
// affect the total, but we exclude it for clarity.
const courseworkCourses = selectedCourses.filter(
    (course) =>
        course.code !== rule.thesis &&
        course.code !== rule.seminar
);

const courseworkCredits = calculateCredits(courseworkCourses);

results.push(
    makeRequirement({
        id: 'coursework-credits',
        group: 'Credit Requirements',
        label: `${rule.courseworkCredits} coursework credits`,
        met: courseworkCredits >= rule.courseworkCredits,
        current: courseworkCredits,
        required: rule.courseworkCredits,
        courses: courseworkCourses.map((course) => course.code),
    })
);
const thesisCourse = selectedCourses.find(
    (course) => course.code === rule.thesis
);

const thesisCredits = thesisCourse?.credits ?? 0;

results.push(
    makeRequirement({
        id: 'thesis-credits',
        group: 'Credit Requirements',
        label: `${rule.thesisCredits} thesis credits`,
        met: thesisCredits >= rule.thesisCredits,
        current: thesisCredits,
        required: rule.thesisCredits,
        courses: thesisCourse ? [thesisCourse.code] : [],
    })
);

    return results;
}

// =========================================================
// PhD COMPUTER SCIENCE
// =========================================================

function validatePhDCS(majorArea, selectedCourses, courseCodes) {
    const rule = programRules[PROGRAMS.PHD_CS];
    const results = [];

    const excludedCodes = new Set([
        rule.seminar,
        rule.preDissertation,
        rule.dissertation,
    ]);

    const candidates = selectedCourses.filter(
        (course) => !excludedCodes.has(course.code)
    );

    // ---------------------------------------------------------
    // 1. Three major-area courses
    // ---------------------------------------------------------

    const majorCourses = candidates
        .filter((course) => course.area === majorArea)
        .slice(0, rule.majorAreaCourses.count);

    results.push(
        makeRequirement({
            id: 'phd-major-area-courses',
            group: 'Major Area',
            label:
                `${rule.majorAreaCourses.count} courses ` +
                `from Area ${majorArea}`,
            met:
                majorCourses.length >=
                rule.majorAreaCourses.count,
            current: majorCourses.length,
            required: rule.majorAreaCourses.count,
            courses: majorCourses.map((course) => course.code),
        })
    );

    // ---------------------------------------------------------
    // 2. At least one major course at 600 level
    // ---------------------------------------------------------

    const major600Courses = majorCourses.filter(
        (course) => getCourseLevel(course.code) === 600
    );

    results.push(
        makeRequirement({
            id: 'phd-major-600-level',
            group: 'Major Area',
            label:
                'At least 1 major-area course at the 600 level',
            met:
                major600Courses.length >=
                rule.majorAreaCourses.min600Level,
            current: major600Courses.length,
            required: rule.majorAreaCourses.min600Level,
            courses: major600Courses.map(
                (course) => course.code
            ),
        })
    );

    // Courses used for the major cannot be reused.
    const usedCodes = new Set(
        majorCourses.map((course) => course.code)
    );

    // ---------------------------------------------------------
    // 3. Breadth - 3 non-major courses
    // ---------------------------------------------------------

    const breadthCourses = candidates
        .filter(
            (course) =>
                !usedCodes.has(course.code) &&
                course.area !== null &&
                course.area !== majorArea
        )
        .slice(0, rule.breadthCourses.count);

    breadthCourses.forEach((course) => {
        usedCodes.add(course.code);
    });

    results.push(
        makeRequirement({
            id: 'phd-breadth-courses',
            group: 'Breadth Coverage',
            label:
                `${rule.breadthCourses.count} courses ` +
                'from areas other than the major area',
            met:
                breadthCourses.length >=
                rule.breadthCourses.count,
            current: breadthCourses.length,
            required: rule.breadthCourses.count,
            courses: breadthCourses.map(
                (course) => course.code
            ),
        })
    );

    const breadthAreas = new Set(
        breadthCourses.map((course) => course.area)
    );

    results.push(
        makeRequirement({
            id: 'phd-breadth-areas',
            group: 'Breadth Coverage',
            label:
                `Breadth covers at least ` +
                `${rule.breadthCourses.minDifferentAreas} ` +
                'different non-major areas',
            met:
                breadthAreas.size >=
                rule.breadthCourses.minDifferentAreas,
            current: breadthAreas.size,
            required: rule.breadthCourses.minDifferentAreas,
            courses: breadthCourses.map(
                (course) => course.code
            ),
        })
    );

    // ---------------------------------------------------------
    // 4. One additional CS elective from A-D
    // ---------------------------------------------------------

    const csElectives = candidates
        .filter(
            (course) =>
                !usedCodes.has(course.code) &&
                rule.csElectives.allowedAreas.includes(course.area)
        )
        .slice(0, rule.csElectives.count);

    csElectives.forEach((course) => {
        usedCodes.add(course.code);
    });

    results.push(
        makeRequirement({
            id: 'phd-cs-elective',
            group: 'CS Elective',
            label: '1 additional CS elective from Area A, B, C or D',
            met:
                csElectives.length >=
                rule.csElectives.count,
            current: csElectives.length,
            required: rule.csElectives.count,
            courses: csElectives.map(
                (course) => course.code
            ),
        })
    );

    // ---------------------------------------------------------
    // 5. Three general electives
    // ---------------------------------------------------------

    const generalElectives = candidates
        .filter((course) => !usedCodes.has(course.code))
        .slice(0, rule.generalElectives.count);

    generalElectives.forEach((course) => {
        usedCodes.add(course.code);
    });

    results.push(
        makeRequirement({
            id: 'phd-general-electives',
            group: 'General Electives',
            label: '3 general electives',
            met:
                generalElectives.length >=
                rule.generalElectives.count,
            current: generalElectives.length,
            required: rule.generalElectives.count,
            courses: generalElectives.map(
                (course) => course.code
            ),
        })
    );

    const outsideAreas = generalElectives.filter(
        (course) => course.area === null
    );

    results.push(
        makeRequirement({
            id: 'phd-general-outside-areas',
            group: 'General Electives',
            label:
                'At least 2 general electives outside Areas A-D',
            met:
                outsideAreas.length >=
                rule.generalElectives.minOutsideAreas,
            current: outsideAreas.length,
            required: rule.generalElectives.minOutsideAreas,
            courses: outsideAreas.map(
                (course) => course.code
            ),
        })
    );

    outsideAreas.forEach((course) => {
        results.push({
            id: `approval-${course.code}`,
            group: 'General Electives',
            label: course.code,
            met: true,
            type: 'warning',
            message:
                `${course.code} is outside the listed CS areas. ` +
                'Please ask your advisor whether it is approved ' +
                'for your degree plan.',
        });
    });

    // ---------------------------------------------------------
    // 6. Seminar / Pre-dissertation / Dissertation
    // ---------------------------------------------------------

    results.push(
        makeRequirement({
            id: 'phd-seminar',
            group: 'Other Requirements',
            label: rule.seminar,
            met: courseCodes.includes(rule.seminar),
        })
    );

    results.push(
        makeRequirement({
            id: 'phd-pre-dissertation',
            group: 'Other Requirements',
            label: rule.preDissertation,
            met: courseCodes.includes(rule.preDissertation),
        })
    );

    results.push(
        makeRequirement({
            id: 'phd-dissertation',
            group: 'Other Requirements',
            label: rule.dissertation,
            met: courseCodes.includes(rule.dissertation),
        })
    );
// =========================================================
// CREDIT REQUIREMENTS
// =========================================================

// ICS 699 is a zero-credit seminar.
// ICS 711 and ICS 712 are handled separately and should not
// be counted toward the required 30 coursework credits.
const courseworkCourses = selectedCourses.filter(
    (course) =>
        course.code !== rule.seminar &&
        course.code !== rule.preDissertation &&
        course.code !== rule.dissertation
);

const courseworkCredits = calculateCredits(courseworkCourses);

results.push(
    makeRequirement({
        id: 'phd-coursework-credits',
        group: 'Credit Requirements',
        label: `${rule.courseworkCredits} coursework credits`,
        met: courseworkCredits >= rule.courseworkCredits,
        current: courseworkCredits,
        required: rule.courseworkCredits,
        courses: courseworkCourses.map((course) => course.code),
    })
);
const preDissertationCourse = selectedCourses.find(
    (course) => course.code === rule.preDissertation
);

const preDissertationCredits =
    preDissertationCourse?.credits ?? 0;

results.push(
    makeRequirement({
        id: 'phd-pre-dissertation-credits',
        group: 'Credit Requirements',
        label:
            `${rule.preDissertationCredits} ` +
            'pre-dissertation credits',
        met:
            preDissertationCredits >=
            rule.preDissertationCredits,
        current: preDissertationCredits,
        required: rule.preDissertationCredits,
        courses: preDissertationCourse
            ? [preDissertationCourse.code]
            : [],
    })
);
const dissertationCourse = selectedCourses.find(
    (course) => course.code === rule.dissertation
);

const dissertationCredits =
    dissertationCourse?.credits ?? 0;

results.push(
    makeRequirement({
        id: 'phd-dissertation-credits',
        group: 'Credit Requirements',
        label: `${rule.dissertationCredits} dissertation credits`,
        met:
            dissertationCredits >=
            rule.dissertationCredits,
        current: dissertationCredits,
        required: rule.dissertationCredits,
        courses: dissertationCourse
            ? [dissertationCourse.code]
            : [],
    })
);
    return results;
}

// =========================================================
// MS SECURITY & INFORMATION ASSURANCE
// =========================================================

function isRecommendedSecurityGeneralElective(course, rule) {
    const prefixMatch =
        rule.generalElectives.recommendedPrefixes.some(
            (prefix) => course.code.startsWith(prefix)
        );

    const categoryMatch =
        rule.generalElectives.useRecommendedCategory &&
        (course.categories ?? []).includes(
            'security_recommended_elective'
        );

    return prefixMatch || categoryMatch;
}

function validateMSSecurity(selectedCourses, courseCodes) {
    const rule = programRules[PROGRAMS.MS_SECURITY];
    const results = [];

    // ---------------------------------------------------------
    // 1. Required core courses
    // ---------------------------------------------------------

    rule.coreCourses.forEach((coreCode) => {
        results.push(
            makeRequirement({
                id: `security-core-${coreCode}`,
                group: 'Core Courses',
                label: coreCode,
                met: courseCodes.includes(coreCode),
            })
        );
    });

    const excludedCodes = new Set([
        ...rule.coreCourses,
        rule.seminar,
        rule.thesis,
    ]);

    const electiveCandidates = selectedCourses.filter(
        (course) => !excludedCodes.has(course.code)
    );

    // ---------------------------------------------------------
    // 2. Three Security electives
    // ---------------------------------------------------------

    const securityElectives = electiveCandidates
        .filter((course) =>
            (course.categories ?? []).includes(
                'security_elective'
            )
        )
        .slice(0, rule.securityElectives.count);

    results.push(
        makeRequirement({
            id: 'security-electives',
            group: 'Security Electives',
            label: `${rule.securityElectives.count} Security electives`,
            met:
                securityElectives.length >=
                rule.securityElectives.count,
            current: securityElectives.length,
            required: rule.securityElectives.count,
            courses: securityElectives.map(
                (course) => course.code
            ),
        })
    );

    const usedSecurityCodes = new Set(
        securityElectives.map((course) => course.code)
    );

    // ---------------------------------------------------------
    // 3. Two general electives
    // ---------------------------------------------------------

    const generalElectives = electiveCandidates
        .filter(
            (course) =>
                !usedSecurityCodes.has(course.code)
        )
        .slice(0, rule.generalElectives.count);

    results.push(
        makeRequirement({
            id: 'security-general-electives',
            group: 'General Electives',
            label: `${rule.generalElectives.count} general electives`,
            met:
                generalElectives.length >=
                rule.generalElectives.count,
            current: generalElectives.length,
            required: rule.generalElectives.count,
            courses: generalElectives.map(
                (course) => course.code
            ),
        })
    );

    // A non-recommended elective is allowed, but the student
    // should confirm it with the advisor.
    generalElectives
        .filter(
            (course) =>
                !isRecommendedSecurityGeneralElective(
                    course,
                    rule
                )
        )
        .forEach((course) => {
            results.push({
                id: `security-approval-${course.code}`,
                group: 'General Electives',
                label: course.code,
                met: true,
                type: 'warning',
                message:
                    `${course.code} is not in the recommended ` +
                    'elective list. Please ask your advisor whether ' +
                    'it is approved for your degree plan.',
            });
        });

    // ---------------------------------------------------------
    // 4. Seminar / Thesis
    // ---------------------------------------------------------

    results.push(
        makeRequirement({
            id: 'security-seminar',
            group: 'Other Requirements',
            label: rule.seminar,
            met: courseCodes.includes(rule.seminar),
        })
    );

    results.push(
        makeRequirement({
            id: 'security-thesis',
            group: 'Other Requirements',
            label: rule.thesis,
            met: courseCodes.includes(rule.thesis),
        })
    );
    // =========================================================
// CREDIT REQUIREMENTS
// =========================================================

const courseworkCourses = selectedCourses.filter(
    (course) =>
        course.code !== rule.thesis &&
        course.code !== rule.seminar
);

const courseworkCredits = calculateCredits(courseworkCourses);

results.push(
    makeRequirement({
        id: 'security-coursework-credits',
        group: 'Credit Requirements',
        label: `${rule.courseworkCredits} coursework credits`,
        met: courseworkCredits >= rule.courseworkCredits,
        current: courseworkCredits,
        required: rule.courseworkCredits,
        courses: courseworkCourses.map((course) => course.code),
    })
);

const thesisCourse = selectedCourses.find(
    (course) => course.code === rule.thesis
);

const thesisCredits = thesisCourse?.credits ?? 0;

results.push(
    makeRequirement({
        id: 'security-thesis-credits',
        group: 'Credit Requirements',
        label: `${rule.thesisCredits} thesis credits`,
        met: thesisCredits >= rule.thesisCredits,
        current: thesisCredits,
        required: rule.thesisCredits,
        courses: thesisCourse ? [thesisCourse.code] : [],
    })
);

    return results;
}

// =========================================================
// PUBLIC VALIDATOR
// =========================================================

export function validateProgramRequirements(
    program,
    majorArea,
    terms,
    courses
) {
    const courseCodes = getUniqueCourseCodes(terms);

    const selectedCourses = courseCodes
        .map((code) => findCourse(courses, code))
        .filter(Boolean);

    if (program === PROGRAMS.MS_CS) {
        return validateMSCS(
            majorArea,
            selectedCourses,
            courseCodes
        );
    }

    if (program === PROGRAMS.PHD_CS) {
        return validatePhDCS(
            majorArea,
            selectedCourses,
            courseCodes
        );
    }

    if (program === PROGRAMS.MS_SECURITY) {
        return validateMSSecurity(
            selectedCourses,
            courseCodes
        );
    }

    return [];
}