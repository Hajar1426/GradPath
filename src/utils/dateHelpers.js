// Small date helpers shared by the dashboards (Member 2).

// "Good morning" before 12:00, "Good afternoon" before 17:00, otherwise "Good evening".
export function greeting(now = new Date()) {
    const hour = now.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

// Today as 'YYYY-MM-DD' in local time, so it can be compared with dates written the same way.
export function todayIso(now = new Date()) {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// '2026-11-20' -> { day: '20', month: 'Nov 2026' } for the calendar list.
export function splitDate(isoDate) {
    const date = new Date(`${isoDate}T00:00:00`);
    return {
        day: String(date.getDate()).padStart(2, '0'),
        month: date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
    };
}