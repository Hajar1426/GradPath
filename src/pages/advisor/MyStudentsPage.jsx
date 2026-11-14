import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { DEGREE, PLAN_STATUS } from '../../data/statusValues';
import { DEGREE_LABEL, STUDY_LOAD_LABEL, getStudyLoad } from '../../utils/studyRules';
import { matchesSearch } from '../../utils/matchesSearch';
import { findMyAdvisor, openAlertsFor, planOf } from '../../utils/advisorHelpers';

const NO_PLAN = 'none';

const DEGREE_OPTIONS = [
    { value: 'all', label: 'All degrees' },
    { value: DEGREE.MS, label: DEGREE_LABEL[DEGREE.MS] },
    { value: DEGREE.PHD, label: DEGREE_LABEL[DEGREE.PHD] },
];

const PLAN_OPTIONS = [
    { value: 'all', label: 'All plan statuses' },
    { value: NO_PLAN, label: 'No plan yet' },
    { value: PLAN_STATUS.DRAFT, label: 'Draft' },
    { value: PLAN_STATUS.SUBMITTED, label: 'Submitted (to review)' },
    { value: PLAN_STATUS.CHANGES_REQUESTED, label: 'Changes requested' },
    { value: PLAN_STATUS.APPROVED, label: 'Approved' },
];

// The advisor's list of advisees.
export default function MyStudentsPage() {
    const { currentUser } = useAuth();
    const { data } = useData();
    const [query, setQuery] = useState('');
    const [degree, setDegree] = useState('all');
    const [planStatus, setPlanStatus] = useState('all');
    const [attentionOnly, setAttentionOnly] = useState(false);

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

    // Join each advising record with its plan status, study load and open alerts.
    const myStudents = (data.students ?? [])
        .filter((s) => s.advisorId === advisor.id)
        .map((s) => ({
            ...s,
            planStatus: planOf(data, s.userId)?.status ?? NO_PLAN,
            studyLoad: getStudyLoad(s),
            alertCount: openAlertsFor(data, s.userId).length,
        }));

    const rows = myStudents
        .filter((s) => degree === 'all' || s.degree === degree)
        .filter((s) => planStatus === 'all' || s.planStatus === planStatus)
        .filter((s) => !attentionOnly || s.alertCount > 0 || s.planStatus === PLAN_STATUS.SUBMITTED)
        .filter((s) => matchesSearch(query, s.name, s.studentNumber, s.program, s.email));

    const toReview = myStudents.filter((s) => s.planStatus === PLAN_STATUS.SUBMITTED).length;
    const withAlerts = myStudents.filter((s) => s.alertCount > 0).length;

    const columns = [
        {
            key: 'name',
            header: 'Student',
            sortable: true,
            render: (s) => (
                <>
                    <Link to={`/advisor/students/${s.userId}`} className="cell__link">{s.name ?? s.userId}</Link>
                    <span className="cell__sub">{s.studentNumber}</span>
                </>
            ),
        },
        { key: 'program', header: 'Program', sortable: true },
        { key: 'studyLoad', header: 'Study load', sortable: true, render: (s) => STUDY_LOAD_LABEL[s.studyLoad] },
        {
            key: 'planStatus',
            header: 'Degree plan',
            sortable: true,
            render: (s) => (s.planStatus === NO_PLAN ? <StatusBadge status="none" tone="neutral" label="No plan yet" /> : <StatusBadge status={s.planStatus} />),
        },
        {
            key: 'alertCount',
            header: 'Alerts',
            sortable: true,
            render: (s) => (s.alertCount ? <StatusBadge status="open" tone="danger" label={`${s.alertCount} open`} /> : '—'),
        },
        {
            key: 'actions',
            header: <span className="sr-only">Actions</span>,
            render: (s) => (
                <Link className="btn btn--ghost btn--small" to={`/advisor/students/${s.userId}`} aria-label={`View ${s.name}`}>
                    View
                </Link>
            ),
        },
    ];

    return (
        <main className="page page--plain">
            <div className="panel">
                <PageHeader title="My Students" subtitle="Your advisees, their degree plans and anything that needs your attention." />
                <p className="advisor-summary">
                    <strong>{myStudents.length}</strong> advisees · <strong>{toReview}</strong> plans to review · <strong>{withAlerts}</strong> with open alerts
                </p>
                <div className="filters">
                    <SearchBar value={query} onChange={setQuery} placeholder="Search by name, student ID or program" label="Search students" />
                    <Select label="Degree" options={DEGREE_OPTIONS} value={degree} onChange={(e) => setDegree(e.target.value)} />
                    <Select label="Degree plan" options={PLAN_OPTIONS} value={planStatus} onChange={(e) => setPlanStatus(e.target.value)} />
                    <label className="advisor-check">
                        <input type="checkbox" checked={attentionOnly} onChange={(e) => setAttentionOnly(e.target.checked)} />
                        Needs my attention
                    </label>
                </div>
            </div>

            <div className="panel">
                <DataTable
                    caption="My students"
                    columns={columns}
                    rows={rows}
                    rowKey="userId"
                    emptyTitle={myStudents.length ? 'No students match' : 'No advisees yet'}
                    emptyMessage={myStudents.length ? 'Try a different search or filter.' : 'Students appear here once the coordinator assigns them to you.'}
                />
            </div>
        </main>
    );
}
