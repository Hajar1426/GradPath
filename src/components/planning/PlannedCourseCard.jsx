export default function PlannedCourseCard({
    courseCode,
    courses = [],
    historical = false,
    termCode,
    availableTerms = [],
    onRemove,
    onMove,
}) {
    const course = courses.find(
        (item) => item.code === courseCode
    );

    return (
        <article className="planned-course-card">
            <div className="planned-course-card__top">
                <strong>{courseCode}</strong>

                {course?.area && (
                    <span className="planned-course-card__area">
                        Area {course.area}
                    </span>
                )}
            </div>

            <p className="planned-course-card__title">
                {course?.title ?? 'Course information unavailable'}
            </p>

            <div className="planned-course-card__meta">
                <span>
                    {course?.credits ?? 0}{' '}
                    {(course?.credits ?? 0) === 1
                        ? 'credit'
                        : 'credits'}
                </span>

                {historical && (
                    <span className="planned-course-card__history">
                        Previous
                    </span>
                )}
            </div>

            <div className="planned-course-card__actions">
                <select
                    aria-label={`Move ${courseCode} to another term`}
                    value=""
                    onChange={(event) => {
                        if (event.target.value) {
                            onMove?.(
                                courseCode,
                                termCode,
                                event.target.value
                            );
                        }
                    }}
                >
                    <option value="">Move to...</option>

                    {availableTerms
                        .filter((term) => term.term !== termCode)
                        .map((term) => (
                            <option
                                key={term.term}
                                value={term.term}
                            >
                                Term {term.term}
                            </option>
                        ))}
                </select>

                <button
                    type="button"
                    onClick={() =>
                        onRemove?.(termCode, courseCode)
                    }
                >
                    Remove
                </button>
            </div>
        </article>
    );
}