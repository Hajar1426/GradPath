import { useId } from 'react';

// Pass options={[{ value: 'a', label: 'Option A' }]} or put <option> elements inside.
export default function Select({ label, error, hint, id, options, className = '', children, ...rest }) {
    const autoId = useId();
    const selectId = id ?? autoId;
    const errorId = `${selectId}-error`;
    const hintId = `${selectId}-hint`;
    const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

    return (
        <div className={`field ${className}`.trim()}>
            {label && (
                <label htmlFor={selectId}>
                    {label}
                    {rest.required && <span aria-hidden="true"> *</span>}
                </label>
            )}
            <select id={selectId} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...rest}>
                {options
                    ? options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))
                    : children}
            </select>
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