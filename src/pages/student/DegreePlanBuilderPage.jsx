import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import PlanChecklist from '../../components/planning/PlanChecklist';

import { validatePlan } from '../../utils/validatePlan';
import { useStudentInfo } from '../../hooks/useStudentInfo';

export default function DegreePlanBuilderPage() {
    const { currentUser } = useAuth();
    const { data } = useData();

    const plan = data.degreePlans.find(
        (item) => item.userId === currentUser.id
    );

    if (!plan) {
        return (
            <>
                <PageHeader
                    title="Degree Plan"
                    subtitle="Build and review your academic plan."
                />

                <p>No degree plan was found for your account.</p>
            </>
        );
    }
    const studentInfo = useStudentInfo();

const validation = validatePlan({
    program: plan.program,
    majorArea: plan.majorArea,
    terms: plan.terms,
    courses: data.courses ?? [],
    offerings: data.offerings ?? [],
    recommendedCourses: studentInfo?.minCourses,
});

    return (
        <>
            <div className="plan-page__header">
                <PageHeader
                    title="Degree Plan"
                    subtitle={`${plan.program} • Area ${plan.majorArea}`}
                />

                <StatusBadge status={plan.status} />
            </div>
            <PlanChecklist
    requirements={validation.requirements}
    warnings={validation.warnings}
/>

            <section>
                <h2>Historical Coursework</h2>

                {plan.terms
                    .filter((term) => term.type === 'historical')
                    .map((term) => (
                        <div key={term.term}>
                            <h3>Term {term.term}</h3>

                            <ul>
                                {term.courses.map((courseCode) => (
                                    <li key={courseCode}>
                                        {courseCode}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
            </section>

            <section>
                <h2>Planned Coursework</h2>

                {plan.terms
                    .filter((term) => term.type === 'planned')
                    .map((term) => (
                        <div key={term.term}>
                            <h3>Term {term.term}</h3>

                            {term.courses.length > 0 ? (
                                <ul>
                                    {term.courses.map((courseCode) => (
                                        <li key={courseCode}>
                                            {courseCode}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No courses planned yet.</p>
                            )}
                        </div>
                    ))}
            </section>
        </>
    );
}