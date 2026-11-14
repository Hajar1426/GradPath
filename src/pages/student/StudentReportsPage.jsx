import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Textarea from '../../components/common/Textarea';
import StatusBadge from '../../components/common/StatusBadge';
import Alert from '../../components/common/Alert';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';
import { REPORT_STATUS } from '../../data/statusValues';
import { academicCalendar } from '../../data/academicCalendar';
import { CURRENT_ACADEMIC_YEAR, REPORT_QUESTIONS } from '../../utils/advisorHelpers';
import { newId } from '../../utils/coordinatorHelpers';
import { todayIso } from '../../utils/dateHelpers';
import { formatDate, formatDateTime } from '../../utils/formatDate';

const ANSWER_MIN = 20;
const ANSWER_MAX = 1500;

// The calendar entry that holds the report deadline.
const DUE_DATE = academicCalendar.find((d) => d.id === 'cal-1')?.date;

function emptyAnswers() {
    return Object.fromEntries(REPORT_QUESTIONS.map((q) => [q.key, '']));
}

// Required answers need at least ANSWER_MIN characters. Every answer has a maximum length.
function validate(answers) {
    const errors = {};
    REPORT_QUESTIONS.forEach((q) => {
        const text = answers[q.key].trim();
        if (q.required && text.length < ANSWER_MIN) errors[q.key] = `Write at least ${ANSWER_MIN} characters.`;
        if (text.length > ANSWER_MAX) errors[q.key] = `Keep this under ${ANSWER_MAX} characters.`;
    });
    return errors;
}

// Read-only list of the student's answers (after submitting).
function Answers({ answers }) {
    return (
        <dl className="report-answers">
            {REPORT_QUESTIONS.map((q) => (
                <div key={q.key} className="report-answers__item">
                    <dt>{q.label}</dt>
                    <dd>{answers?.[q.key] || '—'}</dd>
                </div>
            ))}
        </dl>
    );
}

// The student writes this year's annual progress report, saves drafts, submits it and reads the evaluation.
export default function StudentReportsPage() {
    const { currentUser } = useAuth();
    const { data, updateCollection, addNotification } = useData();
    const { showToast } = useToast();

    const record = (data.students ?? []).find((s) => s.userId === currentUser?.id);
    const advisor = record?.advisorId ? (data.advisors ?? []).find((a) => a.id === record.advisorId) : undefined;

    const myReports = (data.annualReports ?? []).filter((r) => r.studentId === currentUser?.id);
    const report = myReports.find((r) => r.academicYear === CURRENT_ACADEMIC_YEAR);
    const previous = myReports.filter((r) => r.academicYear !== CURRENT_ACADEMIC_YEAR);

    const [answers, setAnswers] = useState(() => ({ ...emptyAnswers(), ...(report?.answers ?? {}) }));
    const [errors, setErrors] = useState({});
    const [confirming, setConfirming] = useState(false);

    const editable = !report || report.status === REPORT_STATUS.DRAFT;
    const overdue = DUE_DATE && todayIso() > DUE_DATE && editable;

    function setAnswer(key, value) {
        setAnswers((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
    }

    // Insert the report the first time, update it after that. Returns nothing; the data box re-renders the page.
    function saveReport(changes) {
        const trimmed = Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, v.trim()]));
        if (report) {
            updateCollection('annualReports', (list) =>
                list.map((r) => (r.id === report.id ? { ...r, ...changes, answers: trimmed } : r)),
            );
        } else {
            updateCollection('annualReports', (list) => [
                ...list,
                {
                    id: newId('rep'),
                    studentId: currentUser.id,
                    advisorId: record?.advisorId ?? null,
                    academicYear: CURRENT_ACADEMIC_YEAR,
                    submittedAt: null,
                    evaluation: null,
                    ...changes,
                    answers: trimmed,
                },
            ]);
        }
    }

    function saveDraft() {
        saveReport({ status: REPORT_STATUS.DRAFT });
        showToast('Draft saved. Only you can see it.');
    }

    function handleSubmit(event) {
        event.preventDefault();
        const found = validate(answers);
        setErrors(found);
        if (Object.keys(found).length > 0) {
            showToast('Please complete the highlighted answers.', 'error');
            return;
        }
        setConfirming(true);
    }

    function confirmSubmit() {
        // The advisor at the moment of submitting gets the report.
        saveReport({ status: REPORT_STATUS.SUBMITTED, submittedAt: new Date().toISOString(), advisorId: advisor.id });
        if (advisor.userId) {
            addNotification({
                userId: advisor.userId,
                title: 'New report submitted',
                body: `${record?.name ?? currentUser.name} submitted an annual progress report.`,
                link: '/advisor/reports',
            });
        }
        setConfirming(false);
        showToast(`Report submitted to ${advisor.name}.`);
    }

    return (
        <main className="page page--plain">
            <div className="panel">
                <PageHeader
                    title="Annual Report"
                    subtitle={`Your progress report for ${CURRENT_ACADEMIC_YEAR}. Your advisor reads it and gives an evaluation.`}
                />
                <p className="advisor-profile__availability">
                    <StatusBadge status={report ? report.evaluation?.rating ?? report.status : 'none'} label={report ? undefined : 'Not started'} tone={report ? undefined : 'neutral'} />
                    {DUE_DATE && <span className="hint">Due {formatDate(DUE_DATE)}</span>}
                    {report?.submittedAt && <span className="hint">Submitted {formatDateTime(report.submittedAt)}</span>}
                </p>
            </div>

            {editable ? (
                <form className="panel" onSubmit={handleSubmit} noValidate aria-labelledby="report-form-title">
                    <h2 className="panel__title" id="report-form-title">Your answers</h2>
                    {overdue && (
                        <Alert variant="warning" title="The deadline has passed">
                            Submit as soon as you can and let your advisor know.
                        </Alert>
                    )}
                    {!advisor && (
                        <Alert variant="info" title="You need an advisor to submit">
                            You can write and save a draft now. Once an advisor is assigned you can submit it.{' '}
                            <Link to="/student/advisors">Browse CCM Faculty</Link>
                        </Alert>
                    )}
                    {REPORT_QUESTIONS.map((q) => (
                        <Textarea
                            key={q.key}
                            label={q.label}
                            required={q.required}
                            rows={4}
                            value={answers[q.key]}
                            onChange={(e) => setAnswer(q.key, e.target.value)}
                            error={errors[q.key]}
                            hint={`${q.hint} ${answers[q.key].length} / ${ANSWER_MAX}`}
                        />
                    ))}
                    <div className="form-actions">
                        <Button variant="ghost" onClick={saveDraft}>Save draft</Button>
                        <Button type="submit" disabled={!advisor}>Submit to advisor</Button>
                    </div>
                </form>
            ) : (
                <section className="panel" aria-labelledby="answers-title">
                    <h2 className="panel__title" id="answers-title">Your answers</h2>
                    <Answers answers={report.answers} />
                </section>
            )}

            {report?.status === REPORT_STATUS.SUBMITTED && (
                <section className="panel">
                    <p className="advisor-profile__text">Waiting for {advisor?.name ?? 'your advisor'} to evaluate your report. You will get a notification.</p>
                </section>
            )}

            {report?.evaluation && (
                <section className="panel" aria-labelledby="evaluation-title">
                    <h2 className="panel__title" id="evaluation-title">Advisor's evaluation</h2>
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
            )}

            {previous.length > 0 && (
                <section className="panel" aria-labelledby="previous-title">
                    <h2 className="panel__title" id="previous-title">Previous reports</h2>
                    <ul className="advisor-alert-list">
                        {previous.map((r) => (
                            <li key={r.id}>
                                <strong>{r.academicYear}</strong>
                                <StatusBadge status={r.evaluation?.rating ?? r.status} />
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <ConfirmationDialog
                open={confirming}
                title="Submit your annual report?"
                message={`It will be sent to ${advisor?.name ?? 'your advisor'}. You cannot edit it after submitting.`}
                confirmLabel="Submit"
                onConfirm={confirmSubmit}
                onCancel={() => setConfirming(false)}
            />
        </main>
    );
}