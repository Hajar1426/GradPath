import { useState, useCallback, useMemo } from 'react';
import { AuthContext } from './contexts';
import { useData } from '../hooks/useData';
import { ACCOUNT_STATUS } from '../data/statusValues';
import { loadJSON, saveJSON, removeKey } from '../utils/storage';

const SESSION_KEY = 'session';

export function AuthProvider({ children }) {
    const { data, addAuditEvent } = useData();
    const [userId, setUserId] = useState(() => loadJSON(SESSION_KEY, null));

    const currentUser = useMemo(
        () => data.users.find((u) => u.id === userId) ?? null,
        [data.users, userId],
    );

    const signIn = useCallback(
        (email, password) => {
            const user = data.users.find(
                (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
            );
            if (!user || user.password !== password) return { ok: false, error: 'invalid' };
            if (user.status === ACCOUNT_STATUS.DISABLED) return { ok: false, error: 'disabled' };
            if (user.status === ACCOUNT_STATUS.PENDING) return { ok: false, error: 'pending' };
            setUserId(user.id);
            saveJSON(SESSION_KEY, user.id);
            addAuditEvent({ userId: user.id, action: 'sign_in' });
            return { ok: true, user };
        },
        [data.users, addAuditEvent],
    );

    const signOut = useCallback(() => {
        if (currentUser) addAuditEvent({ userId: currentUser.id, action: 'sign_out' });
        setUserId(null);
        removeKey(SESSION_KEY);
    }, [currentUser, addAuditEvent]);

    const value = useMemo(
        () => ({ currentUser, isAuthenticated: !!currentUser, signIn, signOut }),
        [currentUser, signIn, signOut],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}