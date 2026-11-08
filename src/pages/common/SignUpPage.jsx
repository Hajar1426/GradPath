import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { ROLES, ACCOUNT_STATUS } from '../../data/statusValues';
import { HOME_BY_ROLE } from '../../utils/roles';
import { generateActivationCode } from '../../utils/activation';
import { getEmailError } from '../../utils/emailRules';
import BackLink from '../../components/common/BackLink.jsx';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function SignUpPage() {
    const { currentUser } = useAuth();
    const { data, updateCollection, addAuditEvent } = useData();
    const [form, setForm] = useState({ email: '', password: '', confirm: '' });
    const [errors, setErrors] = useState({});
    const [created, setCreated] = useState(null);

    if (currentUser) {
        return <Navigate to={HOME_BY_ROLE[currentUser.role]} replace />;
    }

    function setField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function findRosterRow(email) {
        return (data.studentRoster ?? []).find((r) => r.email.toLowerCase() === email.toLowerCase());
    }

    function validate() {
        const next = {};
        const email = form.email.trim();
        const emailError = getEmailError(email);
        if (emailError) {
            next.email = emailError;
        } else {
            const row = findRosterRow(email);
            if (!row) {
                next.email = 'We could not find this email in the approved student list. Contact the coordinator.';
            } else if (row.hasAccount || data.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
                next.email = 'An account with this email already exists.';
            }
        }
        if (form.password.length < 8) next.password = 'Password must be at least 8 characters.';
        if (form.confirm !== form.password) next.confirm = 'Passwords do not match.';
        return next;
    }

    function handleSubmit(event) {
        event.preventDefault();
        const next = validate();
        setErrors(next);
        if (Object.keys(next).length > 0) return;

        const email = form.email.trim().toLowerCase();
        const row = findRosterRow(email);
        const id = `u-${Date.now()}`;
        const activationCode = generateActivationCode();
        updateCollection('users', (list) => [
            ...list,
            {
                id,
                name: row.name,
                email,
                password: form.password,
                role: ROLES.STUDENT,
                status: ACCOUNT_STATUS.PENDING,
                activationCode,
            },
        ]);
        updateCollection('studentRoster', (list) =>
            list.map((r) => (r.id === row.id ? { ...r, hasAccount: true } : r)),
        );
        addAuditEvent({ userId: id, actorId: id, action: 'account_created' });
        setCreated({ name: row.name, email, activationCode });
    }

    if (created) {
        return (
            <main className="center-card">
                <h1 className="page__title">Check your email</h1>
                <p className="page__subtitle">
                    Welcome, {created.name}. We sent an activation link to {created.email}. Open it to activate your
                    account, then sign in.
                </p>
                <p className="hint">
                    Prototype note: no real email is sent. Use the button below to open the link as if it was
                    in your inbox.
                </p>
                <p style={{ marginTop: 16 }}>
                    <Link className="btn" to={`/activate/${created.activationCode}`}>
                        Open activation email (demo)
                    </Link>
                </p>
            </main>
        );
    }

    return (
        <main className="center-card">
            <BackLink />
            <h1 className="page__title">Create an account</h1>
            <p className="page__subtitle">
                For students on the approved list. Faculty and staff accounts are created by the administrator.
            </p>
            <form onSubmit={handleSubmit} noValidate style={{ marginTop: 24 }}>
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
                    label="Password"
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => setField('password', e.target.value)}
                    error={errors.password}
                />
                <Input
                    id="confirm"
                    label="Confirm password"
                    type="password"
                    autoComplete="new-password"
                    value={form.confirm}
                    onChange={(e) => setField('confirm', e.target.value)}
                    error={errors.confirm}
                />
                <Button type="submit" style={{ marginTop: 8 }}>Create account</Button>
            </form>
            <p className="hint">
                Already have an account? <Link to="/sign-in">Sign in</Link>
            </p>
        </main>
    );
}