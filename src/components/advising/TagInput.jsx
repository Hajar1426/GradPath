import { useId, useState } from 'react';
import Button from '../common/Button';

// A list of short tags (research areas, course codes) that the user can add to and remove from.
// Usage: <TagInput label="Research areas" values={areas} onChange={setAreas} placeholder="e.g. Security" />
// Press Enter or click Add to add a tag. Click × on a tag to remove it.
export default function TagInput({ label, values, onChange, placeholder, hint, error, max = 8, transform = (text) => text }) {
    const id = useId();
    const [text, setText] = useState('');
    const [problem, setProblem] = useState('');

    function addTag() {
        const tag = transform(text.trim());
        if (!tag) return;
        // Same tag in any capitalisation counts as a duplicate.
        if (values.some((v) => v.toLowerCase() === tag.toLowerCase())) {
            setProblem(`"${tag}" is already in the list.`);
            return;
        }
        if (values.length >= max) {
            setProblem(`You can add up to ${max}.`);
            return;
        }
        onChange([...values, tag]);
        setText('');
        setProblem('');
    }

    function removeTag(tag) {
        onChange(values.filter((v) => v !== tag));
    }

    function handleKeyDown(event) {
        // Enter adds the tag instead of submitting the whole form.
        if (event.key === 'Enter') {
            event.preventDefault();
            addTag();
        }
    }

    const message = problem || error;

    return (
        <div className="field">
            <label htmlFor={id}>{label}</label>
            {values.length > 0 && (
                <ul className="advisor-tags tag-input__list">
                    {values.map((tag) => (
                        <li key={tag} className="advisor-tag tag-input__tag">
                            {tag}
                            <button type="button" className="tag-input__remove" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <div className="tag-input__row">
                <input
                    id={id}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    aria-invalid={message ? true : undefined}
                    aria-describedby={message ? `${id}-error` : hint ? `${id}-hint` : undefined}
                />
                <Button variant="ghost" onClick={addTag}>Add</Button>
            </div>
            {hint && !message && <p className="hint" id={`${id}-hint`}>{hint}</p>}
            {message && <p className="error" id={`${id}-error`} role="alert">{message}</p>}
        </div>
    );
}
