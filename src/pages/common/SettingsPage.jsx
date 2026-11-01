import { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';

function Section({ title, description, children }) {
    return (
        <section className="settings-section">
            <h2 className="settings-section__title">{title}</h2>
            {description && <p className="settings-section__text">{description}</p>}
            {children}
        </section>
    );
}

function AccountSection() {
    const { currentUser } = useAuth();
    const role = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);

    return (
        <Section
            title="Account"
            description="These details come from the university and cannot be changed here."
        >
            <Input label="Full name" value={currentUser.name} readOnly />
            <Input label="University email" value={currentUser.email} readOnly />
            <Input label="Role" value={role} readOnly />
        </Section>
    );
}

function PasswordSection() {
    const { currentUser } = useAuth();
    const { updateCollection, addAuditEvent } = useData();
    const { showToast } = useToast();
    const [form, setForm] = useState({ current: '', next: '', confirm: '' });
    const [errors, setErrors] = useState({});

    function setField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function handleSubmit(event) {
        event.preventDefault();
        const found = {};
        if (form.current !== currentUser.password) found.current = 'Current password is incorrect.';
        if (form.next.length < 8) found.next = 'Password must be at least 8 characters.';
        else if (form.next === form.current) found.next = 'Choose a different password.';
        if (form.confirm !== form.next) found.confirm = 'Passwords do not match.';
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        updateCollection('users', (list) =>
            list.map((u) => (u.id === currentUser.id ? { ...u, password: form.next } : u)),
        );
        addAuditEvent({ userId: currentUser.id, action: 'password_changed' });
        setForm({ current: '', next: '', confirm: '' });
        showToast('Password changed.');
    }

    return (
        <Section title="Change password" description="Use at least 8 characters.">
            <form onSubmit={handleSubmit} noValidate>
                <Input label="Current password" type="password" value={form.current} error={errors.current}
                       onChange={(e) => setField('current', e.target.value)} />
                <Input label="New password" type="password" value={form.next} error={errors.next}
                       onChange={(e) => setField('next', e.target.value)} />
                <Input label="Confirm new password" type="password" value={form.confirm} error={errors.confirm}
                       onChange={(e) => setField('confirm', e.target.value)} />
                <Button type="submit">Change password</Button>
            </form>
        </Section>
    );
}

function PreferencesSection() {
    const { currentUser } = useAuth();
    const { updateCollection } = useData();
    const { showToast } = useToast();
    const [form, setForm] = useState({
        emailUpdates: true,
        announcements: true,
        ...currentUser.preferences,
    });

    function setPref(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function handleSubmit(event) {
        event.preventDefault();
        updateCollection('users', (list) =>
            list.map((u) => (u.id === currentUser.id ? { ...u, preferences: form } : u)),
        );
        showToast('Preferences saved.');
    }

    return (
        <Section title="Notification preferences" description="In-app notifications are always on.">
            <form onSubmit={handleSubmit}>
                <label className="check">
                    <input type="checkbox" checked={form.emailUpdates}
                           onChange={(e) => setPref('emailUpdates', e.target.checked)} />
                    Email me about plan, report and authorization updates
                </label>
                <label className="check">
                    <input type="checkbox" checked={form.announcements}
                           onChange={(e) => setPref('announcements', e.target.checked)} />
                    Email me when a new announcement is published
                </label>
                <Button type="submit">Save preferences</Button>
            </form>
        </Section>
    );
}

function DemoDataSection() {
    const { resetData } = useData();
    const { showToast } = useToast();
    const [open, setOpen] = useState(false);

    function handleConfirm() {
        resetData();
        setOpen(false);
        showToast('Demo data was reset.');
    }

    return (
        <Section
            title="Demo data"
            description="This prototype saves data in your browser. Reset it to return to the starting accounts and sample data."
        >
            <Button variant="danger" onClick={() => setOpen(true)}>Reset demo data</Button>
            <ConfirmationDialog
                open={open}
                title="Reset demo data?"
                message="Accounts you created and any changes you made will be removed. The starting demo accounts come back."
                confirmLabel="Reset"
                variant="danger"
                onCancel={() => setOpen(false)}
                onConfirm={handleConfirm}
            />
        </Section>
    );
}

export default function SettingsPage() {
    return (
        <main className="page">
            <PageHeader title="Settings" subtitle="Manage your profile, password and notifications." />
            <AccountSection />
            <PasswordSection />
            <PreferencesSection />
            <DemoDataSection />
        </main>
    );
}