import { Link } from 'react-router-dom';

import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';

import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';

export default function PlanReviewPage() {
    const { currentUser } = useAuth();
    const { data } = useData();

    const advisor = (data.advisors ?? []).find(
        (item) => item.userId === currentUser.id
    );

    const advisees = advisor
        ? (data.students ?? []).filter(
              (student) => student.advisorId === advisor.id
          )
        : [];

    const adviseeIds = new Set(
        advisees.map((student) => student.userId)
    );

    const plans = (data.degreePlans ?? []).filter(
        (plan) => adviseeIds.has(plan.userId)
    );

    function studentName(userId) {
        return (
            (data.users ?? []).find(
                (user) => user.id === userId
            )?.name ?? userId
        );
    }

    return (
        <main className="page page--plain">
            <PageHeader
                title="Degree Plan Reviews"
                subtitle="Review submitted degree plans from your advisees."
            />

            <section className="panel">
                {plans.length === 0 ? (
                    <EmptyState
                        title="No degree plans"
                        message="There are no advisee degree plans to review."
                    />
                ) : (
                    <div className="table-wrap">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Program</th>
                                    <th>Version</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {plans.map((plan) => (
                                    <tr key={plan.id}>
                                        <td>
                                            {studentName(
                                                plan.userId
                                            )}
                                        </td>

                                        <td>{plan.program}</td>

                                        <td>
                                            Version{' '}
                                            {plan.currentVersion ??
                                                0}
                                        </td>

                                        <td>
                                            <StatusBadge
                                                status={
                                                    plan.status
                                                }
                                            />
                                        </td>

                                        <td>
                                            <Link
                                                className="btn btn--ghost"
                                                to={`/advisor/plans/${plan.id}`}
                                            >
                                                Review
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}