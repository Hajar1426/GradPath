import PlannedCourseCard from './PlannedCourseCard';

export default function TermColumn({
    term,
    courses = [],
    allTerms = [],
    onRemoveCourse,
    onMoveCourse,
    onAddCourse,
}) {
    const isHistorical = term.type === 'historical';
    const termCourses = term.courses ?? [];

    return (
        <section
            className={
                `plan-term ` +
                (isHistorical
                    ? 'plan-term--historical'
                    : 'plan-term--planned')
            }
        >
            <div className="plan-term__info">
                <h3>Term {term.term}</h3>

                <p>
                    {isHistorical
                        ? 'Previous coursework'
                        : 'Planned semester'}
                </p>

                <span className="plan-term__count">
                    {termCourses.length}{' '}
                    {termCourses.length === 1
                        ? 'course'
                        : 'courses'}
                </span>
            </div>

            <div className="plan-term__courses">
                {termCourses.map((courseCode) => (
                    <PlannedCourseCard
                        key={courseCode}
                        courseCode={courseCode}
                        courses={courses}
                        historical={isHistorical}
                        termCode={term.term}
                        availableTerms={allTerms}
                        onRemove={onRemoveCourse}
                        onMove={onMoveCourse}
                    />
                ))}

                <button
                    type="button"
                    className="plan-term__add"
                    onClick={() => onAddCourse?.(term)}
                >
                    <span aria-hidden="true">+</span>
                    Add course
                </button>
            </div>
        </section>
    );
}