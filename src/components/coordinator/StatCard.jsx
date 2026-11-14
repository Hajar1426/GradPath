import { Link } from 'react-router-dom';
import Button from '../common/Button';

// Each card works out its own value, so one broken list never breaks the whole page.
// compute() returns { value, note } or throws. tone: 'dark' | 'orange' | 'red' | 'maroon'.
export default function StatCard({ label, compute, to, tone = 'dark', action, onRetry }) {
    let result = null;
    let failed = false;
    try {
        result = compute();
    } catch {
        failed = true;
    }

    if (failed) {
        return (
            <div className="stat-card stat-card--error" role="alert">
                <span className="stat-card__label">{label}</span>
                <span className="stat-card__error">Could not load this number.</span>
                {onRetry && (
                    <Button variant="ghost" onClick={onRetry}>
                        Try again
                    </Button>
                )}
            </div>
        );
    }

    const body = (
        <>
            <span className="stat-card__label">{label}</span>
            <span className={`stat-card__value stat-card__value--${tone}`}>{result.value}</span>
            {result.note && <span className="stat-card__note">{result.note}</span>}
            {action && <span className="stat-card__note">{action}</span>}
        </>
    );
    if (to?.startsWith('#')) {
        return (
            <a className="stat-card" href={to}>
                {body}
            </a>
        );
    }
    return to ? (
        <Link className="stat-card" to={to}>
            {body}
        </Link>
    ) : (
        <div className="stat-card">{body}</div>
    );
}
