import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useData } from '../../hooks/useData';
import { ACCOUNT_STATUS } from '../../data/statusValues';

export default function ActivatePage() {
    const { code } = useParams();
    const { data, updateCollection, addAuditEvent } = useData();
    const [done, setDone] = useState(false);
    const user = data.users.find((u) => u.activationCode === code);

    function handleActivate() {
        updateCollection('users', (list) =>
            list.map((u) =>
                u.id === user.id ? { ...u, status: ACCOUNT_STATUS.ACTIVE, activationCode: null } : u,
            ),
        );
        addAuditEvent({ userId: user.id, action: 'account_activated' });
        setDone(true);
    }

    if (done) {
        return (
            <main className="center-card">
                <h1 className="page__title">Account activated</h1>
                <p className="page__subtitle">Your account is ready. You can sign in now.</p>
                <p style={{ marginTop: 24 }}>
                    <Link className="btn" to="/sign-in">Sign in</Link>
                </p>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="center-card">
                <h1 className="page__title">Link not valid</h1>
                <p className="page__subtitle">
                    This activation link is not valid, or it was already used. Try signing in, and request a new
                    activation email if needed.
                </p>
                <p style={{ marginTop: 24 }}>
                    <Link className="btn" to="/sign-in">Go to sign in</Link>
                </p>
            </main>
        );
    }

    if (user.status === ACCOUNT_STATUS.ACTIVE) {
        return (
            <main className="center-card">
                <h1 className="page__title">Already activated</h1>
                <p className="page__subtitle">This account is already active.</p>
                <p style={{ marginTop: 24 }}>
                    <Link className="btn" to="/sign-in">Sign in</Link>
                </p>
            </main>
        );
    }

    return (
        <main className="center-card">
            <h1 className="page__title">Activate your account</h1>
            <p className="page__subtitle">
                Hello {user.name}. Confirm that {user.email} is your university email to finish setting up
                your account.
            </p>
            <p style={{ marginTop: 24 }}>
                <button className="btn" onClick={handleActivate}>Activate account</button>
            </p>
        </main>
    );
}