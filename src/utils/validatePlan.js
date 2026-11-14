import { PUBLISH_STATUS } from '../data/statusValues';

import { checkPrerequisites } from './checkPrerequisites';
import { checkConflicts } from './checkConflicts';
import { validateProgramRequirements } from './validateProgramRequirements';

// =========================================================
// HELPERS
// =========================================================

function getAllCoursePlacements(terms) {
    return terms.flatMap((term) =>
        (term.courses ?? []).map((courseCode) => ({
            courseCode,
            term: term.term,
            type: term.type,
        }))
    );
}

// =========================================================
// DUPLICATE COURSES
// =========================================================

function checkDuplicates(terms) {
    const placements = getAllCoursePlacements(terms);

    const seen = new Set();
    const duplicates = new Set();

    placements.forEach(({ courseCode }) => {
        if (seen.has(courseCode)) {
            duplicates.add(courseCode);
        }

        seen.add(courseCode);
    });

    return [...duplicates].map((courseCode) => ({
        type: 'error',
        code: 'duplicate-course',
        courseCode,
        message:
            `${courseCode} appears more than once in the degree plan.`,
    }));
}

// =========================================================
// PUBLISHED OFFERING CHECK
// =========================================================

function checkOfferings(terms, offerings) {
    const warnings = [];

    terms.forEach((term) => {
        // Historical coursework does not need to match
        // the current offerings data.
        if (term.type === 'historical') {
            return;
        }

        const plannedCourses = term.courses ?? [];

        const publishedTermOfferings = offerings.filter(
            (offering) =>
                offering.term === term.term &&
                offering.status === PUBLISH_STATUS.PUBLISHED
        );

        // If offerings for this term have not been published yet,
        // GradPath cannot determine whether a course will be offered.
        if (publishedTermOfferings.length === 0) {
            return;
        }

        const offeredCourseCodes = new Set(
            publishedTermOfferings.map(
                (offering) => offering.courseCode
            )
        );

        plannedCourses.forEach((courseCode) => {
            if (!offeredCourseCodes.has(courseCode)) {
                warnings.push({
                    type: 'warning',
                    code: 'course-not-offered',
                    courseCode,
                    term: term.term,
                    message:
                        `${courseCode} is not currently listed among ` +
                        `the published offerings for term ${term.term}. ` +
                        'Check the announced course offerings and ' +
                        'consider changing your plan.',
                });
            }
        });
    });

    return warnings;
}

// =========================================================
// STUDY-LOAD ADVICE
// =========================================================

function getStudyLoadAdvice(terms, recommendedCourses) {
    const advice = [];

    if (!recommendedCourses) {
        return advice;
    }

    terms.forEach((term) => {
        // Historical terms are not planning recommendations.
        if (term.type === 'historical') {
            return;
        }

        const courseCount = (term.courses ?? []).length;

        if (courseCount < recommendedCourses) {
            advice.push({
                type: 'advice',
                code: 'recommended-study-load',
                term: term.term,
                current: courseCount,
                recommended: recommendedCourses,
                message:
                    `Planning at least ${recommendedCourses} ` +
                    `${recommendedCourses === 1 ? 'course' : 'courses'} ` +
                    `in term ${term.term} is recommended to help ` +
                    'maintain steady progress.',
            });
        }
    });

    return advice;
}

// =========================================================
// MAIN PLAN VALIDATOR
// =========================================================

export function validatePlan({
    program,
    majorArea,
    terms,
    courses,
    offerings,
    recommendedCourses,
}) {
    const safeTerms = terms ?? [];
    const safeCourses = courses ?? [];
    const safeOfferings = offerings ?? [];

    // ---------------------------------------------------------
    // Blocking validation
    // ---------------------------------------------------------

    const duplicateIssues =
        checkDuplicates(safeTerms);

    const prerequisiteIssues =
        checkPrerequisites(
            safeTerms,
            safeCourses
        );

    const conflictIssues =
        checkConflicts(
            safeTerms,
            safeOfferings
        );

    // ---------------------------------------------------------
    // Non-blocking warnings
    // ---------------------------------------------------------

    const offeringWarnings =
        checkOfferings(
            safeTerms,
            safeOfferings
        );

    // ---------------------------------------------------------
    // Non-blocking planning advice
    // ---------------------------------------------------------

    const advice =
        getStudyLoadAdvice(
            safeTerms,
            recommendedCourses
        );

    // ---------------------------------------------------------
    // Degree/program requirements
    // ---------------------------------------------------------

    const programRequirements =
        validateProgramRequirements(
            program,
            majorArea,
            safeTerms,
            safeCourses
        );

    // ---------------------------------------------------------
    // Separate errors, warnings and unmet requirements
    // ---------------------------------------------------------

    const errors = [
        ...duplicateIssues,
        ...prerequisiteIssues,
        ...conflictIssues,
    ].filter(
        (issue) => issue.type === 'error'
    );

    const warnings = [
        ...prerequisiteIssues,
        ...offeringWarnings,
        ...programRequirements,
    ].filter(
        (issue) => issue.type === 'warning'
    );

    const unmetRequirements =
        programRequirements.filter(
            (requirement) =>
                requirement.type === 'requirement' &&
                !requirement.met
        );

    // ---------------------------------------------------------
    // ACTION AVAILABILITY
    // ---------------------------------------------------------

    /*
     * A student may save an incomplete plan as a draft.
     *
     * Errors, missing requirements, warnings and advice do not
     * prevent the student from saving their work.
     */
    const canSaveDraft = true;

    /*
     * Submission to the advisor is stricter.
     *
     * The plan must:
     * 1. Have no blocking validation errors.
     * 2. Meet every mandatory program requirement.
     *
     * Warnings and planning advice do NOT block submission.
     */
    const canSubmit =
        errors.length === 0 &&
        unmetRequirements.length === 0;

    return {
        errors,
        warnings,
        advice,

        requirements: programRequirements,
        unmetRequirements,

        canSaveDraft,
        canSubmit,
    };
}