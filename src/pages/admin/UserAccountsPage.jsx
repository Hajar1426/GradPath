import { useState } from 'react';
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
import Modal from '../../components/common/Modal';
import { Link, useSearchParams } from 'react-router-dom';

const ROLE_INFO = [
    {
        value: ROLES.STUDENT,
        label: 'Student',
        description: 'Builds a degree plan, follows milestones and annual reports.',
    },
    {
        value: ROLES.ADVISOR,
        label: 'Advisor',
        description: 'Reviews student plans and reports, keeps a research profile and follows warning alerts.',
    },
    {
        value: ROLES.COORDINATOR,
        label: 'Coordinator',
        description: 'Manages course offerings, capacity and authorizations, imports data and publishes announcements.',
    },
    {
        value: ROLES.DEAN,
        label: 'Dean',
        description: 'Sees everything the coordinator sees, in view-only mode. Cannot change anything.',
    },
    {
        value: ROLES.CHAIRPERSON,
        label: 'Chairperson',
        description: 'Sees everything the coordinator sees, in view-only mode. Cannot change anything.',
    },
    {
        value: ROLES.ADMIN,
        label: 'Admin',
        description: 'Manages accounts, roles, security settings and the audit log.',
    },
];

const ROLE_LABEL = Object.fromEntries(ROLE_INFO.map((role) => [role.value, role.label]));

const ROLE_OPTIONS = [
    { value: 'all', label: 'All roles' },
    ...ROLE_INFO.map((role) => ({ value: role.value, label: role.label })),
];

const STATUS_OPTIONS = [
    { value: 'all', label: 'All statuses' },
    { value: ACCOUNT_STATUS.ACTIVE, label: 'Active' },
    { value: ACCOUNT_STATUS.PENDING, label: 'Pending' },
    { value: ACCOUNT_STATUS.DISABLED, label: 'Disabled' },
];

export default function UserAccountsPage() {
    const { currentUser } = useAuth();
    const { data, updateCollection, addAuditEvent, addNotification } = useData();
    const { showToast } = useToast();
    const [query, setQuery] = useState('');
    const [role, setRole] = useState('all');
    const [searchParams] = useSearchParams();
    const startStatus = searchParams.get('status');
    const [status, setStatus] = useState(
        STATUS_OPTIONS.some((option) => option.value === startStatus) ? startStatus : 'all',
    );
    const [toDisable, setToDisable] = useState(null);
    const [resent, setResent] = useState(null);
    const [resetLink, setResetLink] = useState(null);
    const [roleTarget, setRoleTarget] = useState(null);
    const [newRole, setNewRole] = useState('');

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
        setResetLink(null);
        setResent({ email: user.email, code });
    }

    function handleSendReset(user) {
        const code = generateActivationCode();
        updateCollection('users', (list) =>
            list.map((u) => (u.id === user.id ? { ...u, resetCode: code } : u)),
        );
        addAuditEvent({ userId: user.id, actorId: currentUser.id, action: 'access_reset_sent' });
        setResent(null);
        setResetLink({ email: user.email, code });
    }
    function openRoleDialog(user) {
        setRoleTarget(user);
        setNewRole(user.role);
    }

    function closeRoleDialog() {
        setRoleTarget(null);
    }

    function confirmRoleChange() {
        updateCollection('users', (list) =>
            list.map((u) => (u.id === roleTarget.id ? { ...u, role: newRole } : u)),
        );
        addAuditEvent({
            userId: roleTarget.id,
            actorId: currentUser.id,
            action: 'role_changed',
            detail: `${ROLE_LABEL[roleTarget.role]} → ${ROLE_LABEL[newRole]}`,
        });
        addNotification({
            userId: roleTarget.id,
            title: 'Your role was changed',
            body: `Your role is now ${ROLE_LABEL[newRole]}. Sign out and sign in again to see your new pages.`,
        });
        showToast(`${roleTarget.name} is now ${ROLE_LABEL[newRole]}.`);
        closeRoleDialog();
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
        { key: 'role', header: 'Role', sortable: true, render: (u) => ROLE_LABEL[u.role] },
        { key: 'status', header: 'Status', sortable: true, render: (u) => <StatusBadge status={u.status} /> },
        {
            key: 'actions',
            header: 'Actions',
            render: (u) => {
                if (u.id === currentUser.id) return <span className="hint">This is your account</span>;
                return (
                    <div className="table__actions">
                        <Button variant="ghost" aria-label={`Change role for ${u.name}`} onClick={() => openRoleDialog(u)}>
                            Change role
                        </Button>
                        {u.status === ACCOUNT_STATUS.PENDING && (
                            <Button variant="ghost" aria-label={`Resend activation email to ${u.name}`} onClick={() => handleResend(u)}>
                                Resend activation email
                            </Button>
                        )}
                        {u.status === ACCOUNT_STATUS.ACTIVE && (
                            <>
                                <Button
                                    variant="ghost"
                                    aria-label={`Send password reset link to ${u.name}`}
                                    onClick={() => handleSendReset(u)}
                                >
                                    Send reset link
                                </Button>
                                <Button variant="ghost" aria-label={`Disable ${u.name}`} onClick={() => setToDisable(u)}>
                                    Disable
                                </Button>
                            </>
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

            {resetLink && (
                <p className="hint" role="status">
                    Password reset link sent to {resetLink.email}.{' '}
                    <Link to={`/reset-password/${resetLink.code}`}>Open reset email (demo)</Link>
                </p>
            )}
            <DataTable
                caption="User accounts"
                columns={columns}
                rows={rows}
                emptyTitle="No users match"
                emptyMessage="Try a different search or clear the filters."
            />

            <details className="role-details">
                <summary>What each role can do</summary>
                <div className="role-cards">
                    {ROLE_INFO.map((role) => (
                        <section key={role.value} className="role-card">
                            <h2>{role.label}</h2>
                            <p className="role-card__count">
                                {data.users.filter((u) => u.role === role.value).length} users
                            </p>
                            <p>{role.description}</p>
                        </section>
                    ))}
                </div>
            </details>

            <ConfirmationDialog
                open={Boolean(toDisable)}
                title="Disable this account?"
                message={`${toDisable?.name ?? 'This user'} will no longer be able to sign in. You can enable the account again later.`}
                confirmLabel="Disable account"
                variant="danger"
                onConfirm={confirmDisable}
                onCancel={() => setToDisable(null)}
            />
            <Modal
                open={Boolean(roleTarget)}
                title="Change role"
                onClose={closeRoleDialog}
                footer={
                    <>
                        <Button variant="ghost" onClick={closeRoleDialog}>Cancel</Button>
                        <Button onClick={confirmRoleChange} disabled={!roleTarget || newRole === roleTarget.role}>
                            Save role
                        </Button>
                    </>
                }
            >
                <p style={{ marginTop: 0 }}>
                    Choose a new role for {roleTarget?.name}. They will need to sign in again to see their new pages.
                </p>
                <Select
                    label="Role"
                    options={ROLE_INFO.map((role) => ({ value: role.value, label: role.label }))}
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    data-autofocus
                />
            </Modal>
        </main>
    );
}