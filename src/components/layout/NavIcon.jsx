const PATHS = {
    home: 'M12 3 3 8l9 5 9-5-9-5ZM3 13l9 5 9-5M3 17.5l9 5 9-5',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0',
    people: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14a6.5 6.5 0 0 1 3.5 6',
    document: 'M7 3h7l5 5v13H7V3ZM14 3v5h5M10 13h6M10 17h6',
    shield: 'M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6l-8-3ZM9 12l2 2 4-4',
    bell: 'M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2ZM10 21h4',
    gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1',
    megaphone: 'M3 10v4h4l9 5V5L7 10H3ZM19 9a4 4 0 0 1 0 6',
    book: 'M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4ZM5 17a3 3 0 0 1 3-3h10',
    calendar: 'M4 6h16v14H4V6ZM4 10h16M8 3v4M16 3v4',
    chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
    inbox: 'M3 13l3-8h12l3 8v6H3v-6ZM3 13h5l1 3h6l1-3h5',
    check: 'M4 12l5 5L20 6',
    dot: 'M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0',
};

const RULES = [
    ['notification', 'bell'],
    ['announcement', 'megaphone'],
    ['setting', 'gear'],
    ['security', 'shield'],
    ['audit', 'document'],
    ['report', 'document'],
    ['plan', 'document'],
    ['profile', 'user'],
    ['user', 'user'],
    ['student', 'people'],
    ['advisor', 'people'],
    ['faculty', 'people'],
    ['course', 'book'],
    ['schedule', 'calendar'],
    ['calendar', 'calendar'],
    ['statistic', 'chart'],
    ['request', 'inbox'],
    ['authoriz', 'check'],
    ['capacity', 'people'],
    ['offering', 'calendar'],
    ['import', 'inbox'],
    ['resource', 'book'],
];

export default function NavIcon({ to, isHome }) {
    const key = isHome ? 'home' : (RULES.find(([word]) => to.toLowerCase().includes(word))?.[1] ?? 'dot');
    return (
        <svg
            className="sidebar__icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d={PATHS[key]} />
        </svg>
    );
}