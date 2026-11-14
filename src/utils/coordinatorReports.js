import { ALERT_STATUS, AUTHORIZATION_STATUS, PUBLISH_STATUS } from '../data/statusValues';
import { DEGREE_LABEL, STUDY_LOAD_LABEL, getStudyLoad } from './studyRules';
import { AVAILABILITY_LABEL, capacityOf, computeAvailability, countAssigned } from './computeAvailability';
import { nameOfUser } from './coordinatorHelpers';
import { formatDate } from './formatDate';

const DAY = 24 * 60 * 60 * 1000;
const arr = (value) => (Array.isArray(value) ? value : []);

export const ISSUE_LABEL = {
    report_unsatisfactory: 'Unsatisfactory report',
    missing_advisor: 'Missing advisor',
};

// Joins a roster row to its user account and advising record (if they exist).
export function studentRecords(data) {
    const users = arr(data.users);
    const students = arr(data.students);

    return arr(data.studentRoster).map((r) => {
        const email = String(r.email ?? '').trim().toLowerCase();

        const user = users.find(
            (u) => String(u.email ?? '').trim().toLowerCase() === email
        );

    // Find the advising record (Member 2's students.js) by email first.
        const recordByEmail = students.find(
            (s) => String(s.email ?? '').trim().toLowerCase() === email
        );

        // Fall back to the existing userId matching method.
        const record = recordByEmail ?? (
            user
                ? students.find((s) => s.userId === user.id)
                : null
        );

        return {
            ...r,
            userId: user?.id ?? record?.userId ?? null,
            advisorId: record?.advisorId ?? null,
            program: record?.program ?? (DEGREE_LABEL[r.degree] ?? ''),
            studyLoad: getStudyLoad(r),
        };
    });
}
// Students needing attention: open attention items plus approved students without an advisor.
export function studentsNeedingAttention(data) {
    const records = studentRecords(data);
    const students = arr(data.students);
    const rows = arr(data.attentionItems)
        .filter((a) => a.status !== ALERT_STATUS.RESOLVED)
        .map((a) => {
            const record = records.find((r) => r.userId === a.studentId);
            return {
                id: a.id,
                attentionId: a.id,
                name: record?.name ?? nameOfUser(data, a.studentId),
                email: record?.email ?? '',
                studentId: record?.studentId ?? '—',
                program: record?.program ?? students.find((s) => s.userId === a.studentId)?.program ?? '—',
                issue: 'report_unsatisfactory',
                since: a.createdAt,
            };
        });
    records
        .filter((r) => !r.advisorId)
        .forEach((r) => rows.push({
            id: `noadv-${r.id}`,
            name: r.name,
            email: r.email,
            studentId: r.studentId,
            program: r.program,
            issue: 'missing_advisor'
        }));
    return rows;
}

export function capacityRows(data) {
    return arr(data.advisors).map((a) => {
        const count = countAssigned(arr(data.students), a.id);
        const capacity = capacityOf(a);
        const value = computeAvailability(a, count);
        return { ...a, count, capacity, value, label: AVAILABILITY_LABEL[value], slots: `${count}/${capacity}` };
    });
}

// Exception report. filters: { degree, load, term } where 'all' means no filter.
export function buildExceptions(data, filters = {}, now = Date.now()) {
    const { degree = 'all', load = 'all', term = 'all' } = filters;
    const termOk = (item) => term === 'all' || item.term === term;
    const out = [];
    studentRecords(data)
        .filter((r) => (degree === 'all' || r.degree === degree) && (load === 'all' || r.studyLoad === load))
        .forEach((r) => {
            if (r.notInLatestSheet) out.push({ id: `nis-${r.id}`, area: 'Students', item: r.name, detail: 'Not in the latest student sheet' });
            if (!r.hasAccount) out.push({ id: `noacc-${r.id}`, area: 'Students', item: r.name, detail: `Approved but not signed up (${DEGREE_LABEL[r.degree] ?? ''}, ${STUDY_LOAD_LABEL[r.studyLoad]})` });
            if (!r.advisorId) out.push({ id: `noadv-${r.id}`, area: 'Students', item: r.name, detail: 'No advisor assigned' });
        });
    capacityRows(data)
        .filter((a) => a.count >= a.capacity && !a.coordinatorOverride)
        .forEach((a) => out.push({ id: `cap-${a.id}`, area: 'Capacity', item: a.name, detail: `${a.count} advisees, all ${a.capacity} slots used or more` }));
        arr(data.courseAuthorizations)
        .filter(termOk)
        .filter((r) => r.status === AUTHORIZATION_STATUS.PENDING && now - new Date(r.requestedAt).getTime() > 3 * DAY)
        .forEach((r) => out.push({ id: `auth-${r.id}`, area: 'Authorizations', item: `${r.courseCode} (${nameOfUser(data, r.studentId)})`, detail: `Pending since ${formatDate(r.requestedAt)}` }));
    arr(data.offerings)
        .filter(termOk)
        .filter((o) => o.status === PUBLISH_STATUS.PUBLISHED && Number(o.seats) === 0)
        .forEach((o) => out.push({ id: `seat-${o.id}`, area: 'Offerings', item: `${o.courseCode} term ${o.term}`, detail: 'Published with 0 seats' }));
    return out;
}

// Sheets for the downloadable .xlsx files.
export function exceptionSheet(data, filters, now) {
    return [['Area', 'Item', 'What to check'], ...buildExceptions(data, filters, now).map((e) => [e.area, e.item, e.detail])];
}

export function capacitySheet(data) {
    return [
        ['Advisor', 'Department', 'Office', 'Advisees', 'Slots used', 'Students see', 'Override reason'],
        ...capacityRows(data).map((a) => [a.name, a.department, a.office ?? '', a.count, a.slots, a.label, a.coordinatorOverride?.reason ?? '']),
    ];
}

export function authorizationSheet(data) {
    return [
        ['Student', 'Course', 'Term', 'Reason', 'Status', 'Requested', 'Decided', 'Note'],
        ...arr(data.courseAuthorizations).map((r) => [
            nameOfUser(data, r.studentId), r.courseCode, r.term, r.reason, r.status,
            formatDate(r.requestedAt), r.decidedAt ? formatDate(r.decidedAt) : '', r.note ?? '',
        ]),
    ];
}
