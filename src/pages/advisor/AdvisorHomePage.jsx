import { Link } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';
import StatCard from '../../components/coordinator/StatCard';
import WeeklySchedule from '../../components/coordinator/WeeklySchedule';
import { MailIcon, PinIcon } from '../../components/coordinator/Icons';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useAnnouncementCount } from '../../hooks/useAnnouncementCount';
import { ALERT_STATUS, PUBLISH_STATUS, REPORT_STATUS, ROLES } from '../../data/statusValues';
import CalendarCard from '../../components/advising/CalendarCard';
import { CURRENT_TERM } from '../../utils/advisorHelpers';
import { greeting } from '../../utils/dateHelpers';
import { DAYS } from '../../utils/schedule';

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

                    <CalendarCard role={ROLES.ADVISOR} />
                </aside>
            </div>
        </main>
    );
}