// <Tabs tabs={[{ id: 'core', label: 'Core' }]} active={tab} onChange={setTab} />
// Put each panel in: <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
export default function Tabs({ tabs, active, onChange, label = 'Sections' }) {
    function handleKeyDown(event, index) {
        let next = null;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        if (next === null) return;
        event.preventDefault();
        onChange(tabs[next].id);
        document.getElementById(`tab-${tabs[next].id}`)?.focus();
    }

    return (
        <div className="tabs" role="tablist" aria-label={label}>
            {tabs.map((tab, index) => (
                <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`tab-${tab.id}`}
                    aria-controls={`panel-${tab.id}`}
                    aria-selected={tab.id === active}
                    tabIndex={tab.id === active ? 0 : -1}
                    className="tabs__tab"
                    onClick={() => onChange(tab.id)}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}