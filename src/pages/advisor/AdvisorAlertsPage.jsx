import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Tabs from '../../components/common/Tabs';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Textarea from '../../components/common/Textarea';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';
import { ALERT_SEVERITY, ALERT_STATUS } from '../../data/statusValues';
import { ISSUE_LABEL } from '../../utils/coordinatorReports';
import { formatDate } from '../../utils/formatDate';
import { getMinCourses } from '../../utils/studyRules';
import { CURRENT_TERM, findMyAdvisor, planOf, plannedCourses } from '../../utils/advisorHelpers';

const NOTE_MIN = 10;

// Every stored alert type gets a severity. An unsatisfactory report is the most serious.
const SEVERITY_BY_TYPE = {
    report_unsatisfactory: ALERT_SEVERITY.HIGH,
};

// Checks worked out from the data every time the page opens. They are not stored,
// so they disappear by themselves once the student fixes the problem.
function automaticChecks(data, myStudents) {
    const checks = [];
    myStudents.forEach((s) => {
        const plan = planOf(data, s.userId);
        if (!plan) {
            checks.push({ id: `noplan-${s.userId}`, student: s, severity: ALERT_SEVERITY.MEDIUM, text: 'Has not started a degree plan.' });
            return;
        }
        const count = plannedCourses(plan, CURRENT_TERM).length;
        const min = getMinCourses(s);
        if (count < min) {
            checks.push({
                id: `load-${s.userId}`,
                student: s,
                severity: ALERT_SEVERITY.MEDIUM,
                text: `Planned ${count} course${count === 1 ? '' : 's'} for Term ${CURRENT_TERM}. The minimum is ${min}.`,
            });
        }
    });
    return checks;
}

// Warning alerts about the advisor's students: follow up, then resolve with a note.
export default function AdvisorAlertsPage() {
    const { currentUser } = useAuth();
    const { data, updateCollection } = useData();
    const { showToast } = useToast();
    const [tab, setTab] = useState('open');
    const [resolving, setResolving] = useState(null); // the alert being resolved, or null
    const [note, setNote] = useState('');
    const [noteError, setNoteError] = useState('');

    const advisor = findMyAdvisor(data, currentUser);
    if (!advisor) {
        return (
            <main className="page page--plain">
                <div className="panel">
                    <EmptyState title="Your advisor profile is not set up yet" message="Ask the coordinator to link your account to an advisor profile." />
                </div>
            </main>
        );
    }

    const myStudents = (data.students ?? []).filter((s) => s.advisorId === advisor.id);
    const nameOf = (userId) => myStudents.find((s) => s.userId === userId)?.name ?? userId;

    // Stored alerts for this advisor, newest first.
    const alerts = (data.attentionItems ?? [])
        .filter((a) => a.advisorId === advisor.id)
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    const active = alerts.filter((a) => a.status !== ALERT_STATUS.RESOLVED);
    const resolved = alerts.filter((a) => a.status === ALERT_STATUS.RESOLVED);
    const checks = automaticChecks(data, myStudents);

    const tabs = [
        { id: 'open', label: `Open (${active.length})` },
        { id: 'resolved', label: `Resolved (${resolved.length})` },
    ];
    const shown = tab === 'open' ? active : resolved;

    // Change one alert and keep everything else about it.
    function updateAlert(id, changes) {
        updateCollection('attentionItems', (list) => list.map((a) => (a.id === id ? { ...a, ...changes } : a)));
    }

    function startWorking(alert) {
        updateAlert(alert.id, { status: ALERT_STATUS.IN_PROGRESS, updatedAt: new Date().toISOString() });
        showToast(`Marked as in progress for ${nameOf(alert.studentId)}.`);
    }

    function openResolve(alert) {
        setResolving(alert);
        setNote('');
        setNoteError('');
    }

    function confirmResolve() {
        if (note.trim().length < NOTE_MIN) {
            setNoteError(`Write at least ${NOTE_MIN} characters about what was done.`);
            return;
        }
        updateAlert(resolving.id, {
            status: ALERT_STATUS.RESOLVED,
            resolvedAt: new Date().toISOString().slice(0, 10),
            resolutionNote: note.trim(),
            resolvedBy: advisor.id,
        });
        showToast(`Alert for ${nameOf(resolving.studentId)} resolved.`);
        setResolving(null);
    }

    return (
        <main className="page page--plain">
            <div className="panel">
                <PageHeader title="Warning Alerts" subtitle="Students who need your follow-up. Resolve an alert once you have acted on it." />
                <div className="advisor-tabs">
                    <Tabs tabs={tabs} active={tab} onChange={setTab} label="Alert status" />
                </div>
            </div>

            <section className="panel" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
                {shown.length === 0 ? (
                    <EmptyState
                        title={tab === 'open' ? 'No open alerts' : 'No resolved alerts yet'}
                        message={tab === 'open' ? 'All clear. An unsatisfactory annual report creates an alert here.' : 'Alerts you resolve are kept here.'}
                    />
                ) : (
                    <ul className="alert-cards">
                        {shown.map((a) => (
                            <li key={a.id} className="alert-card">
                                <div className="alert-card__head">
                                    <Link className="cell__link" to={`/advisor/students/${a.studentId}`}>{nameOf(a.studentId)}</Link>
                                    <StatusBadge status={SEVERITY_BY_TYPE[a.type] ?? ALERT_SEVERITY.MEDIUM} label={`${SEVERITY_BY_TYPE[a.type] === ALERT_SEVERITY.HIGH ? 'High' : 'Medium'} priority`} />
                                    <StatusBadge status={a.status} />
                                </div>
                                <p className="alert-card__text">
                                    {ISSUE_LABEL[a.type] ?? a.type} · since {formatDate(a.createdAt)}
                                    {a.reportId && (
                                        <>
                                            {' · '}
                                            <Link to={`/advisor/reports/${a.reportId}`}>View report</Link>
                                        </>
                                    )}
                                </p>
                                {a.status === ALERT_STATUS.RESOLVED ? (
                                    <p className="alert-card__note">
                                        <strong>Resolved {formatDate(a.resolvedAt)}:</strong> {a.resolutionNote || 'No note.'}
                                    </p>
                                ) : (
                                    <div className="alert-card__actions">
                                        {a.status === ALERT_STATUS.OPEN && (
                                            <Button variant="ghost" className="btn--small" onClick={() => startWorking(a)}>Mark in progress</Button>
                                        )}
                                        <Button className="btn--small" onClick={() => openResolve(a)}>Resolve</Button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="panel" aria-labelledby="checks-title">
                <h2 className="panel__title" id="checks-title">Automatic checks</h2>
                <p className="hint">Worked out from your students' degree plans. They disappear once the student fixes the plan.</p>
                {checks.length === 0 ? (
                    <p className="advisor-profile__text">Every advisee has a plan that meets the minimum study load.</p>
                ) : (
                    <ul className="alert-cards">
                        {checks.map((c) => (
                            <li key={c.id} className="alert-card">
                                <div className="alert-card__head">
                                    <Link className="cell__link" to={`/advisor/students/${c.student.userId}`}>{c.student.name}</Link>
                                    <StatusBadge status={c.severity} label="Medium priority" />
                                </div>
                                <p className="alert-card__text">{c.text}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <Modal
                open={Boolean(resolving)}
                title="Resolve alert"
                onClose={() => setResolving(null)}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setResolving(null)}>Cancel</Button>
                        <Button onClick={confirmResolve}>Resolve alert</Button>
                    </>
                }
            >
                {resolving && (
                    <>
                        <p className="advisor-profile__text">
                            {nameOf(resolving.studentId)}: {ISSUE_LABEL[resolving.type] ?? resolving.type}
                        </p>
                        <Textarea
                            label="What was done?"
                            required
                            rows={3}
                            value={note}
                            onChange={(e) => {
                                setNote(e.target.value);
                                setNoteError('');
                            }}
                            error={noteError}
                            hint="For example: met the student and agreed a new study plan."
                            data-autofocus
                        />
                    </>
                )}
            </Modal>
        </main>
    );
}