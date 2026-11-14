import { useState } from 'react';

export default function PlannedCourseCard({
    courseCode,
    courses = [],
    historical = false,
    termCode,
    availableTerms = [],
    onRemove,
    onMove,
}) {
    const [actionsOpen, setActionsOpen] = useState(false);

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
                <button
                    type="button"
                    className="planned-course-card__actions-button"
                    aria-expanded={actionsOpen}
                    onClick={() => setActionsOpen((open) => !open)}
                >
                    Actions
                    <span aria-hidden="true">⌄</span>
                </button>

                {actionsOpen && (
                    <div className="planned-course-card__menu">
                        <p className="planned-course-card__menu-label">
                            Move to
                        </p>

                        {availableTerms
                            .filter((term) => term.term !== termCode)
                            .map((term) => (
                                <button
                                    key={term.term}
                                    type="button"
                                    onClick={() => {
                                        onMove?.(
                                            courseCode,
                                            termCode,
                                            term.term
                                        );

                                        setActionsOpen(false);
                                    }}
                                >
                                    Term {term.term}
                                </button>
                            ))}

                        <div className="planned-course-card__menu-divider" />

                        <button
                            type="button"
                            className="planned-course-card__remove"
                            onClick={() => {
                                onRemove?.(termCode, courseCode);
                                setActionsOpen(false);
                            }}
                        >
                            Remove course
                        </button>
                    </div>
                )}
            </div>
        </article>
    );
}