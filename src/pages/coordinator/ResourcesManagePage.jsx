import { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Modal from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import EditOnly from '../../components/common/EditOnly';
import ResourceActions from '../../components/coordinator/ResourceActions';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';
import { useReadOnly } from '../../hooks/useReadOnly';
import { PUBLISH_STATUS } from '../../data/statusValues';
import { RESOURCE_TYPES } from '../../data/resources';
import { matchesSearch } from '../../utils/matchesSearch';
import { newId, nameOfUser } from '../../utils/coordinatorHelpers';
import { MAX_UPLOAD_BYTES, SORT_OPTIONS, UPLOAD_ACCEPT, fileTypeOf, readFileAsDataUrl, sortResources } from '../../utils/resourceFiles';

const TYPE_LABEL = Object.fromEntries(RESOURCE_TYPES.map((t) => [t.value, t.label]));
const EMPTY = { title: '', type: 'guide', course: 'Common', source: 'file', url: '', fileName: '', fileData: '', description: '' };
const STATUS_OPTIONS = [
    { value: 'all', label: 'All statuses' },
    { value: PUBLISH_STATUS.PUBLISHED, label: 'Published' },
    { value: PUBLISH_STATUS.DRAFT, label: 'Draft' },
    { value: PUBLISH_STATUS.ARCHIVED, label: 'Archived' },
];
export default function ResourcesManagePage() {
    const { currentUser } = useAuth();
    const { data, updateCollection, addAuditEvent } = useData();
    const { showToast } = useToast();
    const readOnly = useReadOnly();
    const [query, setQuery] = useState('');
    const [type, setType] = useState('all');
    const [status, setStatus] = useState('all');
    const [sort, setSort] = useState('newest');
    const [editing, setEditing] = useState(null); // resource or 'new'
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [pending, setPending] = useState(null); // { item, status }

    const all = data.resources ?? [];
    const rows = sortResources(
        all
            .filter((r) => type === 'all' || r.type === type)
            .filter((r) => status === 'all' || r.status === status)
            .filter((r) => matchesSearch(query, r.title, r.fileName ?? '', r.course, r.description ?? '')),
        sort,
    );

    function openEditor(item) {
        setEditing(item ?? 'new');
        setForm(
            item
                ? { ...EMPTY, ...item, source: item.url.startsWith('http') ? 'link' : 'file', fileData: '', url: item.url.startsWith('http') ? item.url : '' }
                : EMPTY,
        );
        setErrors({});
    }

    async function chooseFile(file) {
        if (!file) return;
        if (file.size > MAX_UPLOAD_BYTES) {
            setErrors((e) => ({ ...e, file: 'The file is larger than 1 MB. In the prototype, files are kept in the browser, so keep them small.' }));
            return;
        }
        try {
            const dataUrl = await readFileAsDataUrl(file);
            setForm((f) => ({ ...f, fileName: file.name, fileData: dataUrl, title: f.title || file.name.replace(/\.[^.]+$/, '') }));
            setErrors((e) => ({ ...e, file: undefined }));
        } catch (err) {
            setErrors((e) => ({ ...e, file: err.message }));
        }
    }

    function validate() {
        const found = {};
        if (!form.title.trim()) found.title = 'Enter a document name.';
        if (!form.course.trim()) found.course = 'Enter a course code or "Common".';
        if (form.source === 'link' && !/^https?:\/\/\S+\.\S+/.test(form.url.trim())) found.url = 'Enter a full link starting with https://';
        const hasExistingFile = editing !== 'new' && editing && !editing.url.startsWith('http');
        if (form.source === 'file' && !form.fileData && !hasExistingFile) found.file = 'Choose a file to upload.';
        return found;
    }

    function save(publish) {
        const found = validate();
        setErrors(found);
        if (Object.keys(found).length) return;
        const isNew = editing === 'new';
        const keepFile = form.source === 'file' && !form.fileData && !isNew;
        const record = {
            ...(isNew ? { uploadedBy: currentUser.id } : editing),
            id: isNew ? newId('res') : editing.id,
            title: form.title.trim(),
            type: form.type,
            course: form.course.trim(),
            description: form.description.trim(),
            url: form.source === 'link' ? form.url.trim() : keepFile ? editing.url : form.fileData,
            fileName: form.source === 'link' ? '' : keepFile ? editing.fileName : form.fileName,
            status: publish ? PUBLISH_STATUS.PUBLISHED : isNew ? PUBLISH_STATUS.DRAFT : editing.status,
            updatedAt: new Date().toISOString(),
        };
        try {
            updateCollection('resources', (list) => (isNew ? [record, ...list] : list.map((r) => (r.id === record.id ? record : r))));
        } catch {
            showToast('The file could not be saved. The browser storage may be full.', 'error');
            return;
        }
        addAuditEvent({ userId: null, actorId: currentUser.id, action: isNew ? 'resource_uploaded' : 'resource_updated', detail: record.title });
        showToast(publish ? `"${record.title}" published. Students can see it.` : `"${record.title}" saved.`);
        setEditing(null);
    }

    function changeStatus() {
        const { item, status: next } = pending;
        updateCollection('resources', (list) => list.map((r) => (r.id === item.id ? { ...r, status: next, updatedAt: new Date().toISOString() } : r)));
        addAuditEvent({ userId: null, actorId: currentUser.id, action: `resource_${next}`, detail: item.title });
        showToast(next === PUBLISH_STATUS.PUBLISHED ? `"${item.title}" published.` : `"${item.title}" archived.`);
        setPending(null);
    }

    const columns = [
        {
            key: 'title',
            header: 'Document Name',
            sortable: true,
            render: (r) => (
                <>
                    <span className="cell__strong">{r.title}</span>
                    {r.fileName && <span className="cell__sub">{r.fileName}</span>}
                    {r.status !== PUBLISH_STATUS.PUBLISHED && <StatusBadge status={r.status} />}
                </>
            ),
        },
        { key: 'type', header: 'Category', sortable: true, render: (r) => TYPE_LABEL[r.type] ?? r.type },
        { key: 'course', header: 'Related Course', sortable: true },
        { key: 'fileType', header: 'File Type', sortable: true, sortValue: fileTypeOf, render: fileTypeOf },
        { key: 'uploadedBy', header: 'Uploaded by', sortable: true, sortValue: (r) => nameOfUser(data, r.uploadedBy), render: (r) => nameOfUser(data, r.uploadedBy) },
        {
            key: 'actions',
            header: <span className="sr-only">Actions</span>,
            render: (r) => (
                <div className="table__actions table__actions--nowrap">
                    <ResourceActions resource={r} />
                    {!readOnly && (
                        <>
                            <Button variant="ghost" className="btn--small" onClick={() => openEditor(r)} aria-label={`Edit ${r.title}`}>Edit</Button>
                            {r.status !== PUBLISH_STATUS.PUBLISHED ? (
                                <Button className="btn--small" onClick={() => setPending({ item: r, status: PUBLISH_STATUS.PUBLISHED })} aria-label={`Publish ${r.title}`}>Publish</Button>
                            ) : (
                                <Button variant="ghost" className="btn--small" onClick={() => setPending({ item: r, status: PUBLISH_STATUS.ARCHIVED })} aria-label={`Archive ${r.title}`}>Archive</Button>
                            )}
                        </>
                    )}
                </div>
            ),
        },
    ];

    const isNew = editing === 'new';

    return (
        <main className="page">
            <div className="page__toolbar">
                <PageHeader title="Course Resources" subtitle="A library of forms, templates and guides for graduate students and advisors. Students only see published resources." />
            </div>
            <div className="filters">
                <SearchBar value={query} onChange={setQuery} placeholder="Search" label="Search resources" />
                <Select label="Sort by" options={SORT_OPTIONS} value={sort} onChange={(e) => setSort(e.target.value)} />
                <Select label="Category" options={[{ value: 'all', label: 'All categories' }, ...RESOURCE_TYPES]} value={type} onChange={(e) => setType(e.target.value)} />
                <Select label="Status" options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} />
            </div>
            <DataTable
                key={sort}
                caption="Course resources"
                columns={columns}
                rows={rows}
                pageSize={6}
                emptyTitle={all.length ? 'No resources match' : 'No resources yet'}
                emptyMessage={all.length ? 'Try a different search or filter.' : 'Upload a guide, template or form for students.'}
            />
            <EditOnly>
                <div className="list-actions">
                    <Button onClick={() => openEditor(null)}>+ Upload</Button>
                </div>
            </EditOnly>

            {!readOnly && (
                <>
                    <Modal
                        open={Boolean(editing)}
                        title={isNew ? 'Upload resource' : 'Edit resource'}
                        onClose={() => setEditing(null)}
                        footer={
                            <>
                                <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                                <Button variant="ghost" onClick={() => save(false)}>{isNew ? 'Save as draft' : 'Save'}</Button>
                                {(isNew || editing?.status !== PUBLISH_STATUS.PUBLISHED) && <Button onClick={() => save(true)}>Save and publish</Button>}
                            </>
                        }
                    >
                        <fieldset className="checkbox-group">
                            <legend>Source</legend>
                            <label className="checkbox">
                                <input type="radio" name="res-source" checked={form.source === 'file'} onChange={() => setForm({ ...form, source: 'file' })} data-autofocus />
                                Upload a file
                            </label>
                            <label className="checkbox">
                                <input type="radio" name="res-source" checked={form.source === 'link'} onChange={() => setForm({ ...form, source: 'link' })} />
                                Link to a website
                            </label>
                        </fieldset>
                        {form.source === 'file' ? (
                            <Input
                                label="File"
                                type="file"
                                accept={UPLOAD_ACCEPT}
                                onChange={(e) => chooseFile(e.target.files?.[0])}
                                error={errors.file}
                                hint={form.fileName ? `Selected: ${form.fileName}` : 'PDF, Word, Excel, PowerPoint or text. Up to 1 MB.'}
                            />
                        ) : (
                            <Input label="Link" required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} error={errors.url} placeholder="https://" />
                        )}
                        <Input label="Document name" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={errors.title} />
                        <Select label="Category" options={RESOURCE_TYPES} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
                        <Input label="Related course" required value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} error={errors.course} hint='A course code like ICS 553, or "Common"' />
                        <Textarea label="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </Modal>
                    <ConfirmationDialog
                        open={Boolean(pending)}
                        title={pending?.status === PUBLISH_STATUS.PUBLISHED ? 'Publish resource?' : 'Archive resource?'}
                        message={pending?.status === PUBLISH_STATUS.PUBLISHED ? `Students will see "${pending.item.title}".` : `Students will no longer see "${pending?.item.title ?? ''}".`}
                        confirmLabel={pending?.status === PUBLISH_STATUS.PUBLISHED ? 'Publish' : 'Archive'}
                        variant={pending?.status === PUBLISH_STATUS.ARCHIVED ? 'danger' : 'primary'}
                        onConfirm={changeStatus}
                        onCancel={() => setPending(null)}
                    />
                </>
            )}
        </main>
    );
}
