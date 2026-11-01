import { useId, useState } from 'react';

export default function Input({ label, error, hint, id, className = '', type = 'text', ...rest }) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;
    const [visible, setVisible] = useState(false);
    const isPassword = type === 'password';

    const control = (
        <input
            id={inputId}
            type={isPassword && visible ? 'text' : type}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            {...rest}
        />
    );

    return (
        <div className={`field ${className}`.trim()}>
            {label && (
                <label htmlFor={inputId}>
                    {label}
                    {rest.required && <span aria-hidden="true"> *</span>}
                </label>
            )}
            {isPassword ? (
                <div className="input-wrap">
                    {control}
                    <button
                        type="button"
                        className="input-toggle"
                        onClick={() => setVisible((v) => !v)}
                        aria-label={visible ? 'Hide password' : 'Show password'}
                        aria-pressed={visible}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                            <circle cx="12" cy="12" r="3" />
                            {!visible && <path d="M3 3l18 18" />}
                        </svg>
                    </button>
                </div>
            ) : (
                control
            )}
            {hint && (
                <p className="hint" id={hintId}>
                    {hint}
                </p>
            )}
            {error && (
                <p className="error" id={errorId} role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}