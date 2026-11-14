import { PUBLISH_STATUS } from '../data/statusValues';

function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
}

function parseTimeRange(timeRange) {
    if (!timeRange) {
        return null;
    }

    const [start, end] = timeRange.split('-');

    if (!start || !end) {
        return null;
    }

    return {
        start: timeToMinutes(start),
        end: timeToMinutes(end),
    };
}

function getDays(days) {
    if (!days) {
        return [];
    }

    return days.trim().split(/\s+/);
}

function shareDay(firstOffering, secondOffering) {
    const firstDays = getDays(firstOffering.days);
    const secondDays = getDays(secondOffering.days);

    return firstDays.some((day) => secondDays.includes(day));
}

function timesOverlap(firstOffering, secondOffering) {
    const firstTime = parseTimeRange(firstOffering.time);
    const secondTime = parseTimeRange(secondOffering.time);

    if (!firstTime || !secondTime) {
        return false;
    }

    return (
        firstTime.start < secondTime.end &&
        secondTime.start < firstTime.end
    );
}

export function checkConflicts(terms, offerings) {
    const issues = [];

    terms.forEach((term) => {
        // Historical terms do not need schedule-conflict checking.
        if (term.type === 'historical') {
            return;
        }

        const plannedCourseCodes = term.courses ?? [];

        const termOfferings = offerings.filter(
            (offering) =>
                offering.term === term.term &&
                plannedCourseCodes.includes(offering.courseCode) &&
                offering.status === PUBLISH_STATUS.PUBLISHED
        );

        for (let i = 0; i < termOfferings.length; i += 1) {
            for (let j = i + 1; j < termOfferings.length; j += 1) {
                const first = termOfferings[i];
                const second = termOfferings[j];

                if (
                    shareDay(first, second) &&
                    timesOverlap(first, second)
                ) {
                    issues.push({
                        type: 'error',
                        term: term.term,
                        courses: [
                            first.courseCode,
                            second.courseCode,
                        ],
                        offeringIds: [
                            first.id,
                            second.id,
                        ],
                        message:
                            `${first.courseCode} and ${second.courseCode} ` +
                            `have a schedule conflict in term ${term.term}.`,
                    });
                }
            }
        }
    });

    return issues;
}