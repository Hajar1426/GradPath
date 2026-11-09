import { useState, useEffect, useCallback, useMemo, useRef } from 'react';import { DataContext } from './contexts';
import { getInitialData } from '../data';
import { loadJSON, saveJSON, removeKey } from '../utils/storage';

const KEY = 'data';

// A view-only user may still change their own notifications, account and audit trail. Nothing else.
const WRITABLE_WHEN_READ_ONLY = ['notifications', 'users', 'auditEvents'];

export function DataProvider({ children }) {
    const [data, setData] = useState(() => loadJSON(KEY, null) ?? getInitialData());

    useEffect(() => {
        saveJSON(KEY, data);
    }, [data]);

    const readOnlyRef = useRef(false);
    const setReadOnly = useCallback((value) => {
        readOnlyRef.current = value;
    }, []);

    const updateCollection = useCallback((name, updater) => {
        if (readOnlyRef.current && !WRITABLE_WHEN_READ_ONLY.includes(name)) {
            console.warn(`View-only account: blocked a change to "${name}".`);
            return;
        }
        setData((prev) => ({ ...prev, [name]: updater(prev[name] ?? []) }));
    }, []);

    const addAuditEvent = useCallback(
        (event) => {
            updateCollection('auditEvents', (list) => [
                { id: `audit-${Date.now()}`, at: new Date().toISOString(), ...event },
                ...list,
            ]);
        },
        [updateCollection],
    );

    const addNotification = useCallback(
        (notification) => {
            updateCollection('notifications', (list) => [
                { id: `note-${Date.now()}`, at: new Date().toISOString(), read: false, ...notification },
                ...list,
            ]);
        },
        [updateCollection],
    );

    const resetData = useCallback(() => {
        removeKey(KEY);
        setData(getInitialData());
    }, []);

    const value = useMemo(
        () => ({ data, updateCollection, addAuditEvent, addNotification, resetData, setReadOnly }),
        [data, updateCollection, addAuditEvent, addNotification, resetData, setReadOnly],
    );

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}