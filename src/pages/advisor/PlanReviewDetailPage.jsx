import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import PlanBoard from '../../components/planning/PlanBoard';

import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';

import { PLAN_STATUS } from '../../data/statusValues';
import { programRules } from '../../data/programRules';

export default function PlanReviewDetailPage() {
    const { id } = useParams();

    const { currentUser } = useAuth();

    const {
        data,
        updateCollection,
        addNotification,
    } = useData();

    const { showToast } = useToast();

    const [comment, setComment] = useState('');
    const [decision, setDecision] = useState(null);

    const advisor = (data.advisors ?? []).find(
        (item) => item.userId === currentUser.id
    );

    const plan = (data.degreePlans ?? []).find(
        (item) => item.id === id
    );

    const student = plan
        ? (data.students ?? []).find(
              (item) => item.userId === plan.userId
          )
        : null;

    const user = plan
        ? (data.users ?? []).find(
              (item) => item.id === plan.userId
          )
        : null;

    const allowed =
        advisor &&
        student &&
        student.advisorId === advisor.id;

    if (!plan || !allowed) {
        return (
            <main className="page page--plain">
                <PageHeader
                    title="Degree Plan Review"
                    subtitle="The requested plan could not be found."
                />

                <section className="panel">
                    <p>
                        You do not have access to this degree plan.
                    </p>
                </section>
            </main>
        );
    }

    const latestVersion = (data.planVersions ?? [])
        .filter((version) => version.planId === plan.id)
        .sort((a, b) => b.version - a.version)[0];

    const reviewTerms =
        latestVersion?.terms ?? plan.terms ?? [];

    function submitDecision() {
        if (!decision) {
            return;
        }

        const decidedAt = new Date().toISOString();

        const nextStatus =
            decision === 'approved'
                ? PLAN_STATUS.APPROVED
                : PLAN_STATUS.CHANGES_REQUESTED;

        updateCollection('degreePlans', (plans) =>
            plans.map((item) =>
                item.id === plan.id
                    ? {
                          ...item,
                          status: nextStatus,
                          updatedAt: decidedAt,
                      }
                    : item
            )
        );

        if (latestVersion) {
            updateCollection('planVersions', (versions) =>
                versions.map((version) =>
                    version.id === latestVersion.id
                        ? {
                              ...version,
                              decision,
                              decidedAt,
                              comments: comment.trim()
                                  ? [
                                        ...(version.comments ??
                                            []),
                                        {
                                            id: `comment-${Date.now()}`,
                                            authorId:
                                                currentUser.id,
                                            text: comment.trim(),
                                            at: decidedAt,
                                        },
                                    ]
                                  : version.comments ?? [],
                          }
                        : version
                )
            );
        }

        addNotification({
            userId: plan.userId,
            title:
                decision === 'approved'
                    ? 'Degree plan approved'
                    : 'Degree plan changes requested',
            message:
                comment.trim() ||
                (decision === 'approved'
                    ? 'Your advisor approved your degree plan.'
                    : 'Your advisor requested changes to your degree plan.'),
        });

        setDecision(null);
        setComment('');

        showToast(
            decision === 'approved'
                ? 'Degree plan approved.'
                : 'Changes requested from the student.'
        );
    }

    return (
        <main className="page page--plain">
            <div className="page__toolbar">
                <PageHeader
                    title={user?.name ?? 'Degree Plan Review'}
                    subtitle={
                        `${programRules[plan.program]?.name ?? plan.program} • ` +
                        `Version ${latestVersion?.version ?? plan.currentVersion ?? 0}`
                    }
                />

                <StatusBadge status={plan.status} />
            </div>

            <section className="panel">
                <PlanBoard
                    terms={reviewTerms}
                    courses={data.courses ?? []}
                />
            </section>

            <section className="panel plan-review__decision">
                <div>
                    <h2>Advisor decision</h2>
                    <p>
                        Add feedback for the student, then approve
                        the plan or request changes.
                    </p>
                </div>

                <label className="plan-review__comment">
                    <span>Feedback</span>

                    <textarea
                        value={comment}
                        onChange={(event) =>
                            setComment(event.target.value)
                        }
                        placeholder="Add feedback for the student..."
                        rows={4}
                    />
                </label>

                <div className="plan-review__actions">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                            setDecision('changes_requested')
                        }
                    >
                        Request changes
                    </Button>

                    <Button
                        type="button"
                        onClick={() =>
                            setDecision('approved')
                        }
                    >
                        Approve plan
                    </Button>
                </div>
            </section>

            <Link
                className="btn btn--ghost"
                to="/advisor/plans"
            >
                Back to degree plans
            </Link>

            <ConfirmationDialog
                open={Boolean(decision)}
                title={
                    decision === 'approved'
                        ? 'Approve degree plan?'
                        : 'Request changes?'
                }
                message={
                    decision === 'approved'
                        ? 'The student will be notified that the submitted degree plan has been approved.'
                        : 'The student will be notified that changes are required before submitting another version.'
                }
                confirmLabel={
                    decision === 'approved'
                        ? 'Approve plan'
                        : 'Request changes'
                }
                onConfirm={submitDecision}
                onCancel={() => setDecision(null)}
            />
        </main>
    );
}