import { Link, useParams } from 'react-router-dom';
import BackLink from '../../components/common/BackLink';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { DEGREE_LABEL, STUDY_LOAD_LABEL, getMinCourses, getStudyLoad } from '../../utils/studyRules';
import { formatDate } from '../../utils/formatDate';
import { CURRENT_TERM, findMyAdvisor, openAlertsFor, planOf, plannedCourses, planReviewPath } from '../../utils/advisorHelpers';

const ISSUE_LABEL = {
    report_unsatisfactory: 'Unsatisfactory annual report',
};

// One advisee in detail: contact, degree plan summary and open alerts.
// The address is /advisor/students/:userId, for example /advisor/students/u-student-1.
export default function AdvisorStudentDetailPage() {
    const { userId } = useParams();
    const { currentUser } = useAuth();
    const { data } = useData();

    const advisor = findMyAdvisor(data, currentUser);
    // Only show students who belong to this advisor, even if someone types another id in the address.
    const student = (data.students ?? []).find((s) => s.userId === userId && s.advisorId === advisor?.id);

    if (!student) {
        return (
            <main className="page page--plain">
                <div className="panel">
                    <BackLink to="/advisor/students">← Back to My Students</BackLink>
                    <EmptyState title="Student not found" message="This student is not one of your advisees." />
                </div>
            </main>
        );
    }

    const plan = planOf(data, student.userId);
    const thisTerm = plannedCourses(plan, CURRENT_TERM);
    const minCourses = getMinCourses(student);
    const alerts = openAlertsFor(data, student.userId);
    const emailLink = `mailto:${student.email}?subject=${encodeURIComponent('GradPath: message from your advisor')}`;

    return (
        <main className="page page--plain">
            <div>
                <BackLink to="/advisor/students">← Back to My Students</BackLink>
            </div>

            <div className="advisor-profile">
                {/* Left: who the student is */}
                <section className="panel advisor-card" aria-labelledby="student-name">
                    <div className="advisor-card__header">
                        <h1 className="advisor-card__name" id="student-name">{student.name}</h1>
                        <p className="advisor-card__degree">{student.program}</p>
                    </div>
                    <div className="advisor-card__body">
                        <dl className="detail-list detail-list--tight">
                            <dt>Student ID</dt><dd>{student.studentNumber ?? '—'}</dd>
                            <dt>Degree</dt><dd>{DEGREE_LABEL[student.degree] ?? '—'}</dd>
                            <dt>Study load</dt><dd>{STUDY_LOAD_LABEL[getStudyLoad(student)]}</dd>
                            <dt>Started</dt><dd>{student.startTerm ? `Term ${student.startTerm}` : '—'}</dd>
                            <dt>Email</dt><dd><a href={`mailto:${student.email}`}>{student.email}</a></dd>
                        </dl>
                        <a className="btn advisor-card__email" href={emailLink}>Email student</a>
                    </div>
                </section>

                {/* Right: plan and alerts */}
                <div className="advisor-profile__main">
                    <section className="panel" aria-labelledby="plan-title">
                        <h2 className="panel__title" id="plan-title">Degree plan</h2>
                        {plan ? (
                            <>
                                <p className="advisor-profile__availability">
                                    <StatusBadge status={plan.status} />
                                    {plan.updatedAt && <span className="hint">Last updated {formatDate(plan.updatedAt)}</span>}
                                </p>
                                <p className="advisor-profile__text">
                                    Term {CURRENT_TERM}: {thisTerm.length ? thisTerm.join(', ') : 'no courses planned yet'}
                                </p>
                                {thisTerm.length < minCourses && (
                                    <Alert variant="warning" title="Below the minimum study load">
                                        {`A ${STUDY_LOAD_LABEL[getStudyLoad(student)].toLowerCase()} student should plan at least ${minCourses} course${minCourses > 1 ? 's' : ''} per semester. This plan has ${thisTerm.length} for Term ${CURRENT_TERM}.`}
                                    </Alert>
                                )}
                                <Link className="btn btn--ghost advisor-detail__action" to={planReviewPath(student.userId)}>View plan</Link>
                            </>
                        ) : (
                            <EmptyState title="No degree plan yet" message="The student has not started a plan. You can email them a reminder." />
                        )}
                    </section>

                    <section className="panel" aria-labelledby="alerts-title">
                        <h2 className="panel__title" id="alerts-title">Open warning alerts</h2>
                        {alerts.length ? (
                            <ul className="advisor-alert-list">
                                {alerts.map((a) => (
                                    <li key={a.id}>
                                        <StatusBadge status={a.status} />
                                        <span>{ISSUE_LABEL[a.type] ?? a.type}</span>
                                        <span className="hint">since {formatDate(a.createdAt)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="hint">No open alerts for this student.</p>
                        )}
                        <Link className="advisor-detail__link" to="/advisor/alerts">Go to Warning Alerts →</Link>
                    </section>
                </div>
            </div>
        </main>
    );
}