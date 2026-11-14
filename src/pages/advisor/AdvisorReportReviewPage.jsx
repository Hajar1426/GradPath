import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BackLink from '../../components/common/BackLink';
import Button from '../../components/common/Button';
import Textarea from '../../components/common/Textarea';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import Alert from '../../components/common/Alert';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';
import { ALERT_STATUS, REPORT_RATING, REPORT_STATUS } from '../../data/statusValues';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { findMyAdvisor } from '../../utils/advisorHelpers';
import { newId } from '../../utils/coordinatorHelpers';

// The questions the student answered, in the order they are shown.
const QUESTIONS = [
    { key: 'progress', label: 'Research progress this year' },
    { key: 'coursesCompleted', label: 'Courses completed' },
    { key: 'publications', label: 'Publications and presentations' },
    { key: 'challenges', label: 'Challenges' },
    { key: 'nextSteps', label: 'Plans for next year' },
];

const RATINGS = [
    { value: REPORT_RATING.SATISFACTORY, label: 'Satisfactory', help: 'Progress is on track.' },
    { value: REPORT_RATING.NEEDS_IMPROVEMENT, label: 'Needs improvement', help: 'Some concerns. Agree an action plan with the student.' },
    { value: REPORT_RATING.UNSATISFACTORY, label: 'Unsatisfactory', help: 'Progress is not acceptable. A warning alert is sent to the coordinator.' },
];

const COMMENTS_MIN = 20;

// 'YYYY-MM-DD' for today in local time (the format attentionItems uses).
function todayIso() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// One annual report: read the student's answers and evaluate it.
export default function AdvisorReportReviewPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { data, updateCollection, addNotification } = useData();
    const { showToast } = useToast();
    const [form, setForm] = useState({ rating: '', comments: '', actionPlan: '' });
    const [errors, setErrors] = useState({});
    const [confirming, setConfirming] = useState(false);

    const advisor = findMyAdvisor(data, currentUser);
    // Only this advisor's own students' reports can be opened.
    const report = (data.annualReports ?? []).find((r) => r.id === id && r.advisorId === advisor?.id);

    if (!report) {
        return (
            <main className="page page--plain">
                <div className="panel">
                    <BackLink to="/advisor/reports">← Back to Annual Reports</BackLink>
                    <EmptyState title="Report not found" message="This report does not exist or belongs to another advisor's student." />
                </div>
            </main>
        );
    }

    const student = (data.students ?? []).find((s) => s.userId === report.studentId);
    const studentName = student?.name ?? report.studentId;
    const needsActionPlan = form.rating === REPORT_RATING.NEEDS_IMPROVEMENT || form.rating === REPORT_RATING.UNSATISFACTORY;

    function setField(name, value) {
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    function validate() {
        const found = {};
        if (!form.rating) found.rating = 'Choose a rating.';
        if (form.comments.trim().length < COMMENTS_MIN) found.comments = `Write at least ${COMMENTS_MIN} characters so the student understands the rating.`;
        if (needsActionPlan && !form.actionPlan.trim()) found.actionPlan = 'Describe what the student should do next.';
        return found;
    }

    function handleSubmit(event) {
        event.preventDefault();
        const found = validate();
        setErrors(found);
        if (Object.keys(found).length > 0) {
            showToast('Please fix the highlighted fields.', 'error');
            return;
        }
        // An unsatisfactory rating has consequences, so ask first.
        if (form.rating === REPORT_RATING.UNSATISFACTORY) {
            setConfirming(true);
            return;
        }
        saveEvaluation();
    }

    function saveEvaluation() {
        const evaluation = {
            rating: form.rating,
            comments: form.comments.trim(),
            actionPlan: needsActionPlan ? form.actionPlan.trim() : '',
            evaluatedAt: new Date().toISOString(),
            evaluatedBy: advisor.id,
        };

        // 1. Save the evaluation on the report.
        updateCollection('annualReports', (list) =>
            list.map((r) => (r.id === report.id ? { ...r, status: REPORT_STATUS.EVALUATED, evaluation } : r)),
        );

        // 2. Unsatisfactory: add a warning alert. The coordinator dashboard and the advisor alerts page read these.
        if (form.rating === REPORT_RATING.UNSATISFACTORY) {
            updateCollection('attentionItems', (list) => [
                {
                    id: newId('att'),
                    type: 'report_unsatisfactory',
                    studentId: report.studentId,
                    advisorId: advisor.id,
                    reportId: report.id,
                    status: ALERT_STATUS.OPEN,
                    createdAt: todayIso(),
                },
                ...list,
            ]);
        }

        // 3. Tell the student.
        const ratingLabel = RATINGS.find((r) => r.value === form.rating)?.label;
        addNotification({
            userId: report.studentId,
            title: 'Your annual report was evaluated',
            body: `${advisor.name} rated your ${report.academicYear} report: ${ratingLabel}.`,
            link: '/student/reports',
        });

        setConfirming(false);
        showToast(`Evaluation saved. ${studentName} has been notified.`);
        navigate('/advisor/reports');
    }

    return (
        <main className="page page--plain">
            <div>
                <BackLink to="/advisor/reports">← Back to Annual Reports</BackLink>
            </div>

            <section className="panel" aria-labelledby="report-title">
                <h1 className="page__title" id="report-title">Annual report: {studentName}</h1>
                <p className="advisor-profile__availability">
                    <StatusBadge status={report.status} />
                    <span className="hint">
                        {report.academicYear} · {student?.program ?? ''} · submitted {formatDate(report.submittedAt)}
                    </span>
                </p>
                <dl className="report-answers">
                    {QUESTIONS.map((q) => (
                        <div key={q.key} className="report-answers__item">
                            <dt>{q.label}</dt>
                            <dd>{report.answers?.[q.key] || '—'}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            {report.evaluation ? (
                // Already evaluated: show the result, no form.
                <section className="panel" aria-labelledby="evaluation-title">
                    <h2 className="panel__title" id="evaluation-title">Your evaluation</h2>
                    <p className="advisor-profile__availability">
                        <StatusBadge status={report.evaluation.rating} />
                        <span className="hint">{formatDateTime(report.evaluation.evaluatedAt)}</span>
                    </p>
                    <dl className="report-answers">
                        <div className="report-answers__item">
                            <dt>Comments</dt>
                            <dd>{report.evaluation.comments}</dd>
                        </div>
                        {report.evaluation.actionPlan && (
                            <div className="report-answers__item">
                                <dt>Action plan</dt>
                                <dd>{report.evaluation.actionPlan}</dd>
                            </div>
                        )}
                    </dl>
                </section>
            ) : (
                <form className="panel" onSubmit={handleSubmit} noValidate aria-labelledby="evaluate-title">
                    <h2 className="panel__title" id="evaluate-title">Your evaluation</h2>

                    <fieldset className="rating-group" aria-describedby={errors.rating ? 'rating-error' : undefined}>
                        <legend>Rating *</legend>
                        {RATINGS.map((r) => (
                            <label key={r.value} className={`rating-option ${form.rating === r.value ? 'rating-option--selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="rating"
                                    value={r.value}
                                    checked={form.rating === r.value}
                                    onChange={() => setField('rating', r.value)}
                                />
                                <span>
                                    <strong>{r.label}</strong>
                                    <span className="cell__sub">{r.help}</span>
                                </span>
                            </label>
                        ))}
                        {errors.rating && <p className="error" id="rating-error" role="alert">{errors.rating}</p>}
                    </fieldset>

                    <Textarea
                        label="Comments for the student"
                        required
                        rows={4}
                        value={form.comments}
                        onChange={(e) => setField('comments', e.target.value)}
                        error={errors.comments}
                        hint={`At least ${COMMENTS_MIN} characters. The student sees this.`}
                    />

                    {needsActionPlan && (
                        <Textarea
                            label="Action plan"
                            required
                            rows={3}
                            value={form.actionPlan}
                            onChange={(e) => setField('actionPlan', e.target.value)}
                            error={errors.actionPlan}
                            hint="What should the student do, and by when?"
                        />
                    )}

                    {form.rating === REPORT_RATING.UNSATISFACTORY && (
                        <Alert variant="warning" title="This creates a warning alert">
                            The coordinator will see it on their dashboard, and it appears in your Warning Alerts.
                        </Alert>
                    )}

                    <div className="form-actions">
                        <Button variant="ghost" onClick={() => navigate('/advisor/reports')}>Cancel</Button>
                        <Button type="submit">Submit evaluation</Button>
                    </div>
                </form>
            )}

            <ConfirmationDialog
                open={confirming}
                title="Rate this report unsatisfactory?"
                message={`${studentName} will be notified and a warning alert will be sent to the coordinator. You cannot change the evaluation afterwards.`}
                confirmLabel="Yes, submit"
                variant="danger"
                onConfirm={saveEvaluation}
                onCancel={() => setConfirming(false)}
            />
        </main>
    );
}
