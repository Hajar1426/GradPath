import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import { ANNOUNCEMENT_CATEGORIES } from '../../data/announcements';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import AudienceSelector from '../../components/coordinator/AudienceSelector';
import AnnouncementPreview from '../../components/coordinator/AnnouncementPreview';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';
import { useReadOnly } from '../../hooks/useReadOnly';
import { PUBLISH_STATUS, ROLES } from '../../data/statusValues';
import { audienceText, newId } from '../../utils/coordinatorHelpers';
import { publishAnnouncement } from './announcementActions';

const TITLE_MAX = 100;

function validate(form) {
    const errors = {};
    if (!form.title.trim()) errors.title = 'Enter a title.';
    else if (form.title.length > TITLE_MAX) errors.title = `Keep the title under ${TITLE_MAX} characters.`;
    if (form.body.trim().length < 20) errors.body = 'Write at least 20 characters so readers know what this is about.';
    if (form.audience.length === 0) errors.audience = 'Choose at least one audience.';
    return errors;
}

export default function AnnouncementEditorPage() {
    const { id } = useParams();
    const isNew = id === 'new';
    const { currentUser } = useAuth();
    const store = useData();
    const { data, updateCollection, addAuditEvent } = store;
    const { showToast } = useToast();
    const readOnly = useReadOnly();
    const navigate = useNavigate();
    const existing = (data.announcements ?? []).find((a) => a.id === id);
    const [form, setForm] = useState(() => ({
        title: existing?.title ?? '',
        body: existing?.body ?? '',
        category: existing?.category ?? 'general',
        audience: existing?.audience ?? [ROLES.STUDENT],
    }));
    const [errors, setErrors] = useState({});
    const [confirmPublish, setConfirmPublish] = useState(false);

    if ((!isNew && !existing) || (isNew && readOnly)) {
        return (
            <main className="page">
                <EmptyState
                    title={readOnly ? 'View only' : 'Announcement not found'}
                    message={readOnly ? 'Only the coordinator can write announcements.' : 'It may have been removed.'}
                    action={<Link className="btn btn--ghost" to="/coordinator/announcements">Back to announcements</Link>}
                />
            </main>
        );
    }

    const status = existing?.status ?? PUBLISH_STATUS.DRAFT;
    const preview = { ...existing, ...form, publishedAt: existing?.publishedAt };

    if (readOnly || status === PUBLISH_STATUS.ARCHIVED) {
        return (
            <main className="page">
                <Link className="back-link" to="/coordinator/announcements">← Back to announcements</Link>
                <div className="page__toolbar">
                    <PageHeader title={existing.title} subtitle={`For: ${audienceText(existing.audience)}`} />
                    <StatusBadge status={status} />
                </div>
                <div style={{ marginTop: 20 }}>
                    <AnnouncementPreview announcement={existing} />
                </div>
            </main>
        );
    }

    function setField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    function check() {
        const found = validate(form);
        setErrors(found);
        if (Object.keys(found).length) {
            showToast('Fix the highlighted fields first.', 'error');
            return false;
        }
        return true;
    }

    const record = () => ({
        id: existing?.id ?? newId('ann'),
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        publishedAt: existing?.publishedAt ?? null,
        status,
        title: form.title.trim(),
        body: form.body.trim(),
        category: form.category,
        audience: form.audience,
    });

    function saveDraft() {
        if (!check()) return;
        const item = record();
        updateCollection('announcements', (list) => (existing ? list.map((a) => (a.id === item.id ? item : a)) : [item, ...list]));
        addAuditEvent({ userId: null, actorId: currentUser.id, action: existing ? 'announcement_updated' : 'announcement_created', detail: item.title });
        showToast(status === PUBLISH_STATUS.PUBLISHED ? 'Changes saved.' : 'Draft saved.');
        navigate('/coordinator/announcements');
    }

    function publish() {
        setConfirmPublish(false);
        if (!check()) return;
        const reached = publishAnnouncement(store, record(), currentUser);
        showToast(`Published. ${reached} people were notified.`);
        navigate('/coordinator/announcements');
    }

    return (
        <main className="page">
            <Link className="back-link" to="/coordinator/announcements">← Back to announcements</Link>
            <div className="page__toolbar">
                <PageHeader title={isNew ? 'New announcement' : 'Edit announcement'} subtitle="Readers see only announcements meant for their role." />
                {!isNew && <StatusBadge status={status} />}
            </div>
            <div className="editor-layout">
                <form
                    noValidate
                    onSubmit={(e) => {
                        e.preventDefault();
                        saveDraft();
                    }}
                >
                    <Input label="Title" required value={form.title} onChange={(e) => setField('title', e.target.value)} error={errors.title} hint={`${form.title.length}/${TITLE_MAX}`} />
                    <Select label="Category" value={form.category} onChange={(e) => setField('category', e.target.value)} options={ANNOUNCEMENT_CATEGORIES} />
                    <Textarea label="Message" required rows={7} value={form.body} onChange={(e) => setField('body', e.target.value)} error={errors.body} />
                    <AudienceSelector value={form.audience} onChange={(value) => setField('audience', value)} error={errors.audience} />
                    <div className="form-actions">
                        <Button variant="ghost" onClick={() => navigate('/coordinator/announcements')}>Cancel</Button>
                        {status === PUBLISH_STATUS.PUBLISHED ? (
                            <Button type="submit">Save changes</Button>
                        ) : (
                            <>
                                <Button variant="ghost" type="submit">Save draft</Button>
                                <Button onClick={() => check() && setConfirmPublish(true)}>Publish</Button>
                            </>
                        )}
                    </div>
                </form>
                <section aria-labelledby="preview-heading">
                    <h2 className="section-title" id="preview-heading" style={{ marginTop: 0 }}>Preview</h2>
                    <p className="hint" style={{ marginTop: 4 }}>This is how readers will see it.</p>
                    <AnnouncementPreview announcement={preview} />
                </section>
            </div>
            <ConfirmationDialog
                open={confirmPublish}
                title="Publish announcement?"
                message={`It will be shown to: ${audienceText(form.audience)}. They will also get a notification.`}
                confirmLabel="Publish"
                onConfirm={publish}
                onCancel={() => setConfirmPublish(false)}
            />
        </main>
    );
}
