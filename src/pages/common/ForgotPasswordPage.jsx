import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../hooks/useData';
import { generateActivationCode } from '../../utils/activation';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { getEmailError } from '../../utils/emailRules';

export default function ForgotPasswordPage() {
    const { data, updateCollection } = useData();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);
    const [code, setCode] = useState(null);

    function handleSubmit(event) {
        event.preventDefault();
        const target = email.trim().toLowerCase();
        const emailError = getEmailError(email);
        if (emailError) {
            setError(emailError);
            return;
        }
        setError('');

        const user = data.users.find((u) => u.email.toLowerCase() === target && u.status === 'active');
        if (user) {
            const resetCode = generateActivationCode();
            updateCollection('users', (list) =>
                list.map((u) => (u.id === user.id ? { ...u, resetCode } : u)),
            );
            setCode(resetCode);
        } else {
            setCode(null);
        }
        setSent(true);
    }

    return (
        <main className="center-card">
            <p className="hint">
                <Link to="/sign-in">← Back to sign in</Link>
            </p>

            {sent ? (
                <>
                    <h1 className="page__title">Check your email</h1>
                    <p className="page__subtitle">
                        If an active account exists for {email.trim()}, we sent a link to reset the password.
                    </p>
                    {code && (
                        <p className="hint" role="status">
                            <Link to={`/reset-password/${code}`}>Open reset email (demo)</Link>
                        </p>
                    )}
                </>
            ) : (
                <>
                    <h1 className="page__title">Forgot your password?</h1>
                    <p className="page__subtitle">Enter your university email and we will send you a reset link.</p>
                    <form onSubmit={handleSubmit} noValidate style={{ marginTop: 24 }}>
                        <Input
                            id="email"
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={error}
                        />
                        <Button type="submit" style={{ marginTop: 8 }}>Send reset link</Button>
                    </form>
                </>
            )}
        </main>
    );
}