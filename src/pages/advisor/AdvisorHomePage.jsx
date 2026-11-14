import { Link } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';
import StatCard from '../../components/coordinator/StatCard';
import WeeklySchedule from '../../components/coordinator/WeeklySchedule';
import { MailIcon, PinIcon } from '../../components/coordinator/Icons';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useAnnouncementCount } from '../../hooks/useAnnouncementCount';
import { ALERT_STATUS, PUBLISH_STATUS, REPORT_STATUS, ROLES } from '../../data/statusValues';
import { academicCalendar } from '../../data/academicCalendar';
import { DAYS } from '../../utils/schedule';

// The term shown in the teaching schedule. Change this when a new term starts.
const CURRENT_TERM = '261';

// "Good morning" before 12:00, "Good afternoon" before 17:00, otherwise "Good evening".
function greeting(now) {
    const hour = now.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

// '2026-11-20' -> { day: '20', month: 'Nov 2026' } for the calendar list.
function splitDate(isoDate) {
    const date = new Date(`${isoDate}T00:00:00`);
    return {
        day: String(date.getDate()).padStart(2, '0'),
        month: date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
    };
}

// Advisor home page (Figma: "Advisor view - Home Page").
export default function AdvisorHomePage() {
    const { currentUser } = useAuth();
    const { data } = useData();
    const { newCount } = useAnnouncementCount();

    // The advisor profile that belongs to the signed-in user.
    const advisor = (data.advisors ?? []).find((a) => a.userId === currentUser?.id);

    if (!advisor) {
        return (
            <main className="page page--plain">
                <div className="panel">
                    <EmptyState
                        title="Your advisor profile is not set up yet"
                        message="Ask the coordinator to link your account to an advisor profile."
                    />
                </div>
            </main>
        );
    }

    const now = new Date();
    const todayKey = now.toLocaleDateString('en-US', { weekday: 'short' }); // 'Sun', 'Mon', ...
    // Today as 'YYYY-MM-DD' in local time, so it can be compared with the calendar dates.
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Numbers for the four overview tiles.
    const myStudents = (data.students ?? []).filter((s) => s.advisorId === advisor.id);
    const openAlerts = (data.attentionItems ?? []).filter((a) => a.advisorId === advisor.id && a.status !== ALERT_STATUS.RESOLVED);
    const reportsToEvaluate = (data.annualReports ?? []).filter((r) => r.advisorId === advisor.id && r.status === REPORT_STATUS.SUBMITTED);

    // Courses this advisor teaches this term (from the coordinator's offerings).
    const myOfferings = (data.offerings ?? []).filter(
        (o) => o.instructor === advisor.name && o.term === CURRENT_TERM && o.status !== PUBLISH_STATUS.ARCHIVED,
    );
    const todaysClasses = myOfferings.filter((o) => (o.days ?? '').split(/\s+/).includes(todayKey));
    const isTeachingDay = DAYS.some((d) => d.key === todayKey);

    // Upcoming dates for advisors, nearest first, at most five.
    const upcoming = academicCalendar
        .filter((item) => item.audience.includes(ROLES.ADVISOR) && item.date >= todayIso)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);

    const tiles = [
        {
            id: 'advisees',
            label: 'My advisees',
            to: '/advisor/students',
            tone: 'dark',
            compute: () => ({ value: myStudents.length, note: 'View student status' }),
        },
        {
            id: 'alerts',
            label: 'Open warning alerts',
            to: '/advisor/alerts',
            tone: openAlerts.length ? 'red' : 'dark',
            compute: () => ({ value: openAlerts.length, note: openAlerts.length ? 'Need your attention' : 'All clear' }),
        },
        {
            id: 'reports',
            label: 'Reports to evaluate',
            to: '/advisor/reports',
            tone: reportsToEvaluate.length ? 'orange' : 'dark',
            compute: () => ({ value: reportsToEvaluate.length, note: 'Annual progress reports' }),
        },
        {
            id: 'announcements',
            label: 'New announcements',
            to: '/announcements',
            tone: newCount ? 'orange' : 'dark',
            compute: () => ({ value: newCount, note: 'From the department' }),
        },
    ];

    return (
        <main className="page page--plain">
            <h1 className="advisor-home__greeting">
                {greeting(now)}, {advisor.name}
            </h1>

            <div className="advisor-home">
                {/* Left column: overview and schedule */}
                <div className="advisor-home__main">
                    <section className="panel" aria-labelledby="overview-title">
                        <h2 className="panel__title" id="overview-title">Academic overview</h2>
                        <div className="stat-grid stat-grid--four">
                            {tiles.map((tile) => (
                                <StatCard key={tile.id} {...tile} />
                            ))}
                        </div>
                    </section>

                    <section className="panel" aria-labelledby="schedule-title">
                        <h2 className="panel__title" id="schedule-title">My teaching schedule · Term {CURRENT_TERM}</h2>
                        <p className="hint advisor-home__today">
                            {!isTeachingDay && 'No classes today (weekend).'}
                            {isTeachingDay && todaysClasses.length === 0 && 'No classes today.'}
                            {isTeachingDay && todaysClasses.length > 0 &&
                                `Today: ${todaysClasses.map((o) => `${o.courseCode} at ${o.time.split('-')[0]}`).join(', ')}`}
                        </p>
                        {myOfferings.length ? (
                            <WeeklySchedule offerings={myOfferings} />
                        ) : (
                            <EmptyState title="No courses this term" message="Courses you teach appear here once the coordinator adds them." />
                        )}
                    </section>
                </div>

                {/* Right column: profile card and calendar */}
                <aside className="advisor-home__side">
                    <section className="panel advisor-card" aria-labelledby="my-profile-title">
                        <div className="advisor-card__header">
                            <h2 className="advisor-card__name" id="my-profile-title">{advisor.name}</h2>
                            {advisor.degree && <p className="advisor-card__degree">{advisor.degree}</p>}
                        </div>
                        <div className="advisor-card__body">
                            <p className="faculty-card__line"><MailIcon /> {advisor.email}</p>
                            <p className="faculty-card__line"><PinIcon /> Office {advisor.office ?? 'not set'}</p>
                            <Link className="btn btn--ghost btn--small advisor-card__email" to="/advisor/profile">
                                Edit profile
                            </Link>
                        </div>
                    </section>

                    <section className="panel advisor-card" aria-labelledby="calendar-title">
                        <div className="advisor-card__header">
                            <h2 className="advisor-card__name" id="calendar-title">Academic Calendar</h2>
                        </div>
                        <div className="advisor-card__body">
                            {upcoming.length ? (
                                <ul className="calendar-list">
                                    {upcoming.map((item) => {
                                        const { day, month } = splitDate(item.date);
                                        return (
                                            <li key={item.id} className="calendar-list__item">
                                                <span className="calendar-list__date">
                                                    <span className="calendar-list__day">{day}</span>
                                                    <span className="calendar-list__month">{month}</span>
                                                </span>
                                                <span>{item.title}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="hint">No upcoming dates.</p>
                            )}
                        </div>
                    </section>
                </aside>
            </div>
        </main>
    );
}
