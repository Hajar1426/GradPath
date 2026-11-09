import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';
import { ROLES, ACCOUNT_STATUS } from '../../data/statusValues';
import { generateActivationCode } from '../../utils/activation';
import { getEmailError } from '../../utils/emailRules';

const ROLE_OPTIONS = [
    { value: ROLES.STUDENT, label: 'Student' },
    { value: ROLES.ADVISOR, label: 'Advisor' },
    { value: ROLES.COORDINATOR, label: 'Coordinator' },
    { value: ROLES.DEAN, label: 'Dean' },
    { value: ROLES.CHAIRPERSON, label: 'Chairperson' },
    { value: ROLES.ADMIN, label: 'Admin' },
];

const EMPTY_FORM = { name: '', email: '', role: ROLES.STUDENT, password: '' };

export default function AddUserPage() {
    const { currentUser } = useAuth();
    const { data, updateCollection, addAuditEvent } = useData();
    const { showToast } = useToast();
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [created, setCreated] = useState(null);

    const isStudent = form.role === ROLES.STUDENT;

    function setField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function findRosterRow(email) {
        return (data.studentRoster ?? []).find((r) => r.email.toLowerCase() === email.toLowerCase());
    }

    function validate() {
        const next = {};
        const email = form.email.trim();
        if (!isStudent && !form.name.trim()) next.name = 'Enter the full name.';
        const emailError = getEmailError(email);
        if (emailError) {
            next.email = emailError;
        } else if (data.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
            next.email = 'An account with this email already exists.';
        } else if (isStudent && !findRosterRow(email)) {
            next.email = 'This email is not on the approved student list. The coordinator must upload it first.';
        }
        if (form.password.length < 8) next.password = 'Use at least 8 characters.';
        return next;
    }

    function handleSubmit(event) {
        event.preventDefault();
        const next = validate();
        setErrors(next);
        if (Object.keys(next).length > 0) return;

        const id = `u-${Date.now()}`;
        const activationCode = generateActivationCode();
        const email = form.email.trim().toLowerCase();
        const row = isStudent ? findRosterRow(email) : null;
        const name = row ? row.name : form.name.trim();
        updateCollection('users', (list) => [
            ...list,
            { id, name, email, password: form.password, role: form.role, status: ACCOUNT_STATUS.PENDING, activationCode },
        ]);
        if (row) {
            updateCollection('studentRoster', (list) =>
                list.map((r) => (r.id === row.id ? { ...r, hasAccount: true } : r)),
            );
        }
        addAuditEvent({ userId: id, actorId: currentUser.id, action: 'account_created' });
        showToast(`Account created for ${name}.`);
        setCreated({ name, email, activationCode });
    }

    function addAnother() {
        setForm(EMPTY_FORM);
        setErrors({});
        setCreated(null);
    }

    if (created) {
        return (
            <main className="page">
                <PageHeader title="Account created" subtitle={`${created.name} was added as a pending account.`} />
                <p style={{ maxWidth: 560 }}>
                    We sent an activation link to {created.email}. They must activate the account before signing in,
                    then use the temporary password you set.
                </p>
                <p className="hint">
                    Prototype note: no real email is sent. Use the button below to open the link as if it was in
                    their inbox.
                </p>
                <div className="table__actions" style={{ marginTop: 16 }}>
                    <Link className="btn" to={`/activate/${created.activationCode}`}>
                        Open activation email (demo)
                    </Link>
                    <Button variant="ghost" onClick={addAnother}>Add another user</Button>
                    <Link className="btn btn--ghost" to="/admin/users">Back to user accounts</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="page">
            <p className="hint">
                <Link to="/admin/users">← Back to user accounts</Link>
            </p>
            <PageHeader title="Add user" subtitle="Create an account. The user activates it from an emailed link." />
            <form onSubmit={handleSubmit} noValidate style={{ marginTop: 24, maxWidth: 480 }}>
                <Select
                    id="role"
                    label="Role"
                    options={ROLE_OPTIONS}
                    value={form.role}
                    onChange={(e) => setField('role', e.target.value)}
                    hint={isStudent ? 'Students must be on the approved list. Their name, degree and study load come from it.' : undefined}
                />
                {!isStudent && (
                    <Input
                        id="name"
                        label="Full name"
                        value={form.name}
                        onChange={(e) => setField('name', e.target.value)}
                        error={errors.name}
                    />
                )}
                <Input
                    id="email"
                    label="University email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    error={errors.email}
                />
                <Input
                    id="password"
                    label="Temporary password"
                    type="password"
                    autoComplete="new-password"
                    hint="At least 8 characters. Share it with the user securely. They can change it in Settings."
                    value={form.password}
                    onChange={(e) => setField('password', e.target.value)}
                    error={errors.password}
                />
                <Button type="submit" style={{ marginTop: 8 }}>Create account</Button>
            </form>
        </main>
    );
}