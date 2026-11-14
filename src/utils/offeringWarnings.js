// Warnings do not block saving. They point out things the coordinator may want to check.
export function getOfferingWarnings(offering, allOfferings, courses) {
    const warnings = [];
    const others = allOfferings.filter((o) => o.id !== offering.id && o.status !== 'archived');
    if (Number(offering.seats) === 0) warnings.push('This offering has 0 seats. Students will see it as full.');
    if (!offering.instructor) warnings.push('No instructor is set yet.');
    if (!offering.time || !offering.days) warnings.push('Days or time are missing. Students will see "Times not available yet".');
    if (others.some((o) => o.courseCode === offering.courseCode && o.term === offering.term && o.section === offering.section)) {
        warnings.push(`Another offering of ${offering.courseCode} section ${offering.section} already exists for term ${offering.term}.`);
    }
    if (offering.instructor && offering.time && offering.days) {
        const days = offering.days.split(/\s+/);
        const clash = others.find(
            (o) =>
                o.term === offering.term &&
                o.instructor === offering.instructor &&
                o.time === offering.time &&
                o.days.split(/\s+/).some((d) => days.includes(d)),
        );
        if (clash) warnings.push(`${offering.instructor} also teaches ${clash.courseCode} at the same time.`);
    }
    if (courses && courses.length > 0 && !courses.some((c) => c.code === offering.courseCode)) {
        warnings.push(`${offering.courseCode} is not in the course catalog.`);
    }
    return warnings;
}
