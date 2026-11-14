import { useMemo, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import StatCard from '../../components/coordinator/StatCard';
import { BarChart, ColumnChart } from '../../components/coordinator/Charts';
import { DownloadIcon } from '../../components/coordinator/Icons';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';
import { ALERT_STATUS, AUTHORIZATION_STATUS, DEGREE, STUDY_LOAD } from '../../data/statusValues';
import { DEGREE_LABEL, STUDY_LOAD_LABEL } from '../../utils/studyRules';
import { ISSUE_LABEL, buildExceptions, capacityRows, capacitySheet, studentRecords, studentsNeedingAttention } from '../../utils/coordinatorReports';
import { STUDY_LOAD_OPTIONS } from '../../utils/coordinatorHelpers';
import { downloadXlsx } from '../../utils/downloadXlsx';

function list(value) {
    if (value === undefined) return [];
    if (!Array.isArray(value)) throw new Error('Damaged list');
    return value;
}

export default function StatisticsPage() {
    const { data } = useData();
    const { showToast } = useToast();
    const [term, setTerm] = useState('all');
    const [program, setProgram] = useState('all');
    const [load, setLoad] = useState('all');
    const [openedAt] = useState(() => Date.now());

    const allRecords = useMemo(() => studentRecords(data), [data]);
    const programs = [...new Set(allRecords.map((r) => r.program))].sort();
    const terms = [...new Set((Array.isArray(data.offerings) ? data.offerings : []).map((o) => o.term))].sort();
    const records = allRecords.filter((r) => (program === 'all' || r.program === program) && (load === 'all' || r.studyLoad === load));
    const termOk = (item) => term === 'all' || item.term === term;

    // Charts
    const byProgram = programs.map((p) => ({ label: p.replace(' (program not set)', ' *'), value: allRecords.filter((r) => r.program === p && (load === 'all' || r.studyLoad === load)).length }));
    const signUp = [];
    Object.values(DEGREE).forEach((degree) =>
        Object.values(STUDY_LOAD).forEach((studyLoad) => {
            const group = records.filter((r) => r.degree === degree && r.studyLoad === studyLoad);
            if (group.length) {
                signUp.push({
                    label: `${DEGREE_LABEL[degree]} ${STUDY_LOAD_LABEL[studyLoad].toLowerCase()}`,
                    value: Math.round((group.filter((r) => r.hasAccount).length / group.length) * 100),
                    text: `${Math.round((group.filter((r) => r.hasAccount).length / group.length) * 100)}% (${group.filter((r) => r.hasAccount).length} of ${group.length})`,
                });
            }
        }),
    );
    const advisorLoad = capacityRows(data).map((a) => ({
    label: a.name,
    value: a.count,
    capacity: a.capacity,
    tone: a.count >= a.capacity ? 'full' : undefined,
    text: `${a.count}/${a.capacity}`,
}));
const loadMax = Math.max(1, ...advisorLoad.map((a) => Math.max(a.capacity, a.value)));

    const cards = [
        {
            id: 'students',
            label: 'Graduate students',
            compute: () => {
                list(data.studentRoster);
                return { value: records.length, note: `${records.filter((r) => r.hasAccount).length} signed up on GradPath` };
            },
        },
        { id: 'advisor', label: 'Without an advisor', tone: 'orange', to: '/coordinator/students?advisor=none', action: 'View students', compute: () => ({ value: records.filter((r) => !r.advisorId).length }) },
        { id: 'attention', label: 'Need attention', tone: 'red', compute: () => ({ value: list(data.attentionItems).filter((a) => a.status !== ALERT_STATUS.RESOLVED).length }) },
        {
            id: 'requests',
            label: 'Pending authorizations',
            tone: 'maroon',
            to: '/coordinator/offerings?tab=requests',
            action: 'Review requests',
            compute: () => ({ value: list(data.courseAuthorizations).filter(termOk).filter((r) => r.status === AUTHORIZATION_STATUS.PENDING).length }),
        },
    ];

    const filters = { term, load };
    const exceptions = buildExceptions(data, filters, openedAt).filter(
        (e) => program === 'all' || e.area !== 'Students' || records.some((r) => r.name === e.item),
    );
    const attention = studentsNeedingAttention(data).filter((a) => program === 'all' || a.program === program);

    function handleExport() {
        const stamp = new Date().toISOString().slice(0, 10);
        downloadXlsx(`GradPath Report ${stamp}.xlsx`, {
            Summary: [
                ['GradPath coordinator report', new Date().toLocaleString('en-GB')],
                ['Term', term === 'all' ? 'All terms' : term],
                ['Program', program === 'all' ? 'All programs' : program],
                ['Study load', load === 'all' ? 'All' : STUDY_LOAD_LABEL[load]],
                [],
                ['Graduate students', records.length],
                ['Signed up on GradPath', records.filter((r) => r.hasAccount).length],
                ['Without an advisor', records.filter((r) => !r.advisorId).length],
                [],
                ['Program', 'Students'],
                ...byProgram.map((p) => [p.label, p.value]),
            ],
            'Needs attention': [['Student', 'ID', 'Program', 'Issue'], ...attention.map((a) => [a.name, a.studentId, a.program, ISSUE_LABEL[a.issue]])],
            Exceptions: [['Area', 'Item', 'What to check'], ...exceptions.map((e) => [e.area, e.item, e.detail])],
            'Advisor load': capacitySheet(data),
        });
        showToast('Report exported.');
    }

    const attentionColumns = [
        { key: 'name', header: 'Student', sortable: true },
        { key: 'studentId', header: 'ID', sortable: true },
        { key: 'program', header: 'Program', sortable: true },
        { key: 'issue', header: 'Issue', sortable: true, render: (r) => <StatusBadge status={r.issue} tone={r.issue === 'missing_advisor' ? 'warning' : 'danger'} label={ISSUE_LABEL[r.issue]} /> },
    ];
    const exceptionColumns = [
        { key: 'area', header: 'Area', sortable: true },
        { key: 'item', header: 'Item', sortable: true },
        { key: 'detail', header: 'What to check' },
    ];

    return (
        <main className="page page--plain">
            <div className="panel">
                <PageHeader title="Statistics" subtitle="Department monitoring for graduate students, advisors and course demand." />
                <div className="filters">
                    <Select label="Term" value={term} onChange={(e) => setTerm(e.target.value)} options={[{ value: 'all', label: 'All terms' }, ...terms.map((t) => ({ value: t, label: `Term ${t}` }))]} />
                    <Select label="Program" value={program} onChange={(e) => setProgram(e.target.value)} options={[{ value: 'all', label: 'All programs' }, ...programs.map((p) => ({ value: p, label: p }))]} />
                    <Select label="Study load" options={STUDY_LOAD_OPTIONS} value={load} onChange={(e) => setLoad(e.target.value)} />
                    <Button variant="ghost" onClick={handleExport} className="btn--icon">
                        Export Report <DownloadIcon />
                    </Button>
                </div>
            </div>

            <div className="chart-grid">
                <section className="panel" aria-labelledby="chart-programs">
                    <h2 className="chart-title" id="chart-programs">Students by program</h2>
                    {byProgram.length ? <ColumnChart title="Students by program" data={byProgram} /> : <EmptyState title="No students" />}
                    {byProgram.some((p) => p.label.endsWith('*')) && <p className="hint">* Program not set yet: only the degree is known from the approved list.</p>}
                </section>
                <section className="panel" aria-labelledby="chart-signup">
                    <h2 className="chart-title" id="chart-signup">GradPath sign-up (%)</h2>
                    <p className="hint" style={{ marginTop: 0 }}>Approved students who created an account, by degree and study load.</p>
                    {signUp.length ? <BarChart title="GradPath sign-up by degree and study load" data={signUp} max={100} unit="%" /> : <EmptyState title="No students match" />}
                </section>
            </div>

            <div className="stat-grid stat-grid--four">
                {cards.map((card) => (
                    <StatCard key={card.id} {...card} />
                ))}
            </div>

            <section className="panel" aria-labelledby="chart-load">
                <h2 className="chart-title" id="chart-load">Advisor load</h2>
               <p className="hint" style={{ marginTop: 0 }}>Assigned advisees compared with each advisor's capacity. Red bars are full.</p>
{advisorLoad.length ? <BarChart title="Advisor load" data={advisorLoad} max={loadMax} /> : <EmptyState title="No advisors" />}
            </section>

            <section className="panel" aria-labelledby="attention-title">
                <h2 className="panel__title" id="attention-title">Students Needing Attention</h2>
                <DataTable caption="Students needing attention" columns={attentionColumns} rows={attention} pageSize={5} emptyTitle="Nobody needs attention" />
            </section>

            <section className="panel" aria-labelledby="exceptions-title">
                <h2 className="panel__title" id="exceptions-title">Exception report</h2>
                <p className="hint" style={{ marginTop: 0 }}>Things that may need a coordinator to check. Uses the filters above.</p>
                {exceptions.length === 0 ? (
                    <EmptyState title="No exceptions" message="Everything looks in order for these filters." />
                ) : (
                    <DataTable caption="Exception report" columns={exceptionColumns} rows={exceptions} pageSize={8} />
                )}
            </section>
        </main>
    );
}
