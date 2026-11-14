import TermColumn from './TermColumn';

export default function PlanBoard({
    terms = [],
    courses = [],
}) {
    const historicalTerms = terms.filter(
        (term) => term.type === 'historical'
    );

    const plannedTerms = terms.filter(
        (term) => term.type === 'planned'
    );

    return (
        <div className="plan-board">
            {historicalTerms.length > 0 && (
                <section className="plan-board__section">
                    <div className="plan-board__heading">
                        <div>
                            <h2>Previous coursework</h2>
                            <p>
                                Courses you have already completed.
                            </p>
                        </div>

                        <span className="plan-board__self-reported">
                            Self-reported
                        </span>
                    </div>

                    <div className="plan-board__terms">
                        {historicalTerms.map((term) => (
                            <TermColumn
                                key={term.term}
                                term={term}
                                courses={courses}
                            />
                        ))}
                    </div>

                    <p className="plan-board__history-note">
                        Previous coursework is self-reported.
                        Only add courses you successfully completed
                        and make sure they match your academic record.
                    </p>
                </section>
            )}

            <section className="plan-board__section">
                <div className="plan-board__heading">
                    <div>
                        <h2>Your semesters</h2>
                        <p>
                            Build your intended course plan semester by
                            semester.
                        </p>
                    </div>
                </div>

                <div className="plan-board__terms">
                    {plannedTerms.map((term) => (
                        <TermColumn
                            key={term.term}
                            term={term}
                            courses={courses}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}