import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function ResetPasswordPage() {
    const { code } = useParams();
    const { data, updateCollection, addNotification } = useData();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [errors, setErrors] = useState({});

    const user = data.users.find((u) => u.resetCode && u.resetCode === code);

    if (!user) {
        return (
            <main className="center-card">
                <h1 className="page__title">This link is not valid</h1>
                <p className="page__subtitle">The reset link was already used or has expired.</p>
                <p className="hint">
                    <Link to="/forgot-password">Request a new link</Link>
                </p>
            </main>
        );
    }

    function handleSubmit(event) {
        event.preventDefault();
        const next = {};
        if (password.length < 8) next.password = 'Use at least 8 characters.';
        if (confirm !== password) next.confirm = 'The passwords do not match.';
        setErrors(next);
        if (Object.keys(next).length > 0) return;

        updateCollection('users', (list) =>
            list.map((u) => {
                if (u.id !== user.id) return u;
                const { resetCode, ...rest } = u;
                return { ...rest, password };
            }),
        );
        addNotification({
            userId: user.id,
            title: 'Password changed',
            body: 'Your password was changed. If this was not you, contact the administrator.',
            link: '/settings',
        });
        showToast('Password updated. Sign in with your new password.');
        navigate('/sign-in', { replace: true });
    }

    return (
        <main className="center-card">
            <h1 className="page__title">Set a new password</h1>
            <p className="page__subtitle">Choose a new password for {user.email}.</p>
            <form onSubmit={handleSubmit} noValidate style={{ marginTop: 24 }}>
                <Input
                    id="new-password"
                    label="New password"
                    type="password"
                    autoComplete="new-password"
                    hint="At least 8 characters."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                />
                <Input
                    id="confirm-password"
                    label="Confirm new password"
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    error={errors.confirm}
                />
                <Button type="submit" style={{ marginTop: 8 }}>Save new password</Button>
            </form>
        </main>
    );
}