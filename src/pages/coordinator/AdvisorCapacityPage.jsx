import { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import DataTable from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import AvailabilityBadge from '../../components/coordinator/AvailabilityBadge';
import AvailabilityOverrideDialog from '../../components/coordinator/AvailabilityOverrideDialog';
import EditAdvisorCapacityDialog from '../../components/coordinator/EditAdvisorCapacityDialog';
import { MailIcon, PeopleIcon, PersonIcon, PinIcon } from '../../components/coordinator/Icons';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';
import { useReadOnly } from '../../hooks/useReadOnly';
import { AVAILABILITY } from '../../data/statusValues';
import {
    ADVISEE_SLOTS,
    AVAILABILITY_LABEL,
    capacityOf,
    computeAutoAvailability,
    computeAvailability,
    countAssigned,
} from '../../utils/computeAvailability';
import { matchesSearch } from '../../utils/matchesSearch';
import { formatDateTime } from '../../utils/formatDate';
import { newId, nameOfUser } from '../../utils/coordinatorHelpers';

const FILTER_OPTIONS = [
    { value: 'all', label: 'All advisors' },
    ...Object.values(AVAILABILITY).map((value) => ({ value, label: AVAILABILITY_LABEL[value] })),
];
const TONE = { available: 'success', limited: 'warning', unavailable: 'danger' };

export default function AdvisorCapacityPage() {
    const { currentUser } = useAuth();
    const { data, updateCollection, addAuditEvent, addNotification } = useData();
    const { showToast } = useToast();
    const readOnly = useReadOnly();
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [openId, setOpenId] = useState(null);
    const [editing, setEditing] = useState(null);
    const [removing, setRemoving] = useState(null);
    const [editingCapacity, setEditingCapacity] = useState(null);
    const advisors = data.advisors ?? [];
    const students = data.students ?? [];
    const history = data.capacityOverrides ?? [];

    const all = advisors.map((a) => {
    const count = countAssigned(students, a.id);
    const capacity = capacityOf(a);
    return { ...a, count, capacity, auto: computeAutoAvailability(count, capacity), effective: computeAvailability(a, count) };
});
    const rows = all
        .filter((a) => filter === 'all' || a.effective === filter)
        .filter((a) => matchesSearch(query, a.name, a.department, a.email, (a.researchAreas ?? []).join(' ')));
    const open = all.find((a) => a.id === openId);

    function notifyAdvisor(advisor, body) {
        if (advisor.userId) addNotification({ userId: advisor.userId, title: 'Your availability was updated', body, link: '/advisor/profile' });
    }

    function saveOverride({ value, reason }) {
        const override = { value, reason, by: currentUser.id, at: new Date().toISOString() };
        updateCollection('advisors', (list) => list.map((a) => (a.id === editing.id ? { ...a, coordinatorOverride: override } : a)));
        updateCollection('capacityOverrides', (list) => [{ id: newId('ov'), advisorId: editing.id, action: 'set', ...override }, ...list]);
        addAuditEvent({ userId: editing.userId ?? null, actorId: currentUser.id, action: 'availability_override_set', detail: `${editing.name}: ${AVAILABILITY_LABEL[value]}` });
        notifyAdvisor(editing, `The coordinator set your availability to ${AVAILABILITY_LABEL[value]}. Reason: ${reason}`);
        showToast(`${editing.name} is now shown as ${AVAILABILITY_LABEL[value]}.`);
        setEditing(null);
    }

    function removeOverride() {
        const advisor = removing;
        updateCollection('advisors', (list) => list.map((a) => (a.id === advisor.id ? { ...a, coordinatorOverride: null } : a)));
        updateCollection('capacityOverrides', (list) => [
            { id: newId('ov'), advisorId: advisor.id, action: 'removed', value: null, reason: 'Override removed', by: currentUser.id, at: new Date().toISOString() },
            ...list,
        ]);
        addAuditEvent({ userId: advisor.userId ?? null, actorId: currentUser.id, action: 'availability_override_removed', detail: advisor.name });
        notifyAdvisor(advisor, `The coordinator removed the availability override. You are now shown as ${AVAILABILITY_LABEL[advisor.auto]}.`);
        showToast(`Override removed. ${advisor.name} is back to automatic availability.`);
        setRemoving(null);
    }
    function saveCapacity({ capacity }) {
        const advisor = editingCapacity;
        updateCollection('advisors', (list) => list.map((a) => (a.id === advisor.id ? { ...a, capacity } : a)));
        addAuditEvent({
            userId: advisor.userId ?? null,
            actorId: currentUser.id,
            action: 'advisor_capacity_updated',
            detail: `${advisor.name}: ${advisor.capacity} → ${capacity} slots`,
        });
        notifyAdvisor(advisor, `The coordinator changed your maximum number of advisees from ${advisor.capacity} to ${capacity}.`);
        showToast(`${advisor.name} now has ${capacity} advisee slots.`);
        setEditingCapacity(null);
    }

    const advisorName = (id) => advisors.find((a) => a.id === id)?.name ?? id;
    const historyColumns = [
        { key: 'at', header: 'When', sortable: true, render: (h) => formatDateTime(h.at) },
        { key: 'advisorId', header: 'Advisor', sortable: true, sortValue: (h) => advisorName(h.advisorId), render: (h) => advisorName(h.advisorId) },
        { key: 'value', header: 'Change', render: (h) => (h.action === 'removed' ? 'Override removed' : <AvailabilityBadge value={h.value} />) },
        { key: 'reason', header: 'Reason' },
        { key: 'by', header: 'By', render: (h) => nameOfUser(data, h.by) },
    ];
    const openHistory = open ? history.filter((h) => h.advisorId === open.id) : [];

    return (
        <main className="page page--plain">
            <div className="panel">
                <PageHeader
                    title="CCM Faculty"
                    subtitle={`Students see an advisor as Available, Limited when 75% of the slots are used, or Unavailable when every slot is used.`}
                />
                <div className="filters">
                    <SearchBar value={query} onChange={setQuery} placeholder="Search by name, department or research area" label="Search advisors" />
                    <Select label="Students see" options={FILTER_OPTIONS} value={filter} onChange={(e) => setFilter(e.target.value)} />
                </div>
            </div>

            {rows.length === 0 ? (
                <div className="panel">
                    <EmptyState
                        title={advisors.length ? 'No advisors match' : 'No advisor profiles yet'}
                        message={advisors.length ? 'Try a different search or filter.' : 'Advisors appear here once their profiles exist.'}
                    />
                </div>
            ) : (
                <ul className="faculty-grid">
                    {rows.map((a) => (
                        <li key={a.id} className="faculty-card">
                            <div className="faculty-card__photo">
                                <PersonIcon />
                            </div>
                            <h2 className="faculty-card__name">{a.name}</h2>
                            <p className="faculty-card__line"><PinIcon /> {a.office ?? 'Office not set'}</p>
                            <p className="faculty-card__line">
                                <MailIcon /> <a href={`mailto:${a.email}`}>{a.email}</a>
                            </p>
                            <p className="faculty-card__line">
                                <PeopleIcon /> <strong>Advisee slots:</strong>
                                <span className={`slot-pill slot-pill--${TONE[a.effective]}`}>
                                    {a.count}/{a.capacity}
                                </span>
                            </p>
                            <p className="faculty-card__status">
                                {AVAILABILITY_LABEL[a.effective]}
                                {a.coordinatorOverride ? ' · set by coordinator' : ''}
                            </p>
                                 
                            <div className="table__actions">
                                <Button className="btn--small" onClick={() => setOpenId(a.id)} aria-label={`Read more about ${a.name}`}>
                                    Read More
                                </Button>
                                {!readOnly && (
                                    <Button variant="ghost" className="btn--small" onClick={() => setEditingCapacity(a)} aria-label={`Edit advisee slots for ${a.name}`}>
                                        Edit slots
                                    </Button>
                                )}
                            </div>
                        </li>
                
                    ))}
                </ul>
            )}

            <section className="panel" aria-labelledby="history-title">
                <h2 className="panel__title" id="history-title">Override history</h2>
                <p className="hint" style={{ marginTop: 0 }}>Every override and removal is kept here.</p>
                <DataTable caption="Override history" columns={historyColumns} rows={history} pageSize={5} emptyTitle="No overrides yet" />
            </section>

            <Modal
                open={Boolean(open)}
                title={open?.name ?? ''}
                onClose={() => setOpenId(null)}
                footer={
                    !readOnly && open ? (
                        <>
                            {open.coordinatorOverride && (
                                <Button variant="ghost" onClick={() => { setRemoving(open); setOpenId(null); }}>
                                    Remove override
                                </Button>
                            )}
                            <Button onClick={() => { setEditing(open); setOpenId(null); }} data-autofocus>
                                {open.coordinatorOverride ? 'Change override' : 'Override availability'}
                            </Button>
                        </>
                    ) : (
                        <Button variant="ghost" onClick={() => setOpenId(null)} data-autofocus>Close</Button>
                    )
                }
            >
                {open && (
                    <>
                        <dl className="detail-list detail-list--tight">
                            <dt>Department</dt><dd>{open.department}</dd>
                            <dt>Office</dt><dd>{open.office ?? 'Not set'}</dd>
                            <dt>Email</dt><dd><a href={`mailto:${open.email}`}>{open.email}</a></dd>
                            <dt>Research areas</dt><dd>{(open.researchAreas ?? []).join(', ') || 'Not set'}</dd>
                            <dt>Advisees</dt><dd>{open.count} of {open.capacity} slots</dd>
                            <dt>Automatic</dt><dd><AvailabilityBadge value={open.auto} /></dd>
                            <dt>Override</dt>
                            <dd>
                                {open.coordinatorOverride ? (
                                    <>
                                        <AvailabilityBadge value={open.coordinatorOverride.value} />
                                        <span className="cell__sub">{open.coordinatorOverride.reason}</span>
                                    </>
                                ) : 'None'}
                            </dd>
                            <dt>Students see</dt><dd><AvailabilityBadge value={open.effective} /></dd>
                        </dl>
                        <p className="hint" style={{ marginTop: 12 }}>
                            {openHistory.length ? `Last change: ${formatDateTime(openHistory[0].at)}` : 'No overrides for this advisor yet.'}
                        </p>
                    </>
                )}
            </Modal>

            {!readOnly && editingCapacity && (
            <EditAdvisorCapacityDialog
            key={editingCapacity.id}
            advisor={editingCapacity}
            onSave={saveCapacity}
            onClose={() => setEditingCapacity(null)}
        />
        )}

            {!readOnly && editing && (
                <AvailabilityOverrideDialog key={editing.id} advisor={editing} autoValue={editing.auto} onSave={saveOverride} onClose={() => setEditing(null)} />
            )}
            {!readOnly && (
                <ConfirmationDialog
                    open={Boolean(removing)}
                    title="Remove override?"
                    message={`${removing?.name ?? 'This advisor'} will go back to automatic availability based on the number of advisees.`}
                    confirmLabel="Remove override"
                    onConfirm={removeOverride}
                    onCancel={() => setRemoving(null)}
                />
            )}
        </main>
    );
}
