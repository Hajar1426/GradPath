import TermColumn from './TermColumn';

export default function PlanBoard({
    terms = [],
    courses = [],
    onRemoveCourse,
    onMoveCourse,
}) {
    return (
        <section className="plan-board">
            <div className="plan-board__heading">
                <div>
                    <h2>Degree timeline</h2>
                    <p>
                        Review previous coursework and build your
                        intended plan across upcoming semesters.
                    </p>
                </div>

                <span className="plan-board__scroll-hint">
                    Scroll to view more terms →
                </span>
            </div>

            <div className="plan-board__scroll">
                <div className="plan-board__terms">
                    {terms.map((term) => (
                        <TermColumn
                            key={term.term}
                            term={term}
                            courses={courses}
                            allTerms={terms}
                            onRemoveCourse={onRemoveCourse}
                            onMoveCourse={onMoveCourse}
                        />
                    ))}
                </div>
            </div>

            <p className="plan-board__history-note">
                Previous coursework is self-reported. Only add
                courses you successfully completed and make sure
                they match your academic record.
            </p>
        </section>
    );
}