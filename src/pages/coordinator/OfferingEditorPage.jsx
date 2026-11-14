import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import { AREAS } from '../../utils/schedule';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import OfferingWarnings from '../../components/coordinator/OfferingWarnings';
import { getOfferingWarnings } from '../../utils/offeringWarnings';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';
import { useReadOnly } from '../../hooks/useReadOnly';
import { PUBLISH_STATUS } from '../../data/statusValues';
import { COURSE_CODE_PATTERN, TERM_PATTERN, normalizeCourseCode } from '../../utils/importRules';
import { newId } from '../../utils/coordinatorHelpers';
import { formatDateTime } from '../../utils/formatDate';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
const EMPTY = { courseCode: '', title: '', area: 'A', term: '', section: '01', instructor: '', days: '', time: '', seats: '' };

function toForm(offering) {
    const [start = '', end = ''] = (offering.time ?? '').split('-');
    return { ...EMPTY, ...offering, seats: String(offering.seats ?? ''), start, end };
}

function validate(form) {
    const errors = {};
    const code = normalizeCourseCode(form.courseCode);
    if (!COURSE_CODE_PATTERN.test(code)) errors.courseCode = 'Enter a course code like ICS 553.';
    if (!form.title.trim()) errors.title = 'Enter the course title.';
    if (!TERM_PATTERN.test(form.term.trim())) errors.term = 'Enter a 3-digit term, like 261.';
    if (!/^\d{1,2}$/.test(form.section.trim())) errors.section = 'Enter a section number, like 01.';
    if (form.seats === '' || !/^\d+$/.test(form.seats) || Number(form.seats) > 200) errors.seats = 'Enter a whole number of seats from 0 to 200.';
    if ((form.start && !form.end) || (!form.start && form.end)) errors.time = 'Enter both a start and an end time, or neither.';
    else if (form.start && form.end && form.start >= form.end) errors.time = 'The end time must be after the start time.';
    return errors;
}

export default function OfferingEditorPage() {
    const { id } = useParams();
    const isNew = id === 'new';
    const { currentUser } = useAuth();
    const { data, updateCollection, addAuditEvent } = useData();
    const { showToast } = useToast();
    const readOnly = useReadOnly();
    const navigate = useNavigate();
    const offerings = data.offerings ?? [];
    const existing = offerings.find((o) => o.id === id);
    const [form, setForm] = useState(() => (existing ? toForm(existing) : { ...EMPTY, start: '', end: '' }));
    const [errors, setErrors] = useState({});
    const [confirmPublish, setConfirmPublish] = useState(false);

    if (!isNew && !existing) {
        return (
            <main className="page">
                <EmptyState title="Offering not found" message="It may have been removed." action={<Link className="btn btn--ghost" to="/coordinator/offerings">Back to offerings</Link>} />
            </main>
        );
    }
    if (isNew && readOnly) {
        return (
            <main className="page">
                <EmptyState title="View only" message="Only the coordinator can create offerings." action={<Link className="btn btn--ghost" to="/coordinator/offerings">Back to offerings</Link>} />
            </main>
        );
    }

    const draft = {
        id: existing?.id ?? 'new',
        courseCode: normalizeCourseCode(form.courseCode),
        title: form.title.trim(),
        area: form.area,
        term: form.term.trim(),
        section: form.section.trim().padStart(2, '0'),
        instructor: form.instructor.trim(),
        days: form.days,
        time: form.start && form.end ? `${form.start}-${form.end}` : '',
        seats: form.seats === '' ? '' : Number(form.seats),
    };
    const warnings = form.courseCode && form.term ? getOfferingWarnings(draft, offerings, data.courses) : [];

    function setField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    function toggleDay(day) {
        const chosen = form.days.split(/\s+/).filter(Boolean);
        const next = chosen.includes(day) ? chosen.filter((d) => d !== day) : [...chosen, day];
        setField('days', DAYS.filter((d) => next.includes(d)).join(' '));
    }

    function save(status) {
        const found = validate(form);
        setErrors(found);
        if (Object.keys(found).length) {
            setConfirmPublish(false);
            showToast('Fix the highlighted fields first.', 'error');
            return;
        }
        const record = { ...draft, id: existing?.id ?? newId('off'), status, updatedAt: new Date().toISOString() };
        updateCollection('offerings', (list) => (existing ? list.map((o) => (o.id === existing.id ? record : o)) : [...list, record]));
        addAuditEvent({
            userId: null,
            actorId: currentUser.id,
            action: status === PUBLISH_STATUS.PUBLISHED ? 'offering_published' : existing ? 'offering_updated' : 'offering_created',
            detail: `${record.courseCode} term ${record.term}`,
        });
        showToast(status === PUBLISH_STATUS.PUBLISHED ? `${record.courseCode} published. Students can now see it.` : `${record.courseCode} saved.`);
        navigate('/coordinator/offerings');
    }

    if (readOnly) {
        return (
            <main className="page">
                <Link className="back-link" to="/coordinator/offerings">← Back to offerings</Link>
                <PageHeader title={`${existing.courseCode} · ${existing.title}`} subtitle={`Last updated ${formatDateTime(existing.updatedAt)}`} />
                <dl className="detail-list">
                    <dt>Status</dt><dd><StatusBadge status={existing.status} /></dd>
                    <dt>Area</dt><dd>Area {existing.area ?? '—'}</dd>
                    <dt>Term and section</dt><dd>{existing.term} · section {existing.section}</dd>
                    <dt>Instructor</dt><dd>{existing.instructor || 'Not set'}</dd>
                    <dt>Schedule</dt><dd>{existing.days && existing.time ? `${existing.days} ${existing.time}` : 'Times not set'}</dd>
                    <dt>Seats</dt><dd>{existing.seats}</dd>
                </dl>
                <OfferingWarnings warnings={getOfferingWarnings(existing, offerings, data.courses)} />
            </main>
        );
    }

    const chosenDays = form.days.split(/\s+/).filter(Boolean);
    const currentStatus = existing?.status ?? PUBLISH_STATUS.DRAFT;

    return (
        <main className="page">
            <Link className="back-link" to="/coordinator/offerings">← Back to offerings</Link>
            <div className="page__toolbar">
                <PageHeader title={isNew ? 'New offering' : `Edit ${existing.courseCode}`} subtitle="Required fields are marked with *. Warnings do not stop you from saving." />
                {!isNew && <StatusBadge status={currentStatus} />}
            </div>
            <form
                className="form-grid"
                noValidate
                onSubmit={(e) => {
                    e.preventDefault();
                    save(currentStatus === PUBLISH_STATUS.PUBLISHED ? PUBLISH_STATUS.PUBLISHED : PUBLISH_STATUS.DRAFT);
                }}
            >
                <Input label="Course code" required value={form.courseCode} onChange={(e) => setField('courseCode', e.target.value)} error={errors.courseCode} hint="For example ICS 553" />
                <Input label="Course title" required value={form.title} onChange={(e) => setField('title', e.target.value)} error={errors.title} />
                <Select label="Area" value={form.area} onChange={(e) => setField('area', e.target.value)} options={AREAS.map((a) => ({ value: a, label: `Area ${a}` }))} hint="Sets the color on the weekly schedule" />
                <Input label="Term" required value={form.term} onChange={(e) => setField('term', e.target.value)} error={errors.term} hint="3 digits, for example 261" inputMode="numeric" />
                <Input label="Section" required value={form.section} onChange={(e) => setField('section', e.target.value)} error={errors.section} />
                <Input label="Instructor" value={form.instructor} onChange={(e) => setField('instructor', e.target.value)} />
                <Input label="Seats" required value={form.seats} onChange={(e) => setField('seats', e.target.value)} error={errors.seats} inputMode="numeric" />
                <fieldset className="checkbox-group form-grid__wide">
                    <legend>Days</legend>
                    {DAYS.map((day) => (
                        <label key={day} className="checkbox">
                            <input type="checkbox" checked={chosenDays.includes(day)} onChange={() => toggleDay(day)} />
                            {day}
                        </label>
                    ))}
                </fieldset>
                <Input label="Start time" type="time" value={form.start} onChange={(e) => setField('start', e.target.value)} error={errors.time} />
                <Input label="End time" type="time" value={form.end} onChange={(e) => setField('end', e.target.value)} />
                <div className="form-grid__wide">
                    <OfferingWarnings warnings={warnings} />
                </div>
                <div className="form-actions form-grid__wide">
                    <Button variant="ghost" onClick={() => navigate('/coordinator/offerings')}>Cancel</Button>
                    {currentStatus === PUBLISH_STATUS.PUBLISHED ? (
                        <Button type="submit">Save changes</Button>
                    ) : (
                        <>
                            <Button variant="ghost" type="submit">Save draft</Button>
                            <Button onClick={() => setConfirmPublish(true)}>Publish</Button>
                        </>
                    )}
                </div>
            </form>
            <ConfirmationDialog
                open={confirmPublish}
                title="Publish this offering?"
                message="Students will see it on the course offerings page and can add it to their plan."
                confirmLabel="Publish"
                onConfirm={() => save(PUBLISH_STATUS.PUBLISHED)}
                onCancel={() => setConfirmPublish(false)}
            />
        </main>
    );
}
