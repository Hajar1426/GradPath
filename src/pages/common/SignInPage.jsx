import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HOME_BY_ROLE } from '../../utils/roles';

const MESSAGES = {
    invalid: 'Email or password is incorrect.',
    disabled: 'This account is disabled. Contact the administrator.',
    pending: 'This account is not activated yet. Check your activation email.',
};

export default function SignInPage() {
    const { currentUser, signIn } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (currentUser) {
        return <Navigate to={HOME_BY_ROLE[currentUser.role]} replace />;
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (!email.trim() || !password) {
            setError('Enter your email and password.');
            return;
        }
        const result = signIn(email, password);
        if (!result.ok) {
            setError(MESSAGES[result.error]);
            return;
        }
        navigate(HOME_BY_ROLE[result.user.role], { replace: true });
    }

    return (
        <main className="center-card">
            <h1 className="page__title">Sign in</h1>
            <p className="page__subtitle">Use your university email.</p>
            <form onSubmit={handleSubmit} noValidate style={{ marginTop: 24 }}>
                <div className="field">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="field">
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error && <p className="error" role="alert">{error}</p>}
                <button className="btn" type="submit">Sign in</button>
            </form>
            <p className="hint">
                Demo accounts (password demo1234): student@, advisor@, coordinator@ and admin@kfupm.edu.sa
            </p>
        </main>
    );
}