import { useEffect, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import CategoryChips, { CategoryTag } from '../../components/coordinator/CategoryChips';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useAnnouncementCount } from '../../hooks/useAnnouncementCount';
import { PUBLISH_STATUS } from '../../data/statusValues';
import { audienceRole } from '../../utils/coordinatorHelpers';
import { formatDate } from '../../utils/formatDate';
import { matchesSearch } from '../../utils/matchesSearch';

const PAGE_SIZE = 5;

export default function AnnouncementsPage() {
    const { currentUser } = useAuth();
    const { data } = useData();
    const { markSeen } = useAnnouncementCount();
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [page, setPage] = useState(1);
    // Remember what was new when the page opened, so the "New" tag stays while the user reads.
    const [seenBefore] = useState(() => {
        try {
            return Number(localStorage.getItem(`gradpath:announcementsSeen:${currentUser.id}`)) || 0;
        } catch {
            return 0;
        }
    });

    useEffect(() => {
        markSeen();
    }, [markSeen]);

    const role = audienceRole(currentUser.role);
    const mine = (data.announcements ?? [])
        .filter((a) => a.status === PUBLISH_STATUS.PUBLISHED && (a.audience ?? []).includes(role))
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    const filtered = mine
        .filter((a) => category === 'all' || (a.category ?? 'general') === category)
        .filter((a) => matchesSearch(query, a.title, a.body ?? ''));
    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const current = Math.min(page, pageCount);
    const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

    return (
        <main className="page">
            <PageHeader title="Announcements" subtitle="Stay updated with the latest news and deadlines from your department." />
            {mine.length > 0 && (
                <>
                    <div className="filters">
                        <SearchBar value={query} onChange={(v) => { setQuery(v); setPage(1); }} placeholder="Search announcements" label="Search announcements" />
                    </div>
                    <CategoryChips value={category} onChange={(v) => { setCategory(v); setPage(1); }} />
                </>
            )}
            {visible.length === 0 ? (
                <EmptyState
                    title={mine.length ? 'No announcements match' : 'No announcements yet'}
                    message={mine.length ? 'Try another category or search.' : 'Announcements from the coordinator will appear here.'}
                />
            ) : (
                <ul className="ann-list">
                    {visible.map((a) => {
                        const isNew = new Date(a.publishedAt).getTime() > seenBefore;
                        return (
                            <li key={a.id} className="ann-item ann-item--read">
                                <span className={`ann-item__dot${isNew ? ' ann-item__dot--published' : ''}`} aria-hidden="true" />
                                <article className="ann-item__main">
                                    <h2 className="ann-item__title">{a.title}</h2>
                                    <div className="ann-item__meta">
                                        <CategoryTag category={a.category} />
                                        <span>{formatDate(a.publishedAt)}</span>
                                        {isNew && <span className="new-tag">New</span>}
                                    </div>
                                    <p className="ann-item__body">{a.body}</p>
                                </article>
                            </li>
                        );
                    })}
                </ul>
            )}
            {filtered.length > 0 && (
                <div className="list-footer">
                    <span>Page {current}</span>
                    <Pagination page={current} pageCount={pageCount} onPageChange={setPage} />
                </div>
            )}
        </main>
    );
}
