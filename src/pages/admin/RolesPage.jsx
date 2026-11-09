import { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';
import { ROLES } from '../../data/statusValues';
import { matchesSearch } from '../../utils/matchesSearch';

const ROLE_INFO = [
    {
        value: ROLES.STUDENT,
        label: 'Student',
        description: 'Builds a degree plan, requests course authorizations and follows milestones and annual reports.',
    },
    {
        value: ROLES.ADVISOR,
        label: 'Advisor',
        description: 'Reviews student plans and reports, keeps a research profile and follows off-track alerts.',
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

export default function RolesPage() {
    const { currentUser } = useAuth();
    const { data, updateCollection, addAuditEvent, addNotification } = useData();
    const { showToast } = useToast();
    const [query, setQuery] = useState('');
    const [target, setTarget] = useState(null);
    const [newRole, setNewRole] = useState('');

    const rows = data.users
        .filter((u) => matchesSearch(query, u.name, u.email, ROLE_LABEL[u.role]))
        .sort((a, b) => a.name.localeCompare(b.name));

    function openDialog(user) {
        setTarget(user);
        setNewRole(user.role);
    }

    function closeDialog() {
        setTarget(null);
    }

    function confirmChange() {
        updateCollection('users', (list) =>
            list.map((u) => (u.id === target.id ? { ...u, role: newRole } : u)),
        );
        addAuditEvent({
            userId: target.id,
            actorId: currentUser.id,
            action: 'role_changed',
            detail: `${ROLE_LABEL[target.role]} → ${ROLE_LABEL[newRole]}`,
        });
        addNotification({
            userId: target.id,
            title: 'Your role was changed',
            body: `Your role is now ${ROLE_LABEL[newRole]}. Sign out and sign in again to see your new pages.`,
        });
        showToast(`${target.name} is now ${ROLE_LABEL[newRole]}.`);
        closeDialog();
    }

    const columns = [
        { key: 'name', header: 'Name', sortable: true },
        { key: 'email', header: 'Email', sortable: true },
        { key: 'role', header: 'Role', sortable: true, render: (u) => ROLE_LABEL[u.role] },
        {
            key: 'actions',
            header: 'Actions',
            render: (u) =>
                u.id === currentUser.id ? (
                    <span className="hint">This is your account</span>
                ) : (
                    <Button variant="ghost" aria-label={`Change role for ${u.name}`} onClick={() => openDialog(u)}>
                        Change role
                    </Button>
                ),
        },
    ];

    return (
        <main className="page">
            <PageHeader title="Roles" subtitle="What each role can do, and who has it." />

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

            <h2 className="section-title">Change a user's role</h2>
            <div className="filters">
                <SearchBar value={query} onChange={setQuery} placeholder="Search by name, email or role" label="Search users" />
            </div>

            <DataTable
                caption="Users and their roles"
                columns={columns}
                rows={rows}
                emptyTitle="No users match"
                emptyMessage="Try a different search."
            />

            <Modal
                open={Boolean(target)}
                title="Change role"
                onClose={closeDialog}
                footer={
                    <>
                        <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
                        <Button onClick={confirmChange} disabled={!target || newRole === target.role}>
                            Save role
                        </Button>
                    </>
                }
            >
                <p style={{ marginTop: 0 }}>
                    Choose a new role for {target?.name}. They will need to sign in again to see their new pages.
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