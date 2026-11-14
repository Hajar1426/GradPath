import PlannedCourseCard from './PlannedCourseCard';

export default function TermColumn({
    term,
    courses = [],
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
                <div>
                    <h3>Term {term.term}</h3>

                    <p>
                        {isHistorical
                            ? 'Previous coursework'
                            : 'Planned semester'}
                    </p>
                </div>

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
                    />
                ))}

                {!isHistorical && (
                    <button
                        type="button"
                        className="plan-term__add"
                    >
                        <span aria-hidden="true">+</span>
                        Add course
                    </button>
                )}

                {isHistorical && termCourses.length === 0 && (
                    <p className="plan-term__empty">
                        No previous courses added.
                    </p>
                )}
            </div>
        </section>
    );
}