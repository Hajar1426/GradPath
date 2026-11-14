import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import EditOnly from '../../components/common/EditOnly';
import CategoryChips, { CategoryTag } from '../../components/coordinator/CategoryChips';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';
import { useReadOnly } from '../../hooks/useReadOnly';
import { PUBLISH_STATUS } from '../../data/statusValues';
import { matchesSearch } from '../../utils/matchesSearch';
import { formatDate } from '../../utils/formatDate';
import { audienceText } from '../../utils/coordinatorHelpers';
import { publishAnnouncement } from './announcementActions';

const PAGE_SIZE = 6;

export default function AnnouncementsManagePage() {
    const { currentUser } = useAuth();
    const store = useData();
    const { data, updateCollection, addAuditEvent } = store;
    const { showToast } = useToast();
    const readOnly = useReadOnly();
    const [status, setStatus] = useState('all');
    const [category, setCategory] = useState('all');
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [pending, setPending] = useState(null); // { item, action: 'publish' | 'archive' }

    const all = data.announcements ?? [];
    const statusCount = (s) => all.filter((a) => a.status === s).length;
    const filtered = all
        .filter((a) => status === 'all' || a.status === status)
        .filter((a) => category === 'all' || (a.category ?? 'general') === category)
        .filter((a) => matchesSearch(query, a.title, a.body ?? ''))
        .sort((a, b) => String(b.publishedAt ?? b.createdAt).localeCompare(String(a.publishedAt ?? a.createdAt)));
    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const current = Math.min(page, pageCount);
    const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

    const reset = (setter) => (value) => {
        setter(value);
        setPage(1);
    };

    function confirmAction() {
        const { item, action } = pending;
        if (action === 'publish') {
            const reached = publishAnnouncement(store, item, currentUser);
            showToast(`Published. ${reached} people were notified.`);
        } else {
            updateCollection('announcements', (list) => list.map((a) => (a.id === item.id ? { ...a, status: PUBLISH_STATUS.ARCHIVED } : a)));
            addAuditEvent({ userId: null, actorId: currentUser.id, action: 'announcement_archived', detail: item.title });
            showToast('Announcement archived. Readers no longer see it.');
        }
        setPending(null);
    }

    return (
        <main className="page">
            <PageHeader title="Announcements" subtitle="Stay updated with the latest news and deadlines from your department." />
            <div className="filters">
                <SearchBar value={query} onChange={reset(setQuery)} placeholder="Search announcements" label="Search announcements" />
                <EditOnly>
                    <Link className="btn" to="/coordinator/announcements/new">+ Create New Announcement</Link>
                </EditOnly>
                <Select
                    label="Status"
                    value={status}
                    onChange={(e) => reset(setStatus)(e.target.value)}
                    options={[
                        { value: 'all', label: `All (${all.length})` },
                        { value: PUBLISH_STATUS.PUBLISHED, label: `Published (${statusCount(PUBLISH_STATUS.PUBLISHED)})` },
                        { value: PUBLISH_STATUS.DRAFT, label: `Drafts (${statusCount(PUBLISH_STATUS.DRAFT)})` },
                        { value: PUBLISH_STATUS.ARCHIVED, label: `Archived (${statusCount(PUBLISH_STATUS.ARCHIVED)})` },
                    ]}
                />
            </div>
            <CategoryChips value={category} onChange={reset(setCategory)} />

            {visible.length === 0 ? (
                <EmptyState title="No announcements here" message="Try another category, status or search." />
            ) : (
                <ul className="ann-list">
                    {visible.map((a) => (
                        <li key={a.id} className="ann-item">
                            <span className={`ann-item__dot ann-item__dot--${a.status}`} aria-hidden="true" />
                            <div className="ann-item__main">
                                <Link className="ann-item__title" to={`/coordinator/announcements/${a.id}`}>{a.title}</Link>
                                <div className="ann-item__meta">
                                    <CategoryTag category={a.category} />
                                    <StatusBadge status={a.status} />
                                    <span>For: {audienceText(a.audience)}</span>
                                    <span>{a.publishedAt ? `Published ${formatDate(a.publishedAt)}` : `Created ${formatDate(a.createdAt)}`}</span>
                                </div>
                            </div>
                            {!readOnly && (
                                <div className="table__actions">
                                    {a.status !== PUBLISH_STATUS.ARCHIVED && (
                                        <Link className="btn btn--ghost btn--small" to={`/coordinator/announcements/${a.id}`} aria-label={`Edit ${a.title}`}>Edit</Link>
                                    )}
                                    {a.status === PUBLISH_STATUS.DRAFT && (
                                        <Button className="btn--small" onClick={() => setPending({ item: a, action: 'publish' })} aria-label={`Publish ${a.title}`}>Publish</Button>
                                    )}
                                    {a.status === PUBLISH_STATUS.PUBLISHED && (
                                        <Button variant="ghost" className="btn--small" onClick={() => setPending({ item: a, action: 'archive' })} aria-label={`Archive ${a.title}`}>Archive</Button>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            <div className="list-footer">
                <span>Page {current}</span>
                <Pagination page={current} pageCount={pageCount} onPageChange={setPage} />
            </div>

            <ConfirmationDialog
                open={Boolean(pending) && !readOnly}
                title={pending?.action === 'publish' ? 'Publish announcement?' : 'Archive announcement?'}
                message={
                    pending?.action === 'publish'
                        ? `"${pending.item.title}" will be shown to: ${audienceText(pending.item.audience)}. They also get a notification.`
                        : `"${pending?.item.title ?? ''}" will be hidden from readers.`
                }
                confirmLabel={pending?.action === 'publish' ? 'Publish' : 'Archive'}
                variant={pending?.action === 'archive' ? 'danger' : 'primary'}
                onConfirm={confirmAction}
                onCancel={() => setPending(null)}
            />
        </main>
    );
}
