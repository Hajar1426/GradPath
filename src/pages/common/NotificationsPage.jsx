import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Tabs from '../../components/common/Tabs';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import { useNotifications } from '../../hooks/useNotifications';
import { useToast } from '../../hooks/useToast';
import { formatDateTime } from '../../utils/formatDate';

export default function NotificationsPage() {
    const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
    const { showToast } = useToast();
    const [tab, setTab] = useState('all');

    const visible = tab === 'unread' ? notifications.filter((n) => !n.read) : notifications;

    function handleMarkAll() {
        markAllRead();
        showToast('All notifications marked as read.');
    }

    return (
        <main className="page">
            <div className="page__toolbar">
                <PageHeader title="Notifications" subtitle="Updates about your plans, reports and accounts." />
                <Button variant="ghost" onClick={handleMarkAll} disabled={unreadCount === 0}>
                    Mark all as read
                </Button>
            </div>

            <div style={{ marginTop: 20 }}>
                <Tabs
                    label="Notification filter"
                    active={tab}
                    onChange={setTab}
                    tabs={[
                        { id: 'all', label: `All (${notifications.length})` },
                        { id: 'unread', label: `Unread (${unreadCount})` },
                    ]}
                />
            </div>

            <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
                {visible.length === 0 ? (
                    <EmptyState
                        title={tab === 'unread' ? 'You are all caught up' : 'No notifications yet'}
                        message={tab === 'unread' ? 'There are no unread notifications.' : 'New updates will appear here.'}
                    />
                ) : (
                    <ul className="notice-list">
                        {visible.map((n) => (
                            <li key={n.id} className={`notice${n.read ? '' : ' notice--unread'}`}>
                                <div>
                                    <p className="notice__title">
                                        {n.title}
                                        {!n.read && <StatusBadge status="new" label="Unread" />}
                                    </p>
                                    <p className="notice__body">{n.body}</p>
                                    <span className="notice__time">{formatDateTime(n.at)}</span>
                                </div>
                                <div className="notice__actions">
                                    {n.link && (
                                        <Link className="btn btn--ghost" to={n.link} onClick={() => markRead(n.id)}>
                                            Open
                                        </Link>
                                    )}
                                    {!n.read && (
                                        <Button variant="ghost" onClick={() => markRead(n.id)}>
                                            Mark as read
                                        </Button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
}