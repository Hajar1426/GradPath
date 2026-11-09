import { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import DataTable from '../../components/common/DataTable';
import { useData } from '../../hooks/useData';
import { formatDateTime } from '../../utils/formatDate';
import { matchesSearch } from '../../utils/matchesSearch';

const ACTION_LABELS = {
    account_created: 'Account created',
    account_disabled: 'Account disabled',
    account_enabled: 'Account enabled',
    activation_resent: 'Activation email resent',
    password_reset: 'Password reset',
    role_changed: 'Role changed',
};

function labelFor(action) {
    if (ACTION_LABELS[action]) return ACTION_LABELS[action];
    const text = String(action).replace(/_/g, ' ');
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function AuditLogPage() {
    const { data } = useData();
    const [query, setQuery] = useState('');
    const [action, setAction] = useState('all');

    const events = (data.auditEvents ?? []).map((event) => {
        const user = data.users.find((u) => u.id === event.userId);
        const actor = data.users.find((u) => u.id === event.actorId);
        return {
            id: event.id,
            at: event.at,
            action: event.action,
            label: labelFor(event.action),
            detail: event.detail ?? '',
            userName: user?.name ?? 'Unknown user',
            userEmail: user?.email ?? '',
            actorName: event.actorId ? (actor?.name ?? 'Unknown user') : 'The user',
        };
    });

    const actionOptions = [
        { value: 'all', label: 'All actions' },
        ...[...new Set(events.map((e) => e.action))].map((value) => ({ value, label: labelFor(value) })),
    ];

    const rows = events
        .filter((e) => action === 'all' || e.action === action)
        .filter((e) => matchesSearch(query, e.label, e.userName, e.userEmail, e.actorName));

    const columns = [
        { key: 'at', header: 'When', sortable: true, render: (e) => formatDateTime(e.at) },
        { key: 'label', header: 'Action', sortable: true },
        {
            key: 'userName',
            header: 'Account',
            sortable: true,
            render: (e) => (
                <>
                    {e.userName}
                    {e.userEmail && <span className="cell__sub">{e.userEmail}</span>}
                </>
            ),
        },
        {
            key: 'label',
            header: 'Action',
            sortable: true,
            render: (e) => (
                <>
                    {e.label}
                    {e.detail && <span className="cell__sub">{e.detail}</span>}
                </>
            ),
        },    ];

    return (
        <main className="page">
            <PageHeader title="Audit log" subtitle="A record of changes to user accounts, newest first." />

            <div className="filters">
                <SearchBar value={query} onChange={setQuery} placeholder="Search by account, person or action" label="Search audit log" />
                <Select label="Action" options={actionOptions} value={action} onChange={(e) => setAction(e.target.value)} />
            </div>

            <p className="hint" aria-live="polite">
                Showing {rows.length} of {events.length} events
            </p>

            <DataTable
                caption="Audit log"
                columns={columns}
                rows={rows}
                pageSize={10}
                emptyTitle="No events to show"
                emptyMessage="Account changes will appear here once they happen."
            />
        </main>
    );
}