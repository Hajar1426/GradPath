import { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';
import { useSecuritySettings } from '../../hooks/useSecuritySettings';

function validateTimeout(text) {
    const value = text.trim();
    if (!value) return 'Enter a number of minutes.';
    if (!/^\d+$/.test(value)) return 'Use a whole number, for example 30.';
    const minutes = Number(value);
    if (minutes < 1 || minutes > 120) return 'Use a number between 1 and 120.';
    return '';
}

export default function SecuritySettingsPage() {
    const { currentUser } = useAuth();
    const { updateCollection, addAuditEvent } = useData();
    const { showToast } = useToast();
    const settings = useSecuritySettings();
    const [timeout, setTimeoutText] = useState(String(settings.sessionTimeoutMinutes));
    const [error, setError] = useState('');

    function handleSubmit(event) {
        event.preventDefault();
        const message = validateTimeout(timeout);
        setError(message);
        if (message) return;

        const minutes = Number(timeout.trim());
        if (minutes === settings.sessionTimeoutMinutes) {
            showToast('Nothing changed.');
            return;
        }
        updateCollection('settings', (list) => [
            ...list.filter((s) => s.id !== 'security'),
            { id: 'security', sessionTimeoutMinutes: minutes },
        ]);
        addAuditEvent({
            userId: null,
            actorId: currentUser.id,
            action: 'security_settings_changed',
            detail: `Session timeout: ${settings.sessionTimeoutMinutes} → ${minutes} minutes`,
        });
        setTimeoutText(String(minutes));
        showToast('Security settings saved.');
    }

    return (
        <main className="page">
            <PageHeader title="Security settings" subtitle="Rules that apply to everyone who signs in." />
            <form onSubmit={handleSubmit} noValidate style={{ marginTop: 24, maxWidth: 480 }}>
                <Input
                    id="timeout"
                    label="Session timeout (minutes)"
                    inputMode="numeric"
                    hint="Users are signed out after this many minutes without activity. Between 1 and 120."
                    value={timeout}
                    onChange={(e) => setTimeoutText(e.target.value)}
                    error={error}
                />
                <Button type="submit" style={{ marginTop: 8 }}>Save settings</Button>
            </form>
        </main>
    );
}