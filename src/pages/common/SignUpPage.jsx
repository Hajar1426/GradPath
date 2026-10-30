import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { ROLES, ACCOUNT_STATUS } from '../../data/statusValues';
import { HOME_BY_ROLE } from '../../utils/roles';

const EMAIL_PATTERN = /^[^\s@]+@kfupm\.edu\.sa$/i;

function Field({ id, label, error, children }) {
    return (
        <div className="field">
            <label htmlFor={id}>{label}</label>
            {children}
            {error && (
                <p className="error" id={`${id}-error`} role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

export default function SignUpPage() {
    const { currentUser } = useAuth();
    const { data, updateCollection, addAuditEvent } = useData();
    const [form, setForm] = useState({
        name: '',
        email: '',
        role: ROLES.STUDENT,
        password: '',
        confirm: '',
    });
    const [errors, setErrors] = useState({});
    const [done, setDone] = useState(false);

    if (currentUser) {
        return <Navigate to={HOME_BY_ROLE[currentUser.role]} replace />;
    }

    function setField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function validate() {
        const next = {};
        const email = form.email.trim();
        if (!form.name.trim()) next.name = 'Enter your full name.';
        if (!email) next.email = 'Enter your university email.';
        else if (!EMAIL_PATTERN.test(email)) next.email = 'Use your university email ending in @kfupm.edu.sa.';
        else if (data.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
            next.email = 'An account with this email already exists.';
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

        const id = `u-${Date.now()}`;
        updateCollection('users', (list) => [
            ...list,
            {
                id,
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password,
                role: form.role,
                status: ACCOUNT_STATUS.ACTIVE,
            },
        ]);
        addAuditEvent({ userId: id, action: 'account_created' });
        setDone(true);
    }

    if (done) {
        return (
            <main className="center-card">
                <h1 className="page__title">Account created</h1>
                <p className="page__subtitle">Your account is ready. You can sign in now.</p>
                <p style={{ marginTop: 24 }}>
                    <Link className="btn" to="/sign-in" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
                        Back to sign in
                    </Link>
                </p>
            </main>
        );
    }

    return (
        <main className="center-card">
            <h1 className="page__title">Create an account</h1>
            <p className="page__subtitle">For students and faculty.</p>
            <form onSubmit={handleSubmit} noValidate style={{ marginTop: 24 }}>
                <Field id="name" label="Full name" error={errors.name}>
                    <input
                        id="name"
                        value={form.name}
                        onChange={(e) => setField('name', e.target.value)}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                </Field>
                <Field id="email" label="University email" error={errors.email}>
                    <input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setField('email', e.target.value)}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                </Field>
                <Field id="role" label="I am a">
                    <select id="role" value={form.role} onChange={(e) => setField('role', e.target.value)}>
                        <option value={ROLES.STUDENT}>Student</option>
                        <option value={ROLES.ADVISOR}>Faculty member (advisor)</option>
                    </select>
                </Field>
                <Field id="password" label="Password" error={errors.password}>
                    <input
                        id="password"
                        type="password"
                        value={form.password}
                        onChange={(e) => setField('password', e.target.value)}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                    />
                </Field>
                <Field id="confirm" label="Confirm password" error={errors.confirm}>
                    <input
                        id="confirm"
                        type="password"
                        value={form.confirm}
                        onChange={(e) => setField('confirm', e.target.value)}
                        aria-invalid={!!errors.confirm}
                        aria-describedby={errors.confirm ? 'confirm-error' : undefined}
                    />
                </Field>
                <button className="btn" type="submit">Create account</button>
            </form>
            <p className="hint">
                Already have an account? <Link to="/sign-in">Sign in</Link>
            </p>
        </main>
    );
}