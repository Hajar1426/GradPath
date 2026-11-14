import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import PlanChecklist from '../../components/planning/PlanChecklist';

import { validatePlan } from '../../utils/validatePlan';
import { useStudentInfo } from '../../hooks/useStudentInfo';
import PlanBoard from '../../components/planning/PlanBoard';

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

            <PlanBoard
    terms={plan.terms}
    courses={data.courses ?? []}
/>
        </>
    );
}