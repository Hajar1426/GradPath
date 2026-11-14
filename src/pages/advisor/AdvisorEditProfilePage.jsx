import { useState } from 'react';
import BackLink from '../../components/common/BackLink';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import EmptyState from '../../components/common/EmptyState';
import TagInput from '../../components/advising/TagInput';
import PageHeader from '../../components/layout/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';

const BIO_MAX = 600;
// Course codes look like "ICS 512" or "SWE 586": 2 to 4 letters, a space, 3 digits.
const COURSE_CODE = /^[A-Z]{2,4} \d{3}$/;

// "ics512" or "ics 512" -> "ICS 512", so advisors can type codes quickly.
function formatCourseCode(text) {
    const match = text.toUpperCase().replace(/\s+/g, '').match(/^([A-Z]{2,4})(\d{3})$/);
    return match ? `${match[1]} ${match[2]}` : text.toUpperCase();
}

// Only the fields the advisor may change. Name, email and department are managed by the admin.
function formFrom(advisor) {
    return {
        title: advisor.title ?? '',
        degree: advisor.degree ?? '',
        office: advisor.office ?? '',
        officeHours: advisor.officeHours ?? '',
        bio: advisor.bio ?? '',
        researchAreas: advisor.researchAreas ?? [],
        courses: advisor.courses ?? [],
    };
}

// Returns { fieldName: 'message' } for every field with a problem. Empty object means valid.
function validate(form) {
    const errors = {};
    if (!form.title.trim()) errors.title = 'Enter your academic title.';
    if (!form.office.trim()) errors.office = 'Enter your office so students can find you.';
    if (form.bio.length > BIO_MAX) errors.bio = `Keep your bio under ${BIO_MAX} characters.`;
    if (form.researchAreas.length === 0) errors.researchAreas = 'Add at least one research area. Students search by it.';
    const badCode = form.courses.find((code) => !COURSE_CODE.test(code));
    if (badCode) errors.courses = `"${badCode}" is not a course code like ICS 512.`;
    return errors;
}

// The advisor edits their own public profile (what students see in CCM Faculty).
export default function AdvisorEditProfilePage() {
    const { currentUser } = useAuth();
    const { data, updateCollection } = useData();
    const { showToast } = useToast();

    const advisor = (data.advisors ?? []).find((a) => a.userId === currentUser?.id);
    const [form, setForm] = useState(() => (advisor ? formFrom(advisor) : null));
    const [errors, setErrors] = useState({});

    if (!advisor || !form) {
        return (
            <main className="page page--plain">
                <div className="panel">
                    <EmptyState title="Your advisor profile is not set up yet" message="Ask the coordinator to link your account to an advisor profile." />
                </div>
            </main>
        );
    }

    // Has anything changed compared with what is saved?
    const changed = JSON.stringify(form) !== JSON.stringify(formFrom(advisor));

    // One function updates any field: setField('office', '22-X05').
    function setField(name, value) {
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    function handleSubmit(event) {
        event.preventDefault(); // stop the browser from reloading the page
        const found = validate(form);
        setErrors(found);
        if (Object.keys(found).length > 0) {
            showToast('Please fix the highlighted fields.', 'error');
            return;
        }
        const cleaned = {
            ...form,
            title: form.title.trim(),
            degree: form.degree.trim(),
            office: form.office.trim(),
            officeHours: form.officeHours.trim(),
            bio: form.bio.trim(),
        };
        // Replace only this advisor in the list. Every other field (id, email, coordinatorOverride...) is kept.
        updateCollection('advisors', (list) => list.map((a) => (a.id === advisor.id ? { ...a, ...cleaned } : a)));
        showToast('Profile saved. Students now see your changes.');
    }

    function handleDiscard() {
        setForm(formFrom(advisor));
        setErrors({});
    }

    return (
        <main className="page page--plain">
            <div>
                <BackLink to="/advisor">← Back to home</BackLink>
            </div>

            <form className="panel" onSubmit={handleSubmit} noValidate>
                <PageHeader title="Edit profile" subtitle="This is what students see when they look you up in CCM Faculty." />

                <dl className="detail-list detail-list--tight advisor-edit__fixed">
                    <dt>Name</dt><dd>{advisor.name}</dd>
                    <dt>Email</dt><dd>{advisor.email}</dd>
                    <dt>Department</dt><dd>{advisor.department}</dd>
                </dl>
                <p className="hint">Name, email and department are managed by the administrator.</p>

                <div className="form-grid">
                    <Input label="Academic title" required value={form.title} onChange={(e) => setField('title', e.target.value)} error={errors.title} placeholder="e.g. Associate Professor" />
                    <Input label="Highest degree" value={form.degree} onChange={(e) => setField('degree', e.target.value)} placeholder="e.g. PhD in Computer Science" />
                    <Input label="Office" required value={form.office} onChange={(e) => setField('office', e.target.value)} error={errors.office} placeholder="e.g. 22-X02" />
                    <Input label="Office hours" value={form.officeHours} onChange={(e) => setField('officeHours', e.target.value)} placeholder="e.g. Sun and Tue, 10:00 - 11:30" />

                    <div className="form-grid__wide">
                        <Textarea
                            label="About you"
                            rows={5}
                            value={form.bio}
                            onChange={(e) => setField('bio', e.target.value)}
                            error={errors.bio}
                            hint={`${form.bio.length} / ${BIO_MAX} characters. What you work on and what kind of students you are looking for.`}
                        />
                    </div>

                    <div className="form-grid__wide">
                        <TagInput
                            label="Research areas *"
                            values={form.researchAreas}
                            onChange={(list) => setField('researchAreas', list)}
                            placeholder="e.g. Machine learning"
                            hint="Press Enter or Add after each one."
                            error={errors.researchAreas}
                        />
                    </div>

                    <div className="form-grid__wide">
                        <TagInput
                            label="Courses you teach"
                            values={form.courses}
                            onChange={(list) => setField('courses', list)}
                            placeholder="e.g. ICS 512"
                            hint="Course codes like ICS 512."
                            error={errors.courses}
                            transform={formatCourseCode}
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <Button variant="ghost" onClick={handleDiscard} disabled={!changed}>Discard changes</Button>
                    <Button type="submit" disabled={!changed}>Save changes</Button>
                </div>
            </form>
        </main>
    );
}