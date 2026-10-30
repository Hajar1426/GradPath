import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <main className="center-card">
            <h1 className="page__title">404 · Page not found</h1>
            <p className="page__subtitle">This page does not exist.</p>
            <p style={{ marginTop: 24 }}><Link to="/">Go to the home page</Link></p>
        </main>
    );
}