import { useData } from './useData';

const DEFAULTS = { sessionTimeoutMinutes: 30 };

// Reads the security settings. Falls back to the defaults if nothing was saved yet.
export function useSecuritySettings() {
    const { data } = useData();
    const stored = (data.settings ?? []).find((s) => s.id === 'security');
    return { ...DEFAULTS, ...stored };
}