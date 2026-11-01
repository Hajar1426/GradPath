export default function SearchBar({ value, onChange, placeholder = 'Search', label = 'Search' }) {
    return (
        <div className="searchbar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
                className="searchbar__input"
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                aria-label={label}
            />
        </div>
    );
}