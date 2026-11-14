// Checks course prerequisites based on the order of terms in a degree plan.
//
// Historical terms contain self-reported courses the student has already
// completed successfully.
// Planned terms contain courses the student intends to take.
//
// A prerequisite is satisfied when it appears in an earlier historical
// or planned term. A prerequisite in the same or a later term does not
// satisfy the ordering requirement.

function findCourse(courses, courseCode) {
    return courses.find((course) => course.code === courseCode);
}

function findCourseTermIndex(terms, courseCode) {
    return terms.findIndex((term) =>
        term.courses.includes(courseCode)
    );
}

export function checkPrerequisites(terms, courses) {
    const issues = [];

    terms.forEach((term, termIndex) => {
        term.courses.forEach((courseCode) => {
            const course = findCourse(courses, courseCode);

            // Ignore a course if its catalog information cannot be found.
            // Another validation step can handle unknown courses later.
            if (!course) {
                return;
            }

            const prerequisites = course.prerequisites ?? [];

            prerequisites.forEach((prerequisiteCode) => {
                const prerequisiteTermIndex =
                    findCourseTermIndex(terms, prerequisiteCode);

                // Prerequisite is in an earlier term.
                if (
                    prerequisiteTermIndex !== -1 &&
                    prerequisiteTermIndex < termIndex
                ) {
                    return;
                }

                // The prerequisite exists, but not before this course.
                if (prerequisiteTermIndex !== -1) {
                    issues.push({
                        type: 'error',
                        courseCode,
                        prerequisiteCode,
                        term: term.term,
                        message:
                            `${courseCode} requires ${prerequisiteCode} ` +
                            'in an earlier term.',
                    });

                    return;
                }

                // The prerequisite is not anywhere in the degree plan.
                //
                // If the official prerequisite text contains an alternative
                // such as instructor consent or an equivalent course, GradPath
                // cannot determine that automatically, so show a warning.
                const prerequisiteText =
                    course.prerequisiteText ?? '';

                const hasAlternative =
                    /\bor\b/i.test(prerequisiteText) ||
                    /equivalent/i.test(prerequisiteText) ||
                    /consent/i.test(prerequisiteText);

                if (hasAlternative) {
                    issues.push({
                        type: 'warning',
                        courseCode,
                        prerequisiteCode,
                        term: term.term,
                        message:
                            `${courseCode}: ${prerequisiteText}. ` +
                            'Confirm that you meet this requirement.',
                    });

                    return;
                }

                // No alternative is known, so the missing prerequisite
                // is a blocking problem.
                issues.push({
                    type: 'error',
                    courseCode,
                    prerequisiteCode,
                    term: term.term,
                    message:
                        `${courseCode} requires ${prerequisiteCode} ` +
                        'in an earlier term.',
                });
            });
        });
    });

    return issues;
}