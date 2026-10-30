import { Link } from 'react-router-dom';

const FEATURES = [
    { title: 'Find your advisor', text: 'Browse advisors, see their research areas and availability, and email them to start the conversation.' },
    { title: 'Plan your degree', text: 'Arrange courses by semester, check program rules as you go and submit your plan for review.' },
    { title: 'Track your progress', text: 'Follow your milestones from coursework to thesis and graduation in one timeline.' },
    { title: 'Stay on track', text: 'Submit annual progress reports and receive feedback from your advisor.' },
];

const ROLES = [
    { name: 'Students', text: 'Plan courses, find an advisor and follow your milestones.' },
    { name: 'Advisors', text: 'Review plans and reports and support your students.' },
    { name: 'Coordinators', text: 'Manage offerings, announcements, capacity and statistics.' },
    { name: 'Administrators', text: 'Manage accounts, access and system settings.' },
];

function Logo({ size = 34 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" aria-hidden="true">
            <path d="M12 2l8.5 5v10L12 22l-8.5-5V7z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

export default function LandingPage() {
    return (
        <div className="landing">
            <header className="landing__hero">
                <div className="landing__nav">
                    <div className="landing__brand">
                        <Logo />
                        Grad Path
                    </div>
                    <Link className="btn btn--outline-light" to="/sign-up">Sign up</Link>
                </div>

                <div className="landing__heroBody">
                    <div>
                        <span className="landing__eyebrow">Graduate Journey and Advising System</span>
                        <h1 className="landing__title">Plan your graduate journey with confidence</h1>
                        <p className="landing__lead">
                            GradPath brings advisors, degree planning, progress milestones and annual reports
                            together for graduate students at the College of Computing and Mathematics.
                        </p>
                        <div className="landing__actions">
                            <Link className="btn btn--lg btn--light" to="/sign-in">Get started</Link>
                            <a className="btn btn--lg btn--outline-light" href="#how-it-works">How it works</a>
                        </div>
                    </div>
                </div>
            </header>

            <section className="landing__section" id="how-it-works" aria-labelledby="features-title">
                <h2 className="landing__h2" id="features-title">Everything for your degree, in one place</h2>
                <p className="landing__sub">From your first semester to graduation.</p>
                <div className="landing__grid">
                    {FEATURES.map((feature, index) => (
                        <article className="landing__card" key={feature.title}>
                            <span className="landing__num">{index + 1}</span>
                            <h3>{feature.title}</h3>
                            <p>{feature.text}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="landing__section" aria-labelledby="roles-title">
                <h2 className="landing__h2" id="roles-title">Built for everyone in the journey</h2>
                <p className="landing__sub">Each person sees only what they need.</p>
                <div className="landing__grid">
                    {ROLES.map((role) => (
                        <article className="landing__card" key={role.name}>
                            <h3>{role.name}</h3>
                            <p>{role.text}</p>
                        </article>
                    ))}
                </div>
            </section>

            <div className="landing__notice">
                <div className="landing__noticeBox">
                    GradPath is for planning. You add courses to a plan and request authorization here, then
                    complete your actual registration in the university portal.
                </div>
            </div>

            <footer className="landing__footer">GradPath · SWE363 Web Engineering · Group 2</footer>
        </div>
    );
}