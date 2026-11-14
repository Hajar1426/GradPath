import { useEffect, useState } from 'react';

import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';

import PlanChecklist from '../../components/planning/PlanChecklist';
import PlanBoard from '../../components/planning/PlanBoard';
import CoursePicker from '../../components/planning/CoursePicker';

import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useStudentInfo } from '../../hooks/useStudentInfo';
import { useToast } from '../../hooks/useToast';

import { validatePlan } from '../../utils/validatePlan';
import { programRules } from '../../data/programRules';
import { PLAN_STATUS } from '../../data/statusValues';

export default function DegreePlanBuilderPage() {
    const { currentUser } = useAuth();
    const { data, updateCollection } = useData();
    const studentInfo = useStudentInfo();
    const { showToast } = useToast();

    const plan = data.degreePlans.find(
        (item) => item.userId === currentUser.id
    );

    const [terms, setTerms] = useState([]);
    const [selectedTerm, setSelectedTerm] = useState(null);
    const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

    // ---------------------------------------------------------
    // LOAD SAVED PLAN INTO LOCAL EDITABLE STATE
    // ---------------------------------------------------------

    useEffect(() => {
        if (plan) {
            setTerms(
                plan.terms.map((term) => ({
                    ...term,
                    courses: [...(term.courses ?? [])],
                }))
            );
        }
    }, [plan]);

    // ---------------------------------------------------------
    // UNSAVED CHANGES
    // ---------------------------------------------------------

    const hasUnsavedChanges =
        Boolean(plan) &&
        JSON.stringify(terms) !== JSON.stringify(plan.terms);

    useEffect(() => {
        function handleBeforeUnload(event) {
            if (!hasUnsavedChanges) {
                return;
            }

            event.preventDefault();
            event.returnValue = '';
        }

        window.addEventListener(
            'beforeunload',
            handleBeforeUnload
        );

        return () => {
            window.removeEventListener(
                'beforeunload',
                handleBeforeUnload
            );
        };
    }, [hasUnsavedChanges]);

    // ---------------------------------------------------------
    // NO PLAN
    // ---------------------------------------------------------

    if (!plan) {
        return (
            <main className="page page--plain plan-page">
                <PageHeader
                    title="Degree Plan"
                    subtitle="Build and review your academic plan."
                />

                <section className="panel">
                    <p>No degree plan was found for your account.</p>
                </section>
            </main>
        );
    }

    // ---------------------------------------------------------
    // LIVE VALIDATION
    // ---------------------------------------------------------

    const validation = validatePlan({
        program: plan.program,
        majorArea: plan.majorArea,
        terms,
        courses: data.courses ?? [],
        offerings: data.offerings ?? [],
        recommendedCourses: studentInfo?.minCourses,
    });

    const blockingRequirements =
        validation.requirements.filter(
            (requirement) =>
                requirement.type !== 'warning' &&
                !requirement.met
        );

    const canSubmit =
        blockingRequirements.length === 0 &&
        !hasUnsavedChanges;

    // ---------------------------------------------------------
    // REMOVE COURSE
    // ---------------------------------------------------------

    function removeCourse(termCode, courseCode) {
        setTerms((currentTerms) =>
            currentTerms.map((term) =>
                term.term === termCode
                    ? {
                          ...term,
                          courses: (term.courses ?? []).filter(
                              (code) => code !== courseCode
                          ),
                      }
                    : term
            )
        );
    }

    // ---------------------------------------------------------
    // MOVE COURSE
    // ---------------------------------------------------------

    function moveCourse(
        courseCode,
        fromTermCode,
        toTermCode
    ) {
        if (fromTermCode === toTermCode) {
            return;
        }

        setTerms((currentTerms) =>
            currentTerms.map((term) => {
                if (term.term === fromTermCode) {
                    return {
                        ...term,
                        courses: (term.courses ?? []).filter(
                            (code) => code !== courseCode
                        ),
                    };
                }

                if (term.term === toTermCode) {
                    return {
                        ...term,
                        courses: [
                            ...(term.courses ?? []),
                            courseCode,
                        ],
                    };
                }

                return term;
            })
        );
    }

    // ---------------------------------------------------------
    // ADD COURSE
    // ---------------------------------------------------------

    function addCourse(termCode, courseCode) {
        const alreadyExists = terms.some((term) =>
            (term.courses ?? []).includes(courseCode)
        );

        if (alreadyExists) {
            return;
        }

        setTerms((currentTerms) =>
            currentTerms.map((term) =>
                term.term === termCode
                    ? {
                          ...term,
                          courses: [
                              ...(term.courses ?? []),
                              courseCode,
                          ],
                      }
                    : term
            )
        );

        setSelectedTerm(null);
    }

    // ---------------------------------------------------------
    // SAVE DRAFT
    // ---------------------------------------------------------

    function saveDraft() {
        updateCollection('degreePlans', (plans) =>
            plans.map((item) =>
                item.id === plan.id
                    ? {
                          ...item,

                          terms: terms.map((term) => ({
                              ...term,
                              courses: [
                                  ...(term.courses ?? []),
                              ],
                          })),

                          status: PLAN_STATUS.DRAFT,
                          updatedAt:
                              new Date().toISOString(),
                      }
                    : item
            )
        );

        showToast('Degree plan draft saved.');
    }

    // ---------------------------------------------------------
    // SUBMIT FOR ADVISOR REVIEW
    // ---------------------------------------------------------

    function submitPlan() {
        if (hasUnsavedChanges) {
            showToast(
                'Save your draft before submitting.'
            );

            setSubmitDialogOpen(false);
            return;
        }

        if (blockingRequirements.length > 0) {
            showToast(
                'Complete the required degree-plan items before submitting.'
            );

            setSubmitDialogOpen(false);
            return;
        }

        const submittedAt =
            new Date().toISOString();

        const nextVersion =
            (plan.currentVersion ?? 0) + 1;

        const submittedTerms = terms.map((term) => ({
            ...term,
            courses: [...(term.courses ?? [])],
        }));

        // Create a permanent snapshot of this submission.
        updateCollection('planVersions', (versions) => [
            ...versions,
            {
                id: `plan-version-${Date.now()}`,
                planId: plan.id,
                version: nextVersion,
                terms: submittedTerms,
                submittedAt,
                decision: null,
                comments: [],
            },
        ]);

        // Update the active degree plan.
        updateCollection('degreePlans', (plans) =>
            plans.map((item) =>
                item.id === plan.id
                    ? {
                          ...item,
                          terms: submittedTerms,
                          status: PLAN_STATUS.SUBMITTED,
                          currentVersion: nextVersion,
                          updatedAt: submittedAt,
                      }
                    : item
            )
        );

        setSubmitDialogOpen(false);

        showToast(
            'Degree plan submitted for advisor review.'
        );
    }

    // ---------------------------------------------------------
    // PAGE
    // ---------------------------------------------------------

    return (
        <main className="page page--plain plan-page">
            <div className="plan-page__header">
                <PageHeader
                    title="Degree Plan"
                    subtitle={
                        `${programRules[plan.program]?.name ?? plan.program} • ` +
                        `Area ${plan.majorArea}`
                    }
                />

                <div className="plan-page__actions">
                    <StatusBadge status={plan.status} />

                    {hasUnsavedChanges && (
                        <span className="plan-page__unsaved">
                            Unsaved changes
                        </span>
                    )}

                    <Button
                        type="button"
                        variant="ghost"
                        disabled={!hasUnsavedChanges}
                        onClick={saveDraft}
                    >
                        Save draft
                    </Button>

                    <Button
                        type="button"
                        disabled={!canSubmit}
                        onClick={() =>
                            setSubmitDialogOpen(true)
                        }
                    >
                        Submit for advisor review
                    </Button>
                </div>
            </div>

            <section className="panel plan-page__requirements">
                <PlanChecklist
                    requirements={validation.requirements}
                    warnings={validation.warnings}
                />
            </section>

            <section className="panel plan-page__timeline">
                <PlanBoard
                    terms={terms}
                    courses={data.courses ?? []}
                    onRemoveCourse={removeCourse}
                    onMoveCourse={moveCourse}
                    onAddCourse={setSelectedTerm}
                />
            </section>

            <CoursePicker
                open={Boolean(selectedTerm)}
                term={selectedTerm}
                courses={data.courses ?? []}
                offerings={data.offerings ?? []}
                plannedTerms={terms}
                onClose={() =>
                    setSelectedTerm(null)
                }
                onAdd={addCourse}
            />

            <ConfirmationDialog
                open={submitDialogOpen}
                title="Submit degree plan?"
                message="Your saved degree plan will be submitted to your advisor for review. Your advisor can approve it or request changes."
                confirmLabel="Submit plan"
                cancelLabel="Cancel"
                onConfirm={submitPlan}
                onCancel={() =>
                    setSubmitDialogOpen(false)
                }
            />
        </main>
    );
}