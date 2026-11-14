import { ANNOUNCEMENT_CATEGORIES } from '../../data/announcements';

const CATEGORY_LABEL = Object.fromEntries(ANNOUNCEMENT_CATEGORIES.map((c) => [c.value, c.label]));

export function CategoryTag({ category }) {
    return <span className={`tag tag--${category ?? 'general'}`}>{CATEGORY_LABEL[category] ?? 'General'}</span>;
}

// Toggle buttons that filter by category. value is 'all' or a category.
export default function CategoryChips({ value, onChange, counts }) {
    const options = [{ value: 'all', label: 'All' }, ...ANNOUNCEMENT_CATEGORIES];
    return (
        <div className="chips" role="group" aria-label="Filter by category">
            {options.map((o) => (
                <button key={o.value} type="button" className="chip" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
                    {o.label}
                    {counts && <span className="chip__count">{counts[o.value] ?? 0}</span>}
                </button>
            ))}
        </div>
    );
}
