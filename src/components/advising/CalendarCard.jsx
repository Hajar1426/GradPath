import { academicCalendar } from '../../data/academicCalendar';
import { splitDate, todayIso } from '../../utils/dateHelpers';

// The green "Academic Calendar" card from the Figma, used on the advisor and student home pages.
// role decides which dates are shown ('student' or 'advisor'). Only dates from today onwards, nearest first.
export default function CalendarCard({ role, max = 5 }) {
    const today = todayIso();
    const upcoming = academicCalendar
        .filter((item) => item.audience.includes(role) && item.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, max);

    return (
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
    );
}