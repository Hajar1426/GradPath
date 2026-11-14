import { useMemo } from 'react';

import { DAYS, START_HOUR, END_HOUR, HOUR_PX, AREAS, buildSchedule } from '../../utils/schedule';

export default function WeeklySchedule({ offerings }) {
    const { byDay, clashes } = useMemo(() => buildSchedule(offerings), [offerings]);
    const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
    const height = (END_HOUR - START_HOUR) * HOUR_PX;
    const unscheduled = offerings.filter((o) => !o.time || !o.days);

    return (
        <div>
            <ul className="area-legend" aria-label="Course areas">
                {AREAS.map((a) => (
                    <li key={a}>
                        <span className={`area-swatch area--${a}`} aria-hidden="true" /> Area {a}
                    </li>
                ))}
            </ul>

            {clashes.length > 0 && (
                <div className="alert alert--warning" role="status">
                    <span className="alert__icon" aria-hidden="true">!</span>
                    <div className="alert__body">
                        <p className="alert__title">{clashes.length} time clash{clashes.length > 1 ? 'es' : ''} to check before publishing</p>
                        <ul className="clash-list">
                            {clashes.map((c, i) => (
                                <li key={i}>
                                    {c.day}: {c.a.courseCode} ({c.a.time}) and {c.b.courseCode} ({c.b.time})
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <div className="timetable-scroll">
                <div className="timetable" role="table" aria-label="Weekly timetable">
                    <div className="timetable__head" role="row">
                        <span role="columnheader"><span className="sr-only">Time</span></span>
                        {DAYS.map((d) => (
                            <span key={d.key} role="columnheader" className="timetable__day">{d.label}</span>
                        ))}
                    </div>
                    <div className="timetable__body" style={{ height }}>
                        <div className="timetable__hours" aria-hidden="true">
                            {hours.map((h) => (
                                <span key={h} style={{ top: (h - START_HOUR) * HOUR_PX }}>{String(h).padStart(2, '0')}:00</span>
                            ))}
                        </div>
                        {hours.map((h) => (
                            <div key={h} className="timetable__line" style={{ top: (h - START_HOUR) * HOUR_PX }} aria-hidden="true" />
                        ))}
                        {DAYS.map((d, dayIndex) => (
                            <div key={d.key} className="timetable__col" role="row" aria-label={d.label} style={{ gridColumn: dayIndex + 2 }}>
                                {byDay[d.key].map((b) => {
                                    const o = b.offering;
                                    const top = ((b.start - START_HOUR * 60) / 60) * HOUR_PX;
                                    const h = ((b.end - b.start) / 60) * HOUR_PX;
                                    return (
                                        <div
                                            key={o.id + d.key}
                                            role="cell"
                                            className={`timetable__block area--${o.area ?? 'A'}${b.clash ? ' timetable__block--clash' : ''}${o.status === 'draft' ? ' timetable__block--draft' : ''}`}
                                            style={{ top, height: h - 4, left: `calc(${(b.lane / b.lanes) * 100}% + 3px)`, width: `calc(${100 / b.lanes}% - 6px)` }}
                                            title={`${o.courseCode} ${o.title ?? ''}, ${o.time}`}
                                        >
                                            <strong>
                                                {o.courseCode}
                                                {b.clash && <span className="timetable__flag timetable__flag--clash">Clash</span>}
                                            </strong>
                                            <span>{o.time.replace('-', '–')}</span>
                                            <span>Sec {o.section} · Area {o.area ?? '—'}{o.status === 'draft' ? ' · Draft' : ''}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {unscheduled.length > 0 && (
                <p className="hint">Times not set yet: {unscheduled.map((o) => o.courseCode).join(', ')}.</p>
            )}
        </div>
    );
}
