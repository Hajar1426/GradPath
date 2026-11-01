export default function EmptyState({ title, message, action }) {
    return (
        <div className="state">
            <p className="state__title">{title}</p>
            {message && <p className="state__text">{message}</p>}
            {action}
        </div>
    );
}