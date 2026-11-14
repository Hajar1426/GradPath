import { ACCOUNT_STATUS, PUBLISH_STATUS } from '../../data/statusValues';
import { audienceRole } from '../../utils/coordinatorHelpers';

// Publishes (or re-saves as published) an announcement and notifies everyone in its audience.
// Returns how many people were notified.
export function publishAnnouncement({ data, updateCollection, addNotification, addAuditEvent }, announcement, currentUser) {
    const publishedAt = new Date().toISOString();
    const record = { ...announcement, status: PUBLISH_STATUS.PUBLISHED, publishedAt };
    updateCollection('announcements', (list) =>
        list.some((a) => a.id === record.id) ? list.map((a) => (a.id === record.id ? record : a)) : [record, ...list],
    );
    const readers = (data.users ?? []).filter(
        (u) => u.status === ACCOUNT_STATUS.ACTIVE && u.id !== currentUser.id && record.audience.includes(audienceRole(u.role)),
    );
    readers.forEach((u) =>
        addNotification({ userId: u.id, title: `New announcement: ${record.title}`, body: record.body.slice(0, 140), link: '/announcements' }),
    );
    addAuditEvent({ userId: null, actorId: currentUser.id, action: 'announcement_published', detail: record.title });
    return readers.length;
}
