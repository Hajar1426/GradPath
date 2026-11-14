import { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import DataTable from '../../components/common/DataTable';
import ResourceActions from '../../components/coordinator/ResourceActions';
import { useData } from '../../hooks/useData';
import { PUBLISH_STATUS } from '../../data/statusValues';
import { RESOURCE_TYPES } from '../../data/resources';
import { matchesSearch } from '../../utils/matchesSearch';
import { nameOfUser } from '../../utils/coordinatorHelpers';
import { SORT_OPTIONS, fileTypeOf, sortResources } from '../../utils/resourceFiles';

const TYPE_LABEL = Object.fromEntries(RESOURCE_TYPES.map((t) => [t.value, t.label]));

export default function CourseResourcesPage() {
    const { data } = useData();
    const [query, setQuery] = useState('');
    const [type, setType] = useState('all');
    const [course, setCourse] = useState('all');
    const [sort, setSort] = useState('newest');

    const published = (data.resources ?? []).filter((r) => r.status === PUBLISH_STATUS.PUBLISHED);
    const courses = [...new Set(published.map((r) => r.course))].sort();
    const rows = sortResources(
        published
            .filter((r) => type === 'all' || r.type === type)
            .filter((r) => course === 'all' || r.course === course)
            .filter((r) => matchesSearch(query, r.title, r.fileName ?? '', r.course, r.description ?? '')),
        sort,
    );

    const columns = [
        {
            key: 'title',
            header: 'Document Name',
            sortable: true,
            render: (r) => (
                <>
                    <span className="cell__strong">{r.title}</span>
                    {r.description && <span className="cell__sub">{r.description}</span>}
                </>
            ),
        },
        { key: 'type', header: 'Category', sortable: true, render: (r) => TYPE_LABEL[r.type] ?? r.type },
        { key: 'course', header: 'Related Course', sortable: true },
        { key: 'fileType', header: 'File Type', sortable: true, sortValue: fileTypeOf, render: fileTypeOf },
        { key: 'uploadedBy', header: 'Uploaded by', render: (r) => nameOfUser(data, r.uploadedBy) },
        { key: 'actions', header: <span className="sr-only">Actions</span>, render: (r) => <div className="table__actions"><ResourceActions resource={r} /></div> },
    ];

    return (
        <main className="page">
            <PageHeader title="Course Resources" subtitle="A library of forms, templates and guides for graduate students and advisors." />
            <div className="filters">
                <SearchBar value={query} onChange={setQuery} placeholder="Search" label="Search resources" />
                <Select label="Sort by" options={SORT_OPTIONS} value={sort} onChange={(e) => setSort(e.target.value)} />
                <Select label="Category" options={[{ value: 'all', label: 'All categories' }, ...RESOURCE_TYPES]} value={type} onChange={(e) => setType(e.target.value)} />
                <Select label="Course" options={[{ value: 'all', label: 'All courses' }, ...courses.map((c) => ({ value: c, label: c }))]} value={course} onChange={(e) => setCourse(e.target.value)} />
            </div>
            <DataTable
                key={sort}
                caption="Course resources"
                columns={columns}
                rows={rows}
                pageSize={6}
                emptyTitle={published.length ? 'No resources match' : 'No resources yet'}
                emptyMessage={published.length ? 'Try a different search or filter.' : 'Resources from the coordinator will appear here.'}
            />
        </main>
    );
}
