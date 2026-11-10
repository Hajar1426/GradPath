import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { ACCOUNT_STATUS } from '../../data/statusValues';
import { formatDateTime } from '../../utils/formatDate';
import { labelFor } from '../../utils/auditLabels';

export default function AdminDashboardPage() {
    const { currentUser } = useAuth();
    const { data } = useData();
    const users = data.users;
    const roster = data.studentRoster ?? [];
    const recent = (data.auditEvents ?? []).slice(0, 5);

    const count = (status) => users.filter((u) => u.status === status).length;
    const pending = count(ACCOUNT_STATUS.PENDING);
    const nameOf = (id) => users.find((u) => u.id === id)?.name ?? 'Unknown user';

    const stats = [
        { label: 'All users', value: users.length, to: '/admin/users' },
        { label: 'Active', value: count(ACCOUNT_STATUS.ACTIVE), to: '/admin/users?status=active' },
        { label: 'Pending activation', value: pending, to: '/admin/users?status=pending' },
        { label: 'Disabled', value: count(ACCOUNT_STATUS.DISABLED), to: '/admin/users?status=disabled' },
    ];

    return (
        <main className="page">
            <PageHeader title="Admin dashboard" subtitle={`Welcome, ${currentUser.name}. Here is what needs your attention.`} />

            <div className="quick-actions">
                <Link className="btn" to="/admin/users/new">Add user</Link>
                <Link className="btn btn--ghost" to="/admin/users?status=pending">Pending accounts ({pending})</Link>
            </div>

            <div className="stat-grid">
                {stats.map((stat) => (
                    <Link key={stat.label} className="stat-card" to={stat.to}>
                        <span className="stat-card__value">{stat.value}</span>
                        <span className="stat-card__label">{stat.label}</span>
                    </Link>
                ))}
            </div>

            <p className="hint">
                Approved students with an account: {roster.filter((r) => r.hasAccount).length} of {roster.length}
            </p>

            <h2 className="section-title">Recent activity</h2>
            {recent.length === 0 ? (
                <p className="hint">No activity yet. Account changes will appear here.</p>
            ) : (
                <ul className="activity-list">
                    {recent.map((event) => (
                        <li key={event.id}>
                            <strong>{labelFor(event.action)}</strong>
                            {event.detail ? `: ${event.detail}` : ''}
                            <span className="cell__sub">
                                {event.userId ? nameOf(event.userId) : 'Whole system'} · Done by{' '}
                                {event.actorId ? nameOf(event.actorId) : 'the user'} · {formatDateTime(event.at)}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
            <p className="hint">
                <Link to="/admin/audit">See the full audit log</Link>
            </p>
        </main>
    );
}