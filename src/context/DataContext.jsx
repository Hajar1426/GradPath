import { useState, useEffect, useCallback, useMemo } from 'react';
import { DataContext } from './contexts';
import { getInitialData } from '../data';
import { loadJSON, saveJSON, removeKey } from '../utils/storage';

const KEY = 'data';

export function DataProvider({ children }) {
    const [data, setData] = useState(() => loadJSON(KEY, null) ?? getInitialData());

    useEffect(() => {
        saveJSON(KEY, data);
    }, [data]);

    const updateCollection = useCallback((name, updater) => {
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
        () => ({ data, updateCollection, addAuditEvent, addNotification, resetData }),
        [data, updateCollection, addAuditEvent, addNotification, resetData],
    );

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}