// Small line icons used on coordinator pages. Decorative: always paired with text.
const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const DownloadIcon = () => (
    <svg {...base}><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
);
export const PinIcon = () => (
    <svg {...base} width="18" height="18"><path d="M12 21s-6-5.3-6-11a6 6 0 0 1 12 0c0 5.7-6 11-6 11z" /><circle cx="12" cy="10" r="2.2" /></svg>
);
export const MailIcon = () => (
    <svg {...base} width="18" height="18"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M4 7l8 6 8-6" /></svg>
);
export const PeopleIcon = () => (
    <svg {...base} width="18" height="18"><circle cx="9" cy="9" r="3" /><circle cx="16.5" cy="10" r="2.3" /><path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5M14.5 15.2c2.6-.4 4.8.8 5.5 3.8" /></svg>
);
export const PersonIcon = () => (
    <svg {...base} width="40" height="40" strokeWidth="1.4"><circle cx="12" cy="9" r="3.5" /><path d="M5 20c1-3.5 3.8-5.5 7-5.5s6 2 7 5.5" /></svg>
);
