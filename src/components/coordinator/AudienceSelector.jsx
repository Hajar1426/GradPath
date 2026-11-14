import { AUDIENCE_OPTIONS } from '../../utils/coordinatorHelpers';

export default function AudienceSelector({ value, onChange, error, disabled }) {
    function toggle(role) {
        onChange(value.includes(role) ? value.filter((r) => r !== role) : [...value, role]);
    }
    return (
        <fieldset className="checkbox-group" aria-invalid={error ? true : undefined} aria-describedby={error ? 'audience-error' : undefined}>
            <legend>Audience *</legend>
            {AUDIENCE_OPTIONS.map((option) => (
                <label key={option.value} className="checkbox">
                    <input type="checkbox" checked={value.includes(option.value)} onChange={() => toggle(option.value)} disabled={disabled} />
                    {option.label}
                </label>
            ))}
            {error && (
                <p className="error" id="audience-error" role="alert">
                    {error}
                </p>
            )}
        </fieldset>
    );
}
