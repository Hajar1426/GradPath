const ICONS = { success: '✓', error: '✕', warning: '!', info: 'i' };

export default function Toast({ variant = 'success', message, onClose }) {
    return (
        <div className={`toast toast--${variant}`} role={variant === 'error' ? 'alert' : undefined}>
            <span className="toast__icon" aria-hidden="true">{ICONS[variant]}</span>
            <span className="toast__text">{message}</span>
            <button type="button" className="toast__close" onClick={onClose} aria-label="Dismiss message">
                ×
            </button>
        </div>
    );
}