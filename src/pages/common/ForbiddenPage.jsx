import { Link } from 'react-router-dom';

export default function ForbiddenPage() {
    return (
        <main className="center-card">
            <h1 className="page__title">403 · Not allowed</h1>
            <p className="page__subtitle">Your role cannot open this page.</p>
            <p style={{ marginTop: 24 }}><Link to="/">Go to your home page</Link></p>
        </main>
    );
}