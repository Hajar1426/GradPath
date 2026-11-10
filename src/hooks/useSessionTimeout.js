import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useToast } from './useToast';
import { useSecuritySettings } from './useSecuritySettings';

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

// Signs the user out after the configured number of minutes without activity.
export function useSessionTimeout() {
    const { signOut } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { sessionTimeoutMinutes } = useSecuritySettings();

    const latest = useRef({});
    latest.current = { signOut, navigate, showToast };

    useEffect(() => {
        const limit = sessionTimeoutMinutes * 60 * 1000;
        let timer;

        function expire() {
            latest.current.signOut();
            latest.current.navigate('/sign-in', { replace: true });
            latest.current.showToast('You were signed out because of inactivity.');
        }

        function restart() {
            clearTimeout(timer);
            timer = setTimeout(expire, limit);
        }

        ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, restart, { passive: true }));
        restart();

        return () => {
            clearTimeout(timer);
            ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, restart));
        };
    }, [sessionTimeoutMinutes]);
}