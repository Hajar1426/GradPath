import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Tabs from '../../components/common/Tabs';
import SearchBar from '../../components/common/SearchBar';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { REPORT_STATUS } from '../../data/statusValues';
import { formatDate } from '../../utils/formatDate';
import { matchesSearch } from '../../utils/matchesSearch';
import { findMyAdvisor } from '../../utils/advisorHelpers';

// Annual progress reports from the advisor's students: what is waiting and what is done.
export default function AdvisorReportsPage() {
    const { currentUser } = useAuth();
    const { data } = useData();
    const [tab, setTab] = useState('waiting');
    const [query, setQuery] = useState('');

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

    // Name of a student from the advising records.
    const nameOf = (userId) => (data.students ?? []).find((s) => s.userId === userId)?.name ?? userId;

    // Only reports from this advisor's students that have been sent (drafts stay private to the student).
    const mine = (data.annualReports ?? [])
        .filter((r) => r.advisorId === advisor.id && r.status !== REPORT_STATUS.DRAFT)
        .map((r) => ({ ...r, studentName: nameOf(r.studentId) }));

    const waiting = mine.filter((r) => r.status === REPORT_STATUS.SUBMITTED);
    const evaluated = mine.filter((r) => r.status === REPORT_STATUS.EVALUATED);

    const tabs = [
        { id: 'waiting', label: `To evaluate (${waiting.length})` },
        { id: 'evaluated', label: `Evaluated (${evaluated.length})` },
    ];

    const rows = (tab === 'waiting' ? waiting : evaluated).filter((r) => matchesSearch(query, r.studentName, r.academicYear));

    const columns = [
        {
            key: 'studentName',
            header: 'Student',
            sortable: true,
            render: (r) => <Link className="cell__link" to={`/advisor/reports/${r.id}`}>{r.studentName}</Link>,
        },
        { key: 'academicYear', header: 'Academic year', sortable: true },
        { key: 'submittedAt', header: 'Submitted', sortable: true, render: (r) => formatDate(r.submittedAt) },
        {
            key: 'rating',
            header: 'Rating',
            sortable: true,
            sortValue: (r) => r.evaluation?.rating ?? '',
            render: (r) => (r.evaluation ? <StatusBadge status={r.evaluation.rating} /> : <StatusBadge status={r.status} />),
        },
        {
            key: 'actions',
            header: <span className="sr-only">Actions</span>,
            render: (r) => (
                <Link className={`btn btn--small ${r.evaluation ? 'btn--ghost' : ''}`} to={`/advisor/reports/${r.id}`} aria-label={`${r.evaluation ? 'View' : 'Evaluate'} report from ${r.studentName}`}>
                    {r.evaluation ? 'View' : 'Evaluate'}
                </Link>
            ),
        },
    ];

    return (
        <main className="page page--plain">
            <div className="panel">
                <PageHeader title="Annual Reports" subtitle="Read your students' yearly progress reports and give your evaluation." />
                <div className="advisor-tabs">
                    <Tabs tabs={tabs} active={tab} onChange={setTab} label="Report status" />
                </div>
                <div className="filters">
                    <SearchBar value={query} onChange={setQuery} placeholder="Search by student or year" label="Search reports" />
                </div>
            </div>

            <div className="panel" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
                <DataTable
                    caption={tab === 'waiting' ? 'Reports to evaluate' : 'Evaluated reports'}
                    columns={columns}
                    rows={rows}
                    emptyTitle={tab === 'waiting' ? 'Nothing to evaluate' : 'No evaluated reports yet'}
                    emptyMessage={tab === 'waiting' ? 'You are all caught up. New reports appear here when students submit them.' : 'Reports you evaluate appear here.'}
                />
            </div>
        </main>
    );
}