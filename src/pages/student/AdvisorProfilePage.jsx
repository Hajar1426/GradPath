import { useParams } from 'react-router-dom';
import BackLink from '../../components/common/BackLink';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import AvailabilityBadge from '../../components/coordinator/AvailabilityBadge';
import { MailIcon, PinIcon } from '../../components/coordinator/Icons';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { AVAILABILITY } from '../../data/statusValues';
import { capacityOf, computeAvailability, countAssigned } from '../../utils/computeAvailability';

// Public profile of one advisor, opened from the directory with Read More.
// The address is /student/advisors/:id, for example /student/advisors/adv-2.
export default function AdvisorProfilePage() {
    const { id } = useParams();
    const { currentUser } = useAuth();
    const { data } = useData();

    const students = data.students ?? [];
    const advisor = (data.advisors ?? []).find((a) => a.id === id);

    // Someone typed a wrong address, or the advisor was removed.
    if (!advisor) {
        return (
            <main className="page page--plain">
                <div className="panel">
                    <BackLink to="/student/advisors">← Back to CCM Faculty</BackLink>
                    <EmptyState title="Advisor not found" message="This advisor profile does not exist. Go back and pick an advisor from the list." />
                </div>
            </main>
        );
    }

    const count = countAssigned(students, advisor.id);
    const availability = computeAvailability(advisor, count);
    const isMyAdvisor = students.some((s) => s.userId === currentUser?.id && s.advisorId === advisor.id);

    // Opens the student's email app with the advisor's address and a subject already filled in.
    const subject = encodeURIComponent(`GradPath: question from ${currentUser?.name ?? 'a student'}`);
    const mailLink = `mailto:${advisor.email}?subject=${subject}`;

    return (
        <main className="page page--plain">
            <div>
                <BackLink to="/student/advisors">← Back to CCM Faculty</BackLink>
            </div>

            <div className="advisor-profile">
                {/* Left column: the green card from the Figma (name, degree, contact) */}
                <section className="panel advisor-card" aria-labelledby="advisor-name">
                    <div className="advisor-card__header">
                        <h1 className="advisor-card__name" id="advisor-name">{advisor.name}</h1>
                        {advisor.degree && <p className="advisor-card__degree">{advisor.degree}</p>}
                    </div>
                    <div className="advisor-card__body">
                        {advisor.title && <p className="advisor-card__title">{advisor.title} · {advisor.department}</p>}
                        {isMyAdvisor && <span className="badge badge--info advisor-mine">Your advisor</span>}
                        <p className="faculty-card__line"><PinIcon /> Office {advisor.office ?? 'not set'}</p>
                        <p className="faculty-card__line">
                            <MailIcon /> <a href={`mailto:${advisor.email}`}>{advisor.email}</a>
                        </p>
                        <p className="advisor-card__hours">
                            <strong>Office hours:</strong> {advisor.officeHours || 'Not set'}
                        </p>
                        <a className="btn advisor-card__email" href={mailLink}>Email advisor</a>
                    </div>
                </section>

                {/* Right column: availability, about, research and courses */}
                <div className="advisor-profile__main">
                    <section className="panel" aria-labelledby="availability-title">
                        <h2 className="panel__title" id="availability-title">Availability</h2>
                        <p className="advisor-profile__availability">
                            <AvailabilityBadge value={availability} />
                            <span>{count} of {capacityOf(advisor)} advisee slots used</span>
                        </p>
                        {availability === AVAILABILITY.UNAVAILABLE && !isMyAdvisor && (
                            <Alert variant="warning" title="Not taking new students right now">
                                {advisor.coordinatorOverride?.reason ?? 'All advisee slots are full. You can still email the advisor with questions.'}
                            </Alert>
                        )}
                    </section>

                    <section className="panel" aria-labelledby="about-title">
                        <h2 className="panel__title" id="about-title">About</h2>
                        <p className="advisor-profile__text">{advisor.bio || 'This advisor has not written a bio yet.'}</p>
                    </section>

                    <section className="panel" aria-labelledby="research-title">
                        <h2 className="panel__title" id="research-title">Research areas</h2>
                        {(advisor.researchAreas ?? []).length ? (
                            <ul className="advisor-tags">
                                {advisor.researchAreas.map((area) => (
                                    <li key={area} className="advisor-tag">{area}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="hint">No research areas listed yet.</p>
                        )}
                    </section>

                    <section className="panel" aria-labelledby="courses-title">
                        <h2 className="panel__title" id="courses-title">Courses taught</h2>
                        {(advisor.courses ?? []).length ? (
                            <ul className="advisor-tags">
                                {advisor.courses.map((code) => (
                                    <li key={code} className="advisor-tag advisor-tag--course">{code}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="hint">No courses listed yet.</p>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}