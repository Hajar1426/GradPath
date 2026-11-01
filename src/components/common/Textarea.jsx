import { useId } from 'react';

export default function Textarea({ label, error, hint, id, rows = 4, className = '', ...rest }) {
    const autoId = useId();
    const areaId = id ?? autoId;
    const errorId = `${areaId}-error`;
    const hintId = `${areaId}-hint`;
    const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

    return (
        <div className={`field ${className}`.trim()}>
            {label && (
                <label htmlFor={areaId}>
                    {label}
                    {rest.required && <span aria-hidden="true"> *</span>}
                </label>
            )}
            <textarea id={areaId} rows={rows} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...rest} />
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