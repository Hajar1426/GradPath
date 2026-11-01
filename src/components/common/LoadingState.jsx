export default function LoadingState({ label = 'Loading…' }) {
    return (
        <div className="state" role="status" aria-live="polite">
            <div className="spinner" aria-hidden="true" />
            <p className="state__text">{label}</p>
        </div>
    );
}