// Simple accessible charts in HTML/CSS (no chart library). Every bar shows its value as text,
// and each chart has a hidden table for screen readers.

// data: [{ label, value }]
export function ColumnChart({ title, data, max, unit = '' }) {
    const top = Math.max(max ?? 0, ...data.map((d) => d.value), 1);
    return (
        <figure className="chart">
            <div className="column-chart" aria-hidden="true">
                <div className="column-chart__grid">
                    {[1, 0.75, 0.5, 0.25].map((f) => (
                        <span key={f} style={{ bottom: `${f * 100}%` }} />
                    ))}
                </div>
                {data.map((d) => (
                    <div key={d.label} className="column-chart__col" title={`${d.label}: ${d.value}${unit}`}>
                        <span className="column-chart__value">{d.value}{unit}</span>
                        <span className="column-chart__bar" style={{ height: `${(d.value / top) * 100}%` }} />
                    </div>
                ))}
            </div>
            <div className="column-chart__labels" aria-hidden="true">
                {data.map((d) => (
                    <span key={d.label}>{d.label}</span>
                ))}
            </div>
            <ChartTable title={title} data={data} unit={unit} />
        </figure>
    );
}

// data: [{ label, value, tone?: 'full', text? }]
export function BarChart({ title, data, max, unit = '' }) {
    const top = Math.max(max ?? 0, ...data.map((d) => d.value), 1);
    return (
        <figure className="chart">
            <ul className="bar-chart" aria-hidden="true">
                {data.map((d) => (
                    <li key={d.label} title={`${d.label}: ${d.text ?? d.value + unit}`}>
                        <span className="bar-chart__label">{d.label}</span>
                        <span className="bar-chart__track">
                            <span className={`bar-chart__bar${d.tone === 'full' ? ' bar-chart__bar--full' : ''}`} style={{ width: `${Math.max(2, (d.value / top) * 100)}%` }} />
                        </span>
                        <span className={`bar-chart__value${d.tone === 'full' ? ' bar-chart__value--full' : ''}`}>{d.text ?? `${d.value}${unit}`}</span>
                    </li>
                ))}
            </ul>
            <ChartTable title={title} data={data} unit={unit} />
        </figure>
    );
}

function ChartTable({ title, data, unit }) {
    return (
        <table className="sr-only">
            <caption>{title}</caption>
            <tbody>
                {data.map((d) => (
                    <tr key={d.label}>
                        <th scope="row">{d.label}</th>
                        <td>{d.text ?? `${d.value}${unit}`}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
