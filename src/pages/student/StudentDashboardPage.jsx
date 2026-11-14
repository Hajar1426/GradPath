import { Link } from 'react-router-dom';
import StatCard from '../../components/coordinator/StatCard';
import WeeklySchedule from '../../components/coordinator/WeeklySchedule';
import StatusBadge from '../../components/common/StatusBadge';
import CalendarCard from '../../components/advising/CalendarCard';
import { MailIcon } from '../../components/coordinator/Icons';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useStudentInfo } from '../../hooks/useStudentInfo';
import { useAnnouncementCount } from '../../hooks/useAnnouncementCount';
import { PLAN_STATUS, PUBLISH_STATUS, REPORT_RATING, REPORT_STATUS, ROLES } from '../../data/statusValues';
import { academicCalendar } from '../../data/academicCalendar';
import { STUDY_LOAD_LABEL, getMinCourses, getStudyLoad } from '../../utils/studyRules';
import { CURRENT_TERM, planOf, plannedCourses } from '../../utils/advisorHelpers';
import { greeting, todayIso } from '../../utils/dateHelpers';
import { formatDate } from '../../utils/formatDate';

// Total credits of a list of course codes, using the course catalog. Unknown codes count as 0.
function creditsOf(codes, catalog) {
    return codes.reduce((sum, code) => sum + (catalog.find((c) => c.code === code)?.credits ?? 0), 0);
}

// Student home page (Figma: "Student view - Home Page").
export default function StudentDashboardPage() {
    const { currentUser } = useAuth();
    const { data } = useData();
    const rosterInfo = useStudentInfo(); // degree and study load from the coordinator's list
    const { newCount } = useAnnouncementCount();

    // Advising record (Member 2): advisor and program. A new student may not have one yet.
    const record = (data.students ?? []).find((s) => s.userId === currentUser?.id);
    const advisor = record ? (data.advisors ?? []).find((a) => a.id === record.advisorId) : undefined;
    const studentForRules = record ?? rosterInfo ?? {};
    const minCourses = getMinCourses(studentForRules);
    const studyLoad = getStudyLoad(studentForRules);

    // Degree plan (Member 3): completed courses and this term's plan.
    const plan = planOf(data, currentUser?.id);
    const completed = (plan?.terms ?? []).filter((t) => t.type === 'historical').flatMap((t) => t.courses);
    const thisTerm = plannedCourses(plan, CURRENT_TERM);
    const catalog = data.courses ?? [];

    // This term's planned courses that have a published section, for the timetable.
    const myOfferings = (data.offerings ?? []).filter(
        (o) => o.term === CURRENT_TERM && o.status === PUBLISH_STATUS.PUBLISHED && thisTerm.includes(o.courseCode),
    );
    const withoutSection = thisTerm.filter((code) => !myOfferings.some((o) => o.courseCode === code));

    // Annual report (Member 2): this year's report, if any.
    const report = (data.annualReports ?? []).find((r) => r.studentId === currentUser?.id);
    const reportDue = academicCalendar.find((d) => d.id === 'cal-1' && d.date >= todayIso());

    // "Needs your attention": built from the data each time, so items disappear once they are done.
    const todo = [];
    if (!advisor) {
        todo.push({ id: 'advisor', tone: 'warning', text: 'You do not have an advisor yet. Browse CCM Faculty and email an advisor.', to: '/student/advisors', action: 'Find an advisor' });
    }
    if (!plan) {
        todo.push({ id: 'plan', tone: 'warning', text: 'Start your degree plan so your advisor can review it.', to: '/student/plan', action: 'Start plan' });
    } else if (plan.status === PLAN_STATUS.CHANGES_REQUESTED) {
        todo.push({ id: 'plan', tone: 'danger', text: 'Your advisor asked for changes to your degree plan.', to: '/student/plan', action: 'Open plan' });
    } else if (plan.status === PLAN_STATUS.DRAFT) {
        todo.push({ id: 'plan', tone: 'info', text: 'Your degree plan is still a draft. Submit it when it is ready.', to: '/student/plan', action: 'Open plan' });
    }
    if (plan && thisTerm.length < minCourses) {
        todo.push({
            id: 'load',
            tone: 'warning',
            text: `As a ${STUDY_LOAD_LABEL[studyLoad].toLowerCase()} student you need at least ${minCourses} course${minCourses > 1 ? 's' : ''} in Term ${CURRENT_TERM}. You have ${thisTerm.length}.`,
            to: '/student/plan',
            action: 'Add courses',
        });
    }
    if (report?.status === REPORT_STATUS.EVALUATED && report.evaluation?.rating !== REPORT_RATING.SATISFACTORY) {
        todo.push({ id: 'report', tone: 'danger', text: `Your annual report needs follow-up: ${report.evaluation.actionPlan || report.evaluation.comments}`, to: '/student/reports', action: 'View report' });
    } else if (!report && reportDue) {
        todo.push({ id: 'report', tone: 'info', text: `Your annual progress report is due on ${formatDate(reportDue.date)}.`, to: '/student/reports', action: 'Write report' });
    }

    const tiles = [
        {
            id: 'plan',
            label: 'Degree plan',
            to: '/student/plan',
            tone: plan?.status === PLAN_STATUS.CHANGES_REQUESTED ? 'red' : 'dark',
            compute: () => ({ value: plan ? `v${plan.currentVersion ?? 1}` : '—', note: plan ? <StatusBadge status={plan.status} /> : 'Not started' }),
        },
        {
            id: 'credits',
            label: 'Credits completed',
            to: '/student/plan',
            tone: 'dark',
            compute: () => ({ value: creditsOf(completed, catalog), note: `${completed.length} courses` }),
        },
        {
            id: 'term',
            label: `Courses in Term ${CURRENT_TERM}`,
            to: '/student/plan',
            tone: plan && thisTerm.length < minCourses ? 'orange' : 'dark',
            compute: () => ({ value: thisTerm.length, note: `Minimum ${minCourses} (${STUDY_LOAD_LABEL[studyLoad].toLowerCase()})` }),
        },
        {
            id: 'announcements',
            label: 'New announcements',
            to: '/announcements',
            tone: newCount ? 'orange' : 'dark',
            compute: () => ({ value: newCount, note: 'From the department' }),
        },
    ];

    const firstName = (record?.name ?? currentUser?.name ?? '').split(' ')[0];

    return (
        <main className="page page--plain">
            <div>
                <h1 className="advisor-home__greeting">{greeting()}, {firstName}</h1>
                <p className="hint">Here is what needs your attention this week.</p>
            </div>

            <div className="advisor-home">
                {/* Left column: overview, to-do and schedule */}
                <div className="advisor-home__main">
                    <section className="panel" aria-labelledby="overview-title">
                        <h2 className="panel__title" id="overview-title">Academic overview</h2>
                        <div className="stat-grid stat-grid--four">
                            {tiles.map((tile) => (
                                <StatCard key={tile.id} {...tile} />
                            ))}
                        </div>
                    </section>

                    <section className="panel" aria-labelledby="todo-title">
                        <h2 className="panel__title" id="todo-title">Needs your attention</h2>
                        {todo.length ? (
                            <ul className="alert-cards">
                                {todo.map((item) => (
                                    <li key={item.id} className={`alert-card todo-card todo-card--${item.tone}`}>
                                        <p className="todo-card__text">{item.text}</p>
                                        <Link className="btn btn--ghost btn--small" to={item.to}>{item.action}</Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="advisor-profile__text">You are all caught up. 🎉</p>
                        )}
                    </section>

                    <section className="panel" aria-labelledby="schedule-title">
                        <h2 className="panel__title" id="schedule-title">My weekly schedule · Term {CURRENT_TERM}</h2>
                        {myOfferings.length > 0 && <WeeklySchedule offerings={myOfferings} />}
                        {withoutSection.length > 0 && (
                            <p className="hint">
                                Planned without a published section yet: {withoutSection.join(', ')}.
                            </p>
                        )}
                        {thisTerm.length === 0 && <p className="hint">No courses planned for this term yet.</p>}
                    </section>
                </div>

                {/* Right column: student card with advisor, and the calendar */}
                <aside className="advisor-home__side">
                    <section className="panel advisor-card" aria-labelledby="me-title">
                        <div className="advisor-card__header">
                            <h2 className="advisor-card__name" id="me-title">{record?.name ?? currentUser?.name}</h2>
                            <p className="advisor-card__degree">{record?.program ?? rosterInfo?.degree ?? 'Graduate student'}</p>
                        </div>
                        <div className="advisor-card__body">
                            <div className="advisor-box">
                                <span className="advisor-box__label">Advisor</span>
                                {advisor ? (
                                    <>
                                        <Link className="cell__link" to={`/student/advisors/${advisor.id}`}>{advisor.name}</Link>
                                        <span className="faculty-card__line">
                                            <MailIcon /> <a href={`mailto:${advisor.email}`}>{advisor.email}</a>
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <strong>No advisor assigned</strong>
                                        <Link className="advisor-detail__link" to="/student/advisors">Browse CCM Faculty →</Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>

                    <CalendarCard role={ROLES.STUDENT} />
                </aside>
            </div>
        </main>
    );
}