import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';
import { useReadOnly } from '../../hooks/useReadOnly';
import { PUBLISH_STATUS } from '../../data/statusValues';
import { matchesSearch } from '../../utils/matchesSearch';
import { getOfferingWarnings } from '../../utils/offeringWarnings';

const ACTION_TEXT = {
    [PUBLISH_STATUS.PUBLISHED]: { title: 'Publish offering?', verb: 'Publish', message: 'Students will see it on the course offerings page.', done: 'published' },
    [PUBLISH_STATUS.ARCHIVED]: { title: 'Archive offering?', verb: 'Archive', message: 'Students will no longer see it. You can restore it as a draft later.', done: 'archived' },
    [PUBLISH_STATUS.DRAFT]: { title: 'Move back to draft?', verb: 'Move to draft', message: 'Students will no longer see it until you publish it again.', done: 'moved to draft' },
};

// Offerings tab of the Courses & Schedule page.
export default function OfferingsPanel() {
    const { currentUser } = useAuth();
    const { data, updateCollection, addAuditEvent } = useData();
    const { showToast } = useToast();
    const readOnly = useReadOnly();
    const [tab, setTab] = useState('all');
    const [query, setQuery] = useState('');
    const [term, setTerm] = useState('all');
    const [pending, setPending] = useState(null); // { offering, status }

    const offerings = data.offerings ?? [];
    const terms = [...new Set(offerings.map((o) => o.term))].sort();
    const count = (s) => offerings.filter((o) => o.status === s).length;
    const rows = offerings
        .filter((o) => tab === 'all' || o.status === tab)
        .filter((o) => term === 'all' || o.term === term)
        .filter((o) => matchesSearch(query, o.courseCode, o.title, o.instructor));

    function changeStatus() {
        const { offering, status } = pending;
        updateCollection('offerings', (list) =>
            list.map((o) => (o.id === offering.id ? { ...o, status, updatedAt: new Date().toISOString() } : o)),
        );
        addAuditEvent({ userId: null, actorId: currentUser.id, action: `offering_${status}`, detail: `${offering.courseCode} term ${offering.term}` });
        showToast(`${offering.courseCode} ${ACTION_TEXT[status].done}.`);
        setPending(null);
    }

    const columns = [
        {
            key: 'courseCode',
            header: 'Course',
            sortable: true,
            render: (o) => (
                <>
                    <Link to={`/coordinator/offerings/${o.id}`}>{o.courseCode}</Link>
                    <span className="cell__sub">{o.title}</span>
                </>
            ),
        },
        { key: 'term', header: 'Term', sortable: true, render: (o) => (<>{o.term} · sec {o.section}<span className="cell__sub">Area {o.area ?? '—'}</span></>) },
        { key: 'instructor', header: 'Instructor', sortable: true, render: (o) => o.instructor || <span className="cell__sub">Not set</span> },
        { key: 'time', header: 'Schedule', render: (o) => (o.days && o.time ? `${o.days} ${o.time}` : <span className="cell__sub">Times not set</span>) },
        { key: 'seats', header: 'Seats', sortable: true },
        {
            key: 'status',
            header: 'Status',
            render: (o) => {
                const warnings = getOfferingWarnings(o, offerings, data.courses).length;
                return (
                    <>
                        <StatusBadge status={o.status} />
                        {warnings > 0 && o.status !== PUBLISH_STATUS.ARCHIVED && <span className="cell__sub">{warnings} warning{warnings > 1 ? 's' : ''}</span>}
                    </>
                );
            },
        },
    ];
    if (!readOnly) {
        columns.push({
            key: 'actions',
            header: 'Actions',
            render: (o) => (
                <div className="table__actions">
                    <Link className="btn btn--ghost" to={`/coordinator/offerings/${o.id}`} aria-label={`Edit ${o.courseCode}`}>Edit</Link>
                    {o.status === PUBLISH_STATUS.DRAFT && (
                        <Button onClick={() => setPending({ offering: o, status: PUBLISH_STATUS.PUBLISHED })} aria-label={`Publish ${o.courseCode}`}>Publish</Button>
                    )}
                    {o.status !== PUBLISH_STATUS.ARCHIVED && (
                        <Button variant="ghost" onClick={() => setPending({ offering: o, status: PUBLISH_STATUS.ARCHIVED })} aria-label={`Archive ${o.courseCode}`}>Archive</Button>
                    )}
                    {o.status === PUBLISH_STATUS.ARCHIVED && (
                        <Button variant="ghost" onClick={() => setPending({ offering: o, status: PUBLISH_STATUS.DRAFT })} aria-label={`Restore ${o.courseCode} as draft`}>Restore as draft</Button>
                    )}
                </div>
            ),
        });
    }

    const action = pending ? ACTION_TEXT[pending.status] : null;

    const statusOptions = [
        { value: 'all', label: `All (${offerings.length})` },
        { value: PUBLISH_STATUS.PUBLISHED, label: `Published (${count(PUBLISH_STATUS.PUBLISHED)})` },
        { value: PUBLISH_STATUS.DRAFT, label: `Drafts (${count(PUBLISH_STATUS.DRAFT)})` },
        { value: PUBLISH_STATUS.ARCHIVED, label: `Archived (${count(PUBLISH_STATUS.ARCHIVED)})` },
    ];

    return (
        <>
            <div className="filters" style={{ marginTop: 0 }}>
                <SearchBar value={query} onChange={setQuery} placeholder="Search course, title or instructor" label="Search offerings" />
                <Select
                    label="Term"
                    options={[{ value: 'all', label: 'All terms' }, ...terms.map((t) => ({ value: t, label: `Term ${t}` }))]}
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                />
                <Select label="Status" options={statusOptions} value={tab} onChange={(e) => setTab(e.target.value)} />
            </div>
            <p className="hint" style={{ marginTop: 0 }}>Students only see published offerings.</p>
            <DataTable key={tab + term} caption="Course offerings" columns={columns} rows={rows} emptyTitle="No offerings here" emptyMessage="Try another status, term or search." />
            <ConfirmationDialog
                open={Boolean(pending) && !readOnly}
                title={action?.title}
                message={pending ? `${pending.offering.courseCode} (term ${pending.offering.term}). ${action.message}` : ''}
                confirmLabel={action?.verb}
                variant={pending?.status === PUBLISH_STATUS.ARCHIVED ? 'danger' : 'primary'}
                onConfirm={changeStatus}
                onCancel={() => setPending(null)}
            />
        </>
    );
}
