import { Link, useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import EditOnly from '../../components/common/EditOnly';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import StatCard from '../../components/coordinator/StatCard';
import { DownloadIcon } from '../../components/coordinator/Icons';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';
import { useReadOnly } from '../../hooks/useReadOnly';
import { ALERT_STATUS, AUTHORIZATION_STATUS, PUBLISH_STATUS, ROLES } from '../../data/statusValues';
import { ANNOUNCEMENT_CATEGORIES } from '../../data/announcements';
import {
    ISSUE_LABEL,
    authorizationSheet,
    capacitySheet,
    exceptionSheet,
    studentRecords,
    studentsNeedingAttention,
} from '../../utils/coordinatorReports';
import { downloadXlsx } from '../../utils/downloadXlsx';
import { formatDate } from '../../utils/formatDate';

// Key dates for the current term. Replace with the real academic calendar.
const KEY_DATES = [
    { date: '20 Nov', text: 'Term 262 degree plans due for advisor review' },
    { date: '25 Nov', text: 'Advisor capacity review meeting' },
    { date: '30 Nov', text: 'Annual progress reports due' },
];

const CATEGORY_LABEL = Object.fromEntries(ANNOUNCEMENT_CATEGORIES.map((c) => [c.value, c.label]));
const ROLE_TITLE = { [ROLES.COORDINATOR]: 'Program Coordinator', [ROLES.DEAN]: 'College Dean', [ROLES.CHAIRPERSON]: 'Department Chairperson' };

// A list that exists but is not an array means the data is damaged: the card shows its own error.
function list(value) {
    if (value === undefined) return [];
    if (!Array.isArray(value)) throw new Error('Damaged list');
    return value;
}

function greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

export default function CoordinatorDashboardPage() {
    const { currentUser } = useAuth();
    const { data, updateCollection } = useData();
    const { showToast } = useToast();
    const readOnly = useReadOnly();
    const [params, setParams] = useSearchParams();
    // Demo of a single failing card: /coordinator?demoError=advisor
    const broken = params.get('demoError');
    const guard = (name) => {
        if (broken === name) throw new Error('Demo error');
    };
    const retry = () => setParams({});

    const cards = [
        {
            id: 'students',
            label: 'Graduate students',
            to: '/coordinator/students',
            compute: () => {
                guard('students');
                const roster = list(data.studentRoster);
                return { value: roster.length, note: `${roster.filter((r) => r.hasAccount).length} signed up on GradPath` };
            },
        },
        {
            id: 'advisor',
            label: 'Without an advisor',
            tone: 'orange',
            to: '/coordinator/students?advisor=none',
            action: 'View students',
            compute: () => {
                guard('advisor');
                list(data.students);
                return { value: studentRecords(data).filter((r) => !r.advisorId).length };
            },
        },
        {
            id: 'attention',
            label: 'Need attention',
            tone: 'red',
            to: '#attention',
            action: 'View students',
            compute: () => {
                guard('attention');
                return { value: list(data.attentionItems).filter((a) => a.status !== ALERT_STATUS.RESOLVED).length };
            },
        },
        {
            id: 'requests',
            label: 'Pending authorizations',
            tone: 'maroon',
            to: '/coordinator/offerings?tab=requests',
            action: 'Review requests',
            compute: () => {
                guard('requests');
                return { value: list(data.courseAuthorizations).filter((r) => r.status === AUTHORIZATION_STATUS.PENDING).length };
            },
        },
    ];

    const attention = studentsNeedingAttention(data);
    const announcements = (Array.isArray(data.announcements) ? data.announcements : [])
        .filter((a) => a.status === PUBLISH_STATUS.PUBLISHED)
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        .slice(0, 3);

    function resolveItem(row) {
        updateCollection('attentionItems', (items) =>
            items.map((a) => (a.id === row.attentionId ? { ...a, status: ALERT_STATUS.RESOLVED, resolvedAt: new Date().toISOString() } : a)),
        );
        showToast(`${row.name} marked as handled.`);
    }

    const today = new Date().toISOString().slice(0, 10);
    const downloads = [
        { name: 'Exception Report.xlsx', make: () => downloadXlsx(`Exception Report ${today}.xlsx`, { Exceptions: exceptionSheet(data) }) },
        { name: 'Advisor Capacity.xlsx', make: () => downloadXlsx(`Advisor Capacity ${today}.xlsx`, { Capacity: capacitySheet(data) }) },
        { name: 'Course Authorizations.xlsx', make: () => downloadXlsx(`Course Authorizations ${today}.xlsx`, { Authorizations: authorizationSheet(data) }) },
    ];

    function download(file) {
        try {
            file.make();
            showToast(`${file.name} downloaded.`);
        } catch {
            showToast('The file could not be created. Try again.', 'error');
        }
    }

    const columns = [
        { key: 'name', header: 'Student', sortable: true },
        { key: 'studentId', header: 'ID', sortable: true },
        { key: 'program', header: 'Program', sortable: true },
        {
            key: 'issue',
            header: 'Issue',
            sortable: true,
            render: (r) => (
                <StatusBadge
                    status={r.issue}
                    tone={r.issue === 'missing_advisor' ? 'warning' : 'danger'}
                    label={ISSUE_LABEL[r.issue]}
                />
            ),
        },
    ];
    if (!readOnly) {
        columns.push({
            key: 'actions',
            header: <span className="sr-only">Actions</span>,
            render: (r) =>
                r.attentionId ? (
                    <Button variant="ghost" onClick={() => resolveItem(r)} aria-label={`Mark ${r.name} as handled`}>
                        Mark handled
                    </Button>
                ) : (
                    <Link className="btn btn--ghost" to="/coordinator/capacity">Assign</Link>
                ),
        });
    }

    return (
        <main className="page page--plain">
            <h1 className="greeting">
                {greeting()}, {currentUser.name}
            </h1>

            <div className="home-grid">
                <div className="home-grid__main">
                    <div className="stat-grid stat-grid--four">
                        {cards.map((card) => (
                            <StatCard key={card.id} {...card} onRetry={retry} />
                        ))}
                    </div>

                    <section className="panel" aria-labelledby="qa-title">
                        <h2 className="panel__title" id="qa-title">Quick Actions</h2>
                        <div className="quick-actions quick-actions--panel">
                            <EditOnly>
                                <Link className="btn" to="/coordinator/import">Import students (Excel)</Link>
                                <Link className="btn btn--ghost" to="/coordinator/capacity">Manage advisor capacity</Link>
                                <Link className="btn btn--ghost" to="/coordinator/offerings?tab=requests">Review authorization requests</Link>
                            </EditOnly>
                            <Button variant="ghost" onClick={() => download(downloads[0])}>Generate exception report</Button>
                        </div>
                    </section>

                    <section className="panel" id="attention" aria-labelledby="attention-title" tabIndex={-1}>
                        <h2 className="panel__title" id="attention-title">Students Needing Attention</h2>
                        <DataTable
                            caption="Students needing attention"
                            columns={columns}
                            rows={attention}
                            pageSize={5}
                            emptyTitle="Nobody needs attention"
                            emptyMessage="Unsatisfactory reports and students without an advisor appear here."
                        />
                    </section>
                </div>

                <aside className="home-grid__side">
                    <div className="profile-card">
                        <p className="profile-card__name">{currentUser.name}</p>
                        <p className="profile-card__role">{ROLE_TITLE[currentUser.role] ?? 'Coordinator'}</p>
                    </div>

                    <section className="panel" aria-labelledby="ann-title">
                        <h2 className="panel__title" id="ann-title">Announcements</h2>
                        {announcements.length === 0 ? (
                            <p className="hint">No announcements yet.</p>
                        ) : (
                            <ul className="side-list">
                                {announcements.map((a) => (
                                    <li key={a.id}>
                                        <span className={`tag tag--${a.category ?? 'general'}`}>{CATEGORY_LABEL[a.category] ?? 'General'}</span>
                                        <Link to={`/coordinator/announcements/${a.id}`} className="side-list__title">{a.title}</Link>
                                        <span className="cell__sub">{formatDate(a.publishedAt)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <Link className="panel__more" to="/coordinator/announcements">All announcements</Link>
                    </section>

                    <section className="panel" aria-labelledby="dl-title">
                        <h2 className="panel__title" id="dl-title">Download files</h2>
                        <ul className="download-list">
                            {downloads.map((file) => (
                                <li key={file.name}>
                                    <button type="button" className="download-list__item" onClick={() => download(file)}>
                                        <span>{file.name}</span>
                                        <DownloadIcon />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="panel" aria-labelledby="dates-title">
                        <h2 className="panel__title" id="dates-title">Key dates</h2>
                        <ul className="date-list">
                            {KEY_DATES.map((d) => (
                                <li key={d.text}>
                                    <span className="date-list__date">{d.date}</span>
                                    <span>{d.text}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </aside>
            </div>
        </main>
    );
}
