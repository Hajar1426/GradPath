const ICONS = { info: 'i', success: '✓', warning: '!', error: '✕' };

export default function Alert({ variant = 'info', title, children, onClose }) {
    return (
        <div className={`alert alert--${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
            <span className="alert__icon" aria-hidden="true">{ICONS[variant]}</span>
            <div className="alert__body">
                {title && <p className="alert__title">{title}</p>}
                {children && <p className="alert__text">{children}</p>}
            </div>
            {onClose && (
                <button type="button" className="alert__close" onClick={onClose} aria-label="Dismiss message">
                    ×
                </button>
            )}
        </div>
    );
}