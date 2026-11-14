import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import EditOnly from '../../components/common/EditOnly';
import EmptyState from '../../components/common/EmptyState';
import WeeklySchedule from '../../components/coordinator/WeeklySchedule';
import OfferingsPanel from './OfferingsPanel';
import RequestsPanel from './RequestsPanel';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';
import { AUTHORIZATION_STATUS, PUBLISH_STATUS } from '../../data/statusValues';
import { downloadXlsx } from '../../utils/downloadXlsx';

const TABS = [
    { id: 'offerings', label: 'Offerings' },
    { id: 'requests', label: 'Authorization requests' },
    { id: 'schedule', label: 'Schedule' },
];

export default function CoursesSchedulePage() {
    const { data } = useData();
    const { showToast } = useToast();
    const [params, setParams] = useSearchParams();
    const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'offerings';
    const offerings = data.offerings ?? [];
    const terms = [...new Set(offerings.filter((o) => o.status !== PUBLISH_STATUS.ARCHIVED).map((o) => o.term))].sort();
    const [term, setTerm] = useState(terms[0] ?? '');
    const [showDrafts, setShowDrafts] = useState(true);
    const pendingCount = (data.courseAuthorizations ?? []).filter((r) => r.status === AUTHORIZATION_STATUS.PENDING).length;

    const scheduled = offerings.filter(
        (o) => o.term === term && (o.status === PUBLISH_STATUS.PUBLISHED || (showDrafts && o.status === PUBLISH_STATUS.DRAFT)),
    );

    function exportSchedule() {
        const rows = offerings
            .filter((o) => o.status !== PUBLISH_STATUS.ARCHIVED)
            .sort((a, b) => a.term.localeCompare(b.term) || a.courseCode.localeCompare(b.courseCode));
        downloadXlsx('Course Schedule.xlsx', {
            Schedule: [
                ['Course', 'Title', 'Area', 'Term', 'Section', 'Instructor', 'Days', 'Time', 'Seats', 'Status'],
                ...rows.map((o) => [o.courseCode, o.title, o.area ?? '', o.term, o.section, o.instructor, o.days, o.time, o.seats, o.status]),
            ],
        });
        showToast('Schedule exported.');
    }

    function selectTab(id) {
        setParams(id === 'offerings' ? {} : { tab: id });
    }

    return (
        <main className="page page--plain">
            <div className="panel">
                <div className="page__toolbar">
                    <PageHeader
                        title="Courses and Schedule"
                        subtitle="Weekly timetable of all graduate sections. Check for clashes before publishing it to students."
                    />
                    <div className="table__actions">
                        <Button variant="ghost" onClick={exportSchedule}>Export Schedule</Button>
                        <EditOnly>
                            <Link className="btn" to="/coordinator/offerings/new">New offering</Link>
                        </EditOnly>
                    </div>
                </div>
                <div className="underline-tabs" role="tablist" aria-label="Courses and schedule sections">
                    {TABS.map((t, index) => (
                        <button
                            key={t.id}
                            type="button"
                            role="tab"
                            id={`tab-${t.id}`}
                            aria-selected={tab === t.id}
                            aria-controls={`panel-${t.id}`}
                            tabIndex={tab === t.id ? 0 : -1}
                            className="underline-tabs__tab"
                            onClick={() => selectTab(t.id)}
                            onKeyDown={(e) => {
                                const next = e.key === 'ArrowRight' ? index + 1 : e.key === 'ArrowLeft' ? index - 1 : null;
                                if (next === null) return;
                                const target = TABS[(next + TABS.length) % TABS.length].id;
                                selectTab(target);
                                document.getElementById(`tab-${target}`)?.focus();
                            }}
                        >
                            {t.label}
                            {t.id === 'requests' && pendingCount > 0 && <span className="tab-count" aria-label={`${pendingCount} pending`}>{pendingCount}</span>}
                        </button>
                    ))}
                </div>
            </div>

            <section className="panel" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
                {tab === 'offerings' && <OfferingsPanel />}
                {tab === 'requests' && <RequestsPanel />}
                {tab === 'schedule' && (
                    <>
                        <div className="filters" style={{ marginTop: 0 }}>
                            <Select
                                label="Term"
                                value={term}
                                onChange={(e) => setTerm(e.target.value)}
                                options={terms.length ? terms.map((t) => ({ value: t, label: `Term ${t}` })) : [{ value: '', label: 'No terms' }]}
                            />
                            <label className="checkbox">
                                <input type="checkbox" checked={showDrafts} onChange={(e) => setShowDrafts(e.target.checked)} />
                                Include drafts
                            </label>
                        </div>
                        {scheduled.length === 0 ? (
                            <EmptyState title="Nothing scheduled" message="There are no offerings with times for this term." />
                        ) : (
                            <WeeklySchedule offerings={scheduled} />
                        )}
                    </>
                )}
            </section>
        </main>
    );
}
