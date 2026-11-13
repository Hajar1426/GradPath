// Weekly timetable layout: days, hours and clash detection for course offerings.
export const DAYS = [
    { key: 'Sun', label: 'Sunday' },
    { key: 'Mon', label: 'Monday' },
    { key: 'Tue', label: 'Tuesday' },
    { key: 'Wed', label: 'Wednesday' },
    { key: 'Thu', label: 'Thursday' },
];
export const START_HOUR = 8;
export const END_HOUR = 18;
export const HOUR_PX = 64;

export const AREAS = ['A', 'B', 'C', 'D'];

const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
};

// Turns offerings into blocks per day, puts overlapping blocks side by side and marks clashes.
export function buildSchedule(offerings) {
    const byDay = Object.fromEntries(DAYS.map((d) => [d.key, []]));
    offerings.forEach((o) => {
        if (!o.time || !o.days) return;
        const [start, end] = o.time.split('-');
        if (!start || !end) return;
        o.days.split(/\s+/).forEach((day) => {
            if (byDay[day]) byDay[day].push({ offering: o, start: toMinutes(start), end: toMinutes(end) });
        });
    });
    const clashes = [];
    Object.entries(byDay).forEach(([day, blocks]) => {
        blocks.sort((a, b) => a.start - b.start);
        const laneEnds = [];
        blocks.forEach((b, i) => {
            const lane = laneEnds.findIndex((end) => end <= b.start);
            b.lane = lane === -1 ? laneEnds.length : lane;
            laneEnds[b.lane] = b.end;
            blocks.slice(0, i).forEach((other) => {
                if (other.end > b.start) {
                    b.clash = true;
                    other.clash = true;
                    clashes.push({ day, a: other.offering, b: b.offering });
                }
            });
        });
        const lanes = Math.max(1, laneEnds.length);
        blocks.forEach((b) => {
            b.lanes = lanes;
        });
    });
    return { byDay, clashes };
}

