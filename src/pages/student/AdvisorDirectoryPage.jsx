import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { MailIcon, PeopleIcon, PersonIcon, PinIcon } from '../../components/coordinator/Icons';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { AVAILABILITY } from '../../data/statusValues';
import { ADVISEE_SLOTS, AVAILABILITY_LABEL, computeAvailability, countAssigned } from '../../utils/computeAvailability';
import { matchesSearch } from '../../utils/matchesSearch';

// Colour of the slots pill for each availability (same classes as the coordinator's CCM Faculty page).
const TONE = {
    [AVAILABILITY.AVAILABLE]: 'success',
    [AVAILABILITY.LIMITED]: 'warning',
    [AVAILABILITY.UNAVAILABLE]: 'danger',
};

// Sorting puts available advisors first when the student picks "Most available".
const AVAILABILITY_ORDER = {
    [AVAILABILITY.AVAILABLE]: 0,
    [AVAILABILITY.LIMITED]: 1,
    [AVAILABILITY.UNAVAILABLE]: 2,
};

const AVAILABILITY_OPTIONS = [
    { value: 'all', label: 'All advisors' },
    ...Object.values(AVAILABILITY).map((value) => ({ value, label: AVAILABILITY_LABEL[value] })),
];

const SORT_OPTIONS = [
    { value: 'name', label: 'Name (A to Z)' },
    { value: 'available', label: 'Most available first' },
];

// Student view of all advisors: search, filter and open a profile.
export default function AdvisorDirectoryPage() {
    const { currentUser } = useAuth();
    const { data } = useData();
    const [query, setQuery] = useState('');
    const [department, setDepartment] = useState('all');
    const [availability, setAvailability] = useState('all');
    const [sort, setSort] = useState('name');

    const advisors = data.advisors ?? [];
    const students = data.students ?? [];

    // The signed-in student's own advisor, if they have one.
    const myAdvisorId = students.find((s) => s.userId === currentUser?.id)?.advisorId ?? null;

    // Department options are built from the data, so a new department appears by itself.
    const departments = [...new Set(advisors.map((a) => a.department))].sort();
    const departmentOptions = [
        { value: 'all', label: 'All departments' },
        ...departments.map((d) => ({ value: d, label: d })),
    ];

    // Work out each advisor's slots and availability, then filter and sort.
    const rows = advisors
        .map((a) => {
            const count = countAssigned(students, a.id);
            return { ...a, count, availability: computeAvailability(a, count) };
        })
        .filter((a) => department === 'all' || a.department === department)
        .filter((a) => availability === 'all' || a.availability === availability)
        .filter((a) => matchesSearch(query, a.name, a.department, (a.researchAreas ?? []).join(' ')))
        .sort((a, b) => {
            if (sort === 'available') {
                const byAvailability = AVAILABILITY_ORDER[a.availability] - AVAILABILITY_ORDER[b.availability];
                if (byAvailability !== 0) return byAvailability;
            }
            return a.name.localeCompare(b.name);
        });

    const filtersActive = query || department !== 'all' || availability !== 'all';

    function clearFilters() {
        setQuery('');
        setDepartment('all');
        setAvailability('all');
    }

    return (
        <main className="page page--plain">
            <div className="panel">
                <PageHeader
                    title="CCM Faculty"
                    subtitle={`Find an advisor by name or research area. Each advisor can take ${ADVISEE_SLOTS} students.`}
                />
                <div className="filters">
                    <SearchBar value={query} onChange={setQuery} placeholder="Search by name or research area" label="Search advisors" />
                    <Select label="Department" options={departmentOptions} value={department} onChange={(e) => setDepartment(e.target.value)} />
                    <Select label="Availability" options={AVAILABILITY_OPTIONS} value={availability} onChange={(e) => setAvailability(e.target.value)} />
                    <Select label="Sort by" options={SORT_OPTIONS} value={sort} onChange={(e) => setSort(e.target.value)} />
                </div>
                <p className="hint" aria-live="polite">
                    Showing {rows.length} of {advisors.length} advisors
                </p>
            </div>

            {rows.length === 0 ? (
                <div className="panel">
                    <EmptyState
                        title={advisors.length ? 'No advisors match your search' : 'No advisor profiles yet'}
                        message={advisors.length ? 'Try a different name, research area or filter.' : 'Advisors appear here once their profiles exist.'}
                        action={filtersActive ? <Button variant="ghost" onClick={clearFilters}>Clear filters</Button> : null}
                    />
                </div>
            ) : (
                <ul className="faculty-grid">
                    {rows.map((a) => (
                        <li key={a.id} className="faculty-card">
                            <div className="faculty-card__photo">
                                <PersonIcon />
                            </div>
                            <h2 className="faculty-card__name">{a.name}</h2>
                            {a.id === myAdvisorId && <span className="badge badge--info advisor-mine">Your advisor</span>}
                            <p className="faculty-card__line"><PinIcon /> {a.office ?? 'Office not set'}</p>
                            <p className="faculty-card__line">
                                <MailIcon /> <a href={`mailto:${a.email}`}>{a.email}</a>
                            </p>
                            <p className="faculty-card__line">
                                <PeopleIcon /> <strong>Advisee slots:</strong>
                                <span className={`slot-pill slot-pill--${TONE[a.availability]}`}>
                                    {a.count}/{ADVISEE_SLOTS}
                                </span>
                            </p>
                            {/* Written label, so colour is never the only signal */}
                            <p className="faculty-card__status">{AVAILABILITY_LABEL[a.availability]}</p>
                            <Link className="btn btn--small" to={`/student/advisors/${a.id}`} aria-label={`Read more about ${a.name}`}>
                                Read More
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}