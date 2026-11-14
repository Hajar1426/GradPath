import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import StatusBadge from '../../components/common/StatusBadge';
import TagInput from '../../components/advising/TagInput';
import { MailIcon, PinIcon } from '../../components/coordinator/Icons';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useStudentInfo } from '../../hooks/useStudentInfo';
import { useToast } from '../../hooks/useToast';
import { DEGREE_LABEL, STUDY_LOAD_LABEL, getStudyLoad } from '../../utils/studyRules';
import { completedCourses, creditsOf, planOf } from '../../utils/advisorHelpers';

const TOPIC_MAX = 150;
// Saudi mobile numbers: 05 followed by 8 digits. Spaces are ignored.
const PHONE = /^05\d{8}$/;

// Only the fields the student may change. Name, ID, email, degree and nationality come from the
// coordinator's student list, and the advisor is assigned by the department.
function formFrom(record) {
    return {
        phone: record?.phone ?? '',
        thesisTopic: record?.thesisTopic ?? '',
        researchInterests: record?.researchInterests ?? [],
    };
}

function validate(form) {
    const errors = {};
    const phone = form.phone.replace(/\s+/g, '');
    if (phone && !PHONE.test(phone)) errors.phone = 'Enter a mobile number like 05XXXXXXXX, or leave it empty.';
    if (form.thesisTopic.length > TOPIC_MAX) errors.thesisTopic = `Keep the topic under ${TOPIC_MAX} characters.`;
    return errors;
}

// The student's own profile: details from the department (read-only) and research details they can edit.
export default function StudentProfilePage() {
    const { currentUser } = useAuth();
    const { data, updateCollection } = useData();
    const { showToast } = useToast();
    const rosterInfo = useStudentInfo(); // from the coordinator's student list

    // Advising record (Member 2). New students may not have one until an advisor is assigned.
    const record = (data.students ?? []).find((s) => s.userId === currentUser?.id);
    const advisor = record?.advisorId ? (data.advisors ?? []).find((a) => a.id === record.advisorId) : undefined;

    const [form, setForm] = useState(() => formFrom(record));
    const [errors, setErrors] = useState({});

    const plan = planOf(data, currentUser?.id);
    const completed = completedCourses(plan);
    const report = (data.annualReports ?? []).find((r) => r.studentId === currentUser?.id);

    const name = record?.name ?? rosterInfo?.name ?? currentUser?.name;
    const studentNumber = record?.studentNumber ?? rosterInfo?.studentId;
    const degree = record?.degree ?? rosterInfo?.degree;
    const studyLoad = getStudyLoad(record ?? rosterInfo ?? {});
    const changed = JSON.stringify(form) !== JSON.stringify(formFrom(record));

    function setField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    function handleSubmit(event) {
        event.preventDefault();
        const found = validate(form);
        setErrors(found);
        if (Object.keys(found).length > 0) {
            showToast('Please fix the highlighted fields.', 'error');
            return;
        }
        const cleaned = { ...form, phone: form.phone.replace(/\s+/g, ''), thesisTopic: form.thesisTopic.trim() };

        if (record) {
            // Keep every other field (advisorId, program...) and only change these three.
            updateCollection('students', (list) => list.map((s) => (s.userId === record.userId ? { ...s, ...cleaned } : s)));
        } else {
            // No advising record yet: create one without an advisor. The coordinator assigns the advisor later.
            updateCollection('students', (list) => [
                ...list,
                {
                    userId: currentUser.id,
                    advisorId: null,
                    program: '',
                    name,
                    email: currentUser.email,
                    studentNumber,
                    degree,
                    nationality: rosterInfo?.nationality ?? '',
                    ...cleaned,
                },
            ]);
        }
        showToast('Profile saved. Your advisor can see your research details.');
    }

    return (
        <main className="page page--plain">
            <div className="advisor-profile">
                {/* Left: the green card with details from the department */}
                <section className="panel advisor-card" aria-labelledby="student-name">
                    <div className="advisor-card__header">
                        <h1 className="advisor-card__name" id="student-name">{name}</h1>
                        <p className="advisor-card__degree">{record?.program || DEGREE_LABEL[degree] || 'Graduate student'}</p>
                    </div>
                    <div className="advisor-card__body">
                        <dl className="detail-list detail-list--tight">
                            <dt>Student ID</dt><dd>{studentNumber ?? '—'}</dd>
                            <dt>Degree</dt><dd>{DEGREE_LABEL[degree] ?? '—'}</dd>
                            <dt>Study load</dt><dd>{STUDY_LOAD_LABEL[studyLoad]}</dd>
                            <dt>Started</dt><dd>{record?.startTerm ? `Term ${record.startTerm}` : '—'}</dd>
                            <dt>Email</dt><dd>{currentUser?.email}</dd>
                        </dl>
                        <p className="hint">These details come from the department. Contact the coordinator if something is wrong.</p>
                    </div>
                </section>

                <div className="advisor-profile__main">
                    {/* Advisor */}
                    <section className="panel" aria-labelledby="advisor-title">
                        <h2 className="panel__title" id="advisor-title">My advisor</h2>
                        {advisor ? (
                            <div className="advisor-box">
                                <Link className="cell__link" to={`/student/advisors/${advisor.id}`}>{advisor.name}</Link>
                                <span className="faculty-card__line"><MailIcon /> <a href={`mailto:${advisor.email}`}>{advisor.email}</a></span>
                                <span className="faculty-card__line"><PinIcon /> Office {advisor.office ?? 'not set'}</span>
                            </div>
                        ) : (
                            <div className="advisor-box">
                                <strong>No advisor assigned</strong>
                                <Link className="advisor-detail__link" to="/student/advisors">Browse CCM Faculty →</Link>
                            </div>
                        )}
                    </section>

                    {/* Academic summary, read from the plan and report */}
                    <section className="panel" aria-labelledby="summary-title">
                        <h2 className="panel__title" id="summary-title">Academic summary</h2>
                        <dl className="detail-list detail-list--tight">
                            <dt>Degree plan</dt>
                            <dd>{plan ? <StatusBadge status={plan.status} /> : 'Not started'}</dd>
                            <dt>Credits completed</dt>
                            <dd>{creditsOf(completed, data.courses ?? [])} ({completed.length} courses)</dd>
                            <dt>Annual report</dt>
                            <dd>{report ? <StatusBadge status={report.evaluation?.rating ?? report.status} /> : 'Not submitted'}</dd>
                        </dl>
                        <Link className="advisor-detail__link" to="/student/plan">Open my degree plan →</Link>
                    </section>

                    {/* What the student can edit */}
                    <form className="panel" onSubmit={handleSubmit} noValidate aria-labelledby="research-title">
                        <PageHeader title="Research and contact" subtitle="Your advisor sees this on your student page." />
                        <div className="form-grid">
                            <div className="form-grid__wide">
                                <Input
                                    label="Thesis or research topic"
                                    value={form.thesisTopic}
                                    onChange={(e) => setField('thesisTopic', e.target.value)}
                                    error={errors.thesisTopic}
                                    hint={`${form.thesisTopic.length} / ${TOPIC_MAX} characters. Leave empty if you have not chosen one yet.`}
                                    placeholder="e.g. Federated learning on non-IID data"
                                />
                            </div>
                            <div className="form-grid__wide">
                                <TagInput
                                    label="Research interests"
                                    values={form.researchInterests}
                                    onChange={(list) => setField('researchInterests', list)}
                                    placeholder="e.g. Machine learning"
                                    hint="Helps you and your advisor find a good topic. Press Enter or Add after each one."
                                />
                            </div>
                            <Input
                                label="Mobile number"
                                type="tel"
                                inputMode="numeric"
                                value={form.phone}
                                onChange={(e) => setField('phone', e.target.value)}
                                error={errors.phone}
                                placeholder="05XXXXXXXX"
                                hint="Optional."
                            />
                        </div>
                        <div className="form-actions">
                            <Button variant="ghost" onClick={() => { setForm(formFrom(record)); setErrors({}); }} disabled={!changed}>Discard changes</Button>
                            <Button type="submit" disabled={!changed}>Save changes</Button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}