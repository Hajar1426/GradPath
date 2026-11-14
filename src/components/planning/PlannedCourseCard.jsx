export default function PlannedCourseCard({
    courseCode,
    courses = [],
    historical = false,
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
        </article>
    );
}