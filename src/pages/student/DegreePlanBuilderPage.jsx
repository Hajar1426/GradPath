import { useEffect, useState } from 'react';

import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import PlanChecklist from '../../components/planning/PlanChecklist';
import PlanBoard from '../../components/planning/PlanBoard';
import CoursePicker from '../../components/planning/CoursePicker';

import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useStudentInfo } from '../../hooks/useStudentInfo';

import { validatePlan } from '../../utils/validatePlan';
import { programRules } from '../../data/programRules';

export default function DegreePlanBuilderPage() {
    const { currentUser } = useAuth();
    const { data } = useData();
    const studentInfo = useStudentInfo();

    const plan = data.degreePlans.find(
        (item) => item.userId === currentUser.id
    );

    const [terms, setTerms] = useState([]);
    const [selectedTerm, setSelectedTerm] = useState(null);

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

    const validation = validatePlan({
        program: plan.program,
        majorArea: plan.majorArea,
        terms,
        courses: data.courses ?? [],
        offerings: data.offerings ?? [],
        recommendedCourses: studentInfo?.minCourses,
    });

    function removeCourse(termCode, courseCode) {
        setTerms((currentTerms) =>
            currentTerms.map((term) =>
                term.term === termCode
                    ? {
                          ...term,
                          courses: term.courses.filter(
                              (code) => code !== courseCode
                          ),
                      }
                    : term
            )
        );
    }

    function moveCourse(courseCode, fromTermCode, toTermCode) {
        if (fromTermCode === toTermCode) {
            return;
        }

        setTerms((currentTerms) =>
            currentTerms.map((term) => {
                if (term.term === fromTermCode) {
                    return {
                        ...term,
                        courses: term.courses.filter(
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

    return (
        <>
            <div className="plan-page__header">
                <PageHeader
                    title="Degree Plan"
                    subtitle={
                        `${programRules[plan.program]?.name ?? plan.program} • ` +
                        `Area ${plan.majorArea}`
                    }
                />

                <StatusBadge status={plan.status} />
            </div>

            <PlanChecklist
                requirements={validation.requirements}
                warnings={validation.warnings}
            />

            <PlanBoard
                terms={terms}
                courses={data.courses ?? []}
                onRemoveCourse={removeCourse}
                onMoveCourse={moveCourse}
                onAddCourse={setSelectedTerm}
            />

            <CoursePicker
                open={Boolean(selectedTerm)}
                term={selectedTerm}
                courses={data.courses ?? []}
                offerings={data.offerings ?? []}
                plannedTerms={terms}
                onClose={() => setSelectedTerm(null)}
                onAdd={addCourse}
            />
        </>
    );
}