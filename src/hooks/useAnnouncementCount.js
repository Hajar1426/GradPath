import { useCallback, useEffect, useMemo, useState } from 'react';
import { useData } from './useData';
import { useAuth } from './useAuth';
import { ROLES } from '../data/statusValues';
import { VIEW_ONLY_ROLES } from '../utils/roles';

const EVENT = 'gradpath:announcements-seen';

function seenKey(userId) {
    return `gradpath:announcementsSeen:${userId}`;
}

function readSeenAt(userId) {
    try {
        return Number(localStorage.getItem(seenKey(userId))) || 0;
    } catch {
        return 0;
    }
}

export function useAnnouncementCount() {
    const { data } = useData();
    const { currentUser } = useAuth();
    const userId = currentUser?.id;
    const role = currentUser?.role;
    const audienceRole = VIEW_ONLY_ROLES.includes(role) ? ROLES.COORDINATOR : role;
    const [seenAt, setSeenAt] = useState(() => readSeenAt(userId));

    useEffect(() => {
        const refresh = () => setSeenAt(readSeenAt(userId));
        refresh();
        window.addEventListener(EVENT, refresh);
        return () => window.removeEventListener(EVENT, refresh);
    }, [userId]);

    const newCount = useMemo(() => {
        const list = data.announcements ?? [];
        return list.filter((a) => {
            const published = String(a.status).toLowerCase() === 'published';
            const when = new Date(a.publishedAt ?? a.at ?? 0).getTime();
            const forMe = !a.audience || a.audience.includes(audienceRole);
            return published && forMe && when > seenAt;
        }).length;
    }, [data.announcements, seenAt ,audienceRole]);

    const markSeen = useCallback(() => {
        try {
            localStorage.setItem(seenKey(userId), String(Date.now()));
        } catch {
            /* storage blocked: the count just stays */
        }
        window.dispatchEvent(new Event(EVENT));
    }, [userId]);

    return { newCount, markSeen };
}