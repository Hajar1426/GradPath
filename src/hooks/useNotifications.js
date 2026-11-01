import { useCallback, useMemo } from 'react';
import { useData } from './useData';
import { useAuth } from './useAuth';

export function useNotifications() {
    const { data, updateCollection } = useData();
    const { currentUser } = useAuth();
    const userId = currentUser?.id;

    const notifications = useMemo(
        () => (data.notifications ?? []).filter((n) => n.userId === userId),
        [data.notifications, userId],
    );
    const unreadCount = notifications.filter((n) => !n.read).length;

    const markRead = useCallback(
        (id) => {
            updateCollection('notifications', (list) =>
                list.map((n) => (n.id === id ? { ...n, read: true } : n)),
            );
        },
        [updateCollection],
    );

    const markAllRead = useCallback(() => {
        updateCollection('notifications', (list) =>
            list.map((n) => (n.userId === userId ? { ...n, read: true } : n)),
        );
    }, [updateCollection, userId]);

    return { notifications, unreadCount, markRead, markAllRead };
}