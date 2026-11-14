import { IMPORT_ROW_STATUS, PUBLISH_STATUS } from '../data/statusValues';
import { normalizeDegree, normalizeStudyLoad } from './studyRules';
import { getEmailError } from './emailRules';

// The real sheets are not final. Change the accepted header names here only.
export const IMPORT_KINDS = {
    students: {
        label: 'Approved student list',
        description: 'Controls who can sign up. Columns: Student ID, Full name, Email, Degree, Nationality, Study load (optional).',
        sample: '/samples/approved-students-sample.xlsx',
        columns: {
            studentId: ['student id', 'id', 'student number'],
            name: ['full name', 'name', 'student name'],
            email: ['email', 'university email', 'e-mail'],
            degree: ['degree', 'program level'],
            nationality: ['nationality', 'country'],
            studyLoad: ['study load', 'load'],
        },
        required: ['name', 'email', 'degree'],
    },
    offerings: {
        label: 'Course offerings',
        description: 'Adds or updates offerings as drafts. Columns: Course code, Title, Term, Section, Instructor, Days, Time, Seats.',
        sample: '/samples/course-offerings-sample.xlsx',
        columns: {
            courseCode: ['course code', 'course', 'code'],
            title: ['title', 'course title'],
            area: ['area'],
            term: ['term'],
            section: ['section'],
            instructor: ['instructor', 'teacher'],
            days: ['days'],
            time: ['time'],
            seats: ['seats', 'capacity'],
        },
        required: ['courseCode', 'term'],
    },
};

const clean = (value) => String(value ?? '').trim();

// Finds which sheet column holds each field. Returns { fieldMap, missing }.
export function mapColumns(kind, headers) {
    const { columns, required } = IMPORT_KINDS[kind];
    const lower = headers.map((h) => clean(h).toLowerCase());
    const fieldMap = {};
    Object.entries(columns).forEach(([field, names]) => {
        const index = lower.findIndex((h) => names.includes(h));
        if (index !== -1) fieldMap[field] = headers[index];
    });
    const missing = required.filter((field) => !fieldMap[field]);
    return { fieldMap, missing };
}

function pick(row, fieldMap) {
    const out = {};
    Object.entries(fieldMap).forEach(([field, header]) => {
        out[field] = clean(row[header]);
    });
    return out;
}

// ----- Students -----
function checkStudent(values) {
    const problems = [];
    if (!values.name) problems.push('Name is missing');
    const emailError = getEmailError(values.email ?? '');
    if (emailError) problems.push(values.email ? 'Email is not a university email' : 'Email is missing');
    if (!normalizeDegree(values.degree)) problems.push(`Unknown degree "${values.degree || 'empty'}"`);
    if (values.studyLoad && !normalizeStudyLoad(values.studyLoad)) problems.push(`Unknown study load "${values.studyLoad}"`);
    return problems;
}

export function buildStudentPreview(rows, fieldMap, roster) {
    const seen = new Set();
    const existing = new Map(roster.map((r) => [r.email.trim().toLowerCase(), r]));
    return rows.map((row, index) => {
        const values = pick(row, fieldMap);
        const email = (values.email ?? '').toLowerCase();
        const problems = checkStudent(values);
        let status;
        if (problems.length) status = IMPORT_ROW_STATUS.INVALID;
        else if (seen.has(email)) status = IMPORT_ROW_STATUS.DUPLICATE;
        else if (existing.has(email)) status = IMPORT_ROW_STATUS.UPDATED;
        else status = IMPORT_ROW_STATUS.NEW;
        if (!problems.length) seen.add(email);
        return {
            rowNumber: index + 2, // +1 for the header row, +1 because sheets count from 1
            key: email,
            values: { ...values, email },
            status,
            problems: status === IMPORT_ROW_STATUS.DUPLICATE ? ['Same email appears earlier in the file'] : problems,
        };
    });
}

// Writes the confirmed rows into the roster. Never resets hasAccount, never deletes anyone.
export function applyStudentImport(roster, preview) {
    const usable = preview.filter((p) => p.status === IMPORT_ROW_STATUS.NEW || p.status === IMPORT_ROW_STATUS.UPDATED);
    const byEmail = new Map(usable.map((p) => [p.key, p.values]));
    const updated = roster.map((r) => {
        const values = byEmail.get(r.email.trim().toLowerCase());
        if (!values) return { ...r, notInLatestSheet: true };
        byEmail.delete(r.email.trim().toLowerCase());
        return {
            ...r,
            studentId: values.studentId || r.studentId,
            name: values.name,
            degree: normalizeDegree(values.degree),
            nationality: values.nationality || r.nationality,
            studyLoadOverride: values.studyLoad ?? r.studyLoadOverride ?? '',
            notInLatestSheet: false,
            // hasAccount is kept as it was
        };
    });
    const stamp = Date.now();
    const added = [...byEmail.values()].map((values, i) => ({
        id: `r-${stamp}-${i}`,
        studentId: values.studentId ?? '',
        name: values.name,
        email: values.email,
        degree: normalizeDegree(values.degree),
        nationality: values.nationality ?? '',
        studyLoadOverride: values.studyLoad ?? '',
        hasAccount: false,
        notInLatestSheet: false,
    }));
    const notInSheet = updated.filter((r) => r.notInLatestSheet).length;
    return { list: [...updated, ...added], notInSheet };
}

// ----- Offerings -----
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/;
export const TERM_PATTERN = /^\d{3}$/;
export const COURSE_CODE_PATTERN = /^[A-Z]{2,4} \d{3}$/;

export function normalizeCourseCode(value) {
    return clean(value).toUpperCase().replace(/\s+/g, ' ').replace(/^([A-Z]+)(\d)/, '$1 $2');
}

export function checkTime(value) {
    if (!TIME_PATTERN.test(value)) return false;
    const [start, end] = value.split('-');
    return start < end;
}

function offeringKey(v) {
    return `${v.courseCode}|${v.term}|${v.section || '01'}`;
}

function checkOffering(values) {
    const problems = [];
    if (!COURSE_CODE_PATTERN.test(values.courseCode)) problems.push(`Course code "${values.courseCode || 'empty'}" should look like ICS 553`);
    if (!TERM_PATTERN.test(values.term)) problems.push(`Term "${values.term || 'empty'}" should be 3 digits, like 261`);
    if (values.time && !checkTime(values.time)) problems.push(`Time "${values.time}" should look like 08:00-09:15`);
    if (values.seats !== '' && values.seats !== undefined && !/^\d+$/.test(values.seats)) problems.push('Seats must be a whole number');
    return problems;
}

export function buildOfferingPreview(rows, fieldMap, offerings) {
    const seen = new Set();
    const existing = new Set(offerings.map((o) => offeringKey(o)));
    return rows.map((row, index) => {
        const raw = pick(row, fieldMap);
        const values = { ...raw, courseCode: normalizeCourseCode(raw.courseCode), section: raw.section || '01' };
        const problems = checkOffering(values);
        const key = offeringKey(values);
        let status;
        if (problems.length) status = IMPORT_ROW_STATUS.INVALID;
        else if (seen.has(key)) status = IMPORT_ROW_STATUS.DUPLICATE;
        else if (existing.has(key)) status = IMPORT_ROW_STATUS.UPDATED;
        else status = IMPORT_ROW_STATUS.NEW;
        if (!problems.length) seen.add(key);
        return {
            rowNumber: index + 2,
            key,
            values,
            status,
            problems: status === IMPORT_ROW_STATUS.DUPLICATE ? ['Same course, term and section appear earlier in the file'] : problems,
        };
    });
}

export function applyOfferingImport(offerings, preview) {
    const usable = preview.filter((p) => p.status === IMPORT_ROW_STATUS.NEW || p.status === IMPORT_ROW_STATUS.UPDATED);
    const byKey = new Map(usable.map((p) => [p.key, p.values]));
    const now = new Date().toISOString();
    const toFields = (v) => ({
        courseCode: v.courseCode,
        title: v.title ?? '',
        area: ['A', 'B', 'C', 'D'].includes((v.area ?? '').toUpperCase()) ? v.area.toUpperCase() : 'A',
        term: v.term,
        section: v.section,
        instructor: v.instructor ?? '',
        days: v.days ?? '',
        time: v.time ?? '',
        seats: v.seats === '' || v.seats === undefined ? 0 : Number(v.seats),
        updatedAt: now,
    });
    const updated = offerings.map((o) => {
        const values = byKey.get(offeringKey(o));
        if (!values) return o;
        byKey.delete(offeringKey(o));
        return { ...o, ...toFields(values) }; // keeps its status
    });
    const stamp = Date.now();
    const added = [...byKey.values()].map((v, i) => ({ id: `off-${stamp}-${i}`, ...toFields(v), status: PUBLISH_STATUS.DRAFT }));
    return { list: [...updated, ...added], notInSheet: 0 };
}

export function summarize(preview) {
    const summary = { new: 0, updated: 0, duplicate: 0, invalid: 0 };
    preview.forEach((p) => {
        summary[p.status] += 1;
    });
    return summary;
}
