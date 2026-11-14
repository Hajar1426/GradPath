import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import EditOnly from '../../components/common/EditOnly';
import { useData } from '../../hooks/useData';
import { getStudyLoad, DEGREE_LABEL, STUDY_LOAD_LABEL } from '../../utils/studyRules';
import { matchesSearch } from '../../utils/matchesSearch';
import { DEGREE_OPTIONS, STUDY_LOAD_OPTIONS } from '../../utils/coordinatorHelpers';
import { downloadCsv } from '../../utils/downloadCsv';
import { studentRecords } from '../../utils/coordinatorReports';

const ACCOUNT_OPTIONS = [
    { value: 'all', label: 'All students' },
    { value: 'yes', label: 'Has an account' },
    { value: 'no', label: 'No account yet' },
    { value: 'flagged', label: 'Not in latest sheet' },
];

const ADVISOR_OPTIONS = [
    { value: 'all', label: 'Any advisor status' },
    { value: 'has', label: 'Has an advisor' },
    { value: 'none', label: 'Without an advisor' },
];

export default function StudentListPage() {
    const { data } = useData();
    const [params] = useSearchParams();
    const roster = data.studentRoster ?? [];
    const [advisor, setAdvisor] = useState(params.get('advisor') === 'none' ? 'none' : 'all');
    const advisorNames = Object.fromEntries((data.advisors ?? []).map((a) => [a.id, a.name]));
    const [query, setQuery] = useState('');
    const [degree, setDegree] = useState('all');
    const [load, setLoad] = useState('all');
    const [account, setAccount] = useState('all');

    const rows = studentRecords(data)
        .map((r) => ({ ...r, studyLoad: getStudyLoad(r) }))
        .filter((r) => advisor === 'all' || (advisor === 'none' ? !r.advisorId : Boolean(r.advisorId)))
        .filter((r) => degree === 'all' || r.degree === degree)
        .filter((r) => load === 'all' || r.studyLoad === load)
        .filter((r) => {
            if (account === 'yes') return r.hasAccount;
            if (account === 'no') return !r.hasAccount;
            if (account === 'flagged') return r.notInLatestSheet;
            return true;
        })
        .filter((r) => matchesSearch(query, r.name, r.email, r.studentId, r.nationality));

    const columns = [
        {
            key: 'name',
            header: 'Name',
            sortable: true,
            render: (r) => (
                <>
                    {r.name}
                    <span className="cell__sub">{r.email}</span>
                </>
            ),
        },
        { key: 'studentId', header: 'Student ID', sortable: true },
        { key: 'degree', header: 'Degree', sortable: true, render: (r) => DEGREE_LABEL[r.degree] ?? '—' },
        { key: 'nationality', header: 'Nationality', sortable: true },
        {
            key: 'advisorId',
            header: 'Advisor',
            sortable: true,
            sortValue: (r) => advisorNames[r.advisorId] ?? '',
            render: (r) => advisorNames[r.advisorId] ?? <StatusBadge status="missing" tone="warning" label="Missing advisor" />,
        },
        {
            key: 'studyLoad',
            header: 'Study load',
            sortable: true,
            render: (r) => (
                <>
                    {STUDY_LOAD_LABEL[r.studyLoad]}
                    {r.studyLoadOverride && <span className="cell__sub">Set in sheet</span>}
                </>
            ),
        },
        {
            key: 'hasAccount',
            header: 'Account',
            sortable: true,
            render: (r) => (
                <>
                    {r.hasAccount ? <StatusBadge status="active" label="Signed up" /> : <StatusBadge status="pending" label="Not signed up" />}
                    {r.notInLatestSheet && <span className="cell__sub">Not in latest sheet</span>}
                </>
            ),
        },
    ];

    function handleDownload() {
        downloadCsv('approved-students.csv', [
            ['Student ID', 'Name', 'Email', 'Degree', 'Nationality', 'Advisor', 'Study load', 'Has account', 'In latest sheet'],
            ...rows.map((r) => [
                r.studentId,
                r.name,
                r.email,
                DEGREE_LABEL[r.degree] ?? '',
                r.nationality,
                advisorNames[r.advisorId] ?? 'None',
                STUDY_LOAD_LABEL[r.studyLoad],
                r.hasAccount ? 'Yes' : 'No',
                r.notInLatestSheet ? 'No' : 'Yes',
            ]),
        ]);
    }

    return (
        <main className="page">
            <div className="page__toolbar">
                <PageHeader title="Approved students" subtitle="Only students on this list can create a GradPath account." />
                <div className="table__actions">
                    <Button variant="ghost" onClick={handleDownload} disabled={rows.length === 0}>Download CSV</Button>
                    <EditOnly>
                        <Link className="btn" to="/coordinator/import">Import list</Link>
                    </EditOnly>
                </div>
            </div>
            <div className="filters">
                <SearchBar value={query} onChange={setQuery} placeholder="Search name, email, ID or nationality" label="Search students" />
                <Select label="Degree" options={DEGREE_OPTIONS} value={degree} onChange={(e) => setDegree(e.target.value)} />
                <Select label="Study load" options={STUDY_LOAD_OPTIONS} value={load} onChange={(e) => setLoad(e.target.value)} />
                <Select label="Account" options={ACCOUNT_OPTIONS} value={account} onChange={(e) => setAccount(e.target.value)} />
                <Select label="Advisor" options={ADVISOR_OPTIONS} value={advisor} onChange={(e) => setAdvisor(e.target.value)} />
            </div>
            <p className="hint" aria-live="polite">
                Showing {rows.length} of {roster.length} students · {roster.filter((r) => r.hasAccount).length} have signed up
            </p>
            <DataTable
                caption="Approved students"
                columns={columns}
                rows={rows}
                emptyTitle={roster.length ? 'No students match' : 'The list is empty'}
                emptyMessage={roster.length ? 'Try a different search or clear the filters.' : 'Import the approved student list to get started.'}
            />
        </main>
    );
}
