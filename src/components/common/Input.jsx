import { useId } from 'react';

export default function Input({ label, error, hint, id, className = '', ...rest }) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

    return (
        <div className={`field ${className}`.trim()}>
            {label && (
                <label htmlFor={inputId}>
                    {label}
                    {rest.required && <span aria-hidden="true"> *</span>}
                </label>
            )}
            <input id={inputId} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...rest} />
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