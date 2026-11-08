import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable from '../../components/common/DataTable';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';
import { ROLES, ACCOUNT_STATUS } from '../../data/statusValues';
import { generateActivationCode } from '../../utils/activation';
import { matchesSearch } from '../../utils/matchesSearch';

const ROLE_OPTIONS = [
    { value: 'all', label: 'All roles' },
    { value: ROLES.STUDENT, label: 'Student' },
    { value: ROLES.ADVISOR, label: 'Advisor' },
    { value: ROLES.COORDINATOR, label: 'Coordinator' },
    { value: ROLES.ADMIN, label: 'Admin' },
];

const STATUS_OPTIONS = [
    { value: 'all', label: 'All statuses' },
    { value: ACCOUNT_STATUS.ACTIVE, label: 'Active' },
    { value: ACCOUNT_STATUS.PENDING, label: 'Pending' },
    { value: ACCOUNT_STATUS.DISABLED, label: 'Disabled' },
];

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function UserAccountsPage() {
    const { currentUser } = useAuth();
    const { data, updateCollection, addAuditEvent } = useData();
    const { showToast } = useToast();
    const [query, setQuery] = useState('');
    const [role, setRole] = useState('all');
    const [status, setStatus] = useState('all');
    const [toDisable, setToDisable] = useState(null);
    const [resent, setResent] = useState(null);

    const rows = data.users
        .filter((u) => role === 'all' || u.role === role)
        .filter((u) => status === 'all' || u.status === status)
        .filter((u) => matchesSearch(query, u.name, u.email))
        .sort((a, b) => a.name.localeCompare(b.name));

    function changeStatus(user, newStatus, action, message) {
        updateCollection('users', (list) =>
            list.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)),
        );
        addAuditEvent({ userId: user.id, actorId: currentUser.id, action });
        showToast(message);
    }

    function handleResend(user) {
        const code = generateActivationCode();
        updateCollection('users', (list) =>
            list.map((u) => (u.id === user.id ? { ...u, activationCode: code } : u)),
        );
        addAuditEvent({ userId: user.id, actorId: currentUser.id, action: 'activation_resent' });
        setResent({ email: user.email, code });
    }

    function confirmDisable() {
        changeStatus(
            toDisable,
            ACCOUNT_STATUS.DISABLED,
            'account_disabled',
            `${toDisable.name}'s account was disabled.`,
        );
        setToDisable(null);
    }

    const columns = [
        { key: 'name', header: 'Name', sortable: true },
        { key: 'email', header: 'Email', sortable: true },
        { key: 'role', header: 'Role', sortable: true, render: (u) => capitalize(u.role) },
        { key: 'status', header: 'Status', sortable: true, render: (u) => <StatusBadge status={u.status} /> },
        {
            key: 'actions',
            header: 'Actions',
            render: (u) => {
                if (u.id === currentUser.id) return <span className="hint">This is your account</span>;
                return (
                    <div className="table__actions">
                        {u.status === ACCOUNT_STATUS.PENDING && (
                            <Button variant="ghost" aria-label={`Resend activation email to ${u.name}`} onClick={() => handleResend(u)}>
                                Resend activation email
                            </Button>
                        )}
                        {u.status === ACCOUNT_STATUS.ACTIVE && (
                            <Button variant="ghost" aria-label={`Disable ${u.name}`} onClick={() => setToDisable(u)}>
                                Disable
                            </Button>
                        )}
                        {u.status === ACCOUNT_STATUS.DISABLED && (
                            <Button
                                variant="ghost"
                                aria-label={`Enable ${u.name}`}
                                onClick={() =>
                                    changeStatus(u, ACCOUNT_STATUS.ACTIVE, 'account_enabled', `${u.name}'s account was enabled.`)
                                }
                            >
                                Enable
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <main className="page">
            <div className="page__toolbar">
                <PageHeader title="User accounts" subtitle="Search users, check their status and manage access." />
                <Link className="btn" to="/admin/users/new">Add user</Link>
            </div>
            <div className="filters">
                <SearchBar value={query} onChange={setQuery} placeholder="Search by name or email" label="Search users" />
                <Select label="Role" options={ROLE_OPTIONS} value={role} onChange={(e) => setRole(e.target.value)} />
                <Select label="Status" options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} />
            </div>

            <p className="hint" aria-live="polite">
                Showing {rows.length} of {data.users.length} users
            </p>

            {resent && (
                <p className="hint" role="status">
                    Activation email sent again to {resent.email}.{' '}
                    <Link to={`/activate/${resent.code}`}>Open activation email (demo)</Link>
                </p>
            )}

            <DataTable
                caption="User accounts"
                columns={columns}
                rows={rows}
                emptyTitle="No users match"
                emptyMessage="Try a different search or clear the filters."
            />

            <ConfirmationDialog
                open={Boolean(toDisable)}
                title="Disable this account?"
                message={`${toDisable?.name ?? 'This user'} will no longer be able to sign in. You can enable the account again later.`}
                confirmLabel="Disable account"
                variant="danger"
                onConfirm={confirmDisable}
                onCancel={() => setToDisable(null)}
            />
        </main>
    );
}