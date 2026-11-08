import { DEGREE, STUDY_LOAD } from '../data/statusValues';

// Minimum number of courses a student plans per semester.
export const MIN_COURSES_PER_SEMESTER = {
    [STUDY_LOAD.FULL_TIME]: 3,
    [STUDY_LOAD.PART_TIME]: 1,
};

export const DEGREE_LABEL = { [DEGREE.PHD]: 'PhD', [DEGREE.MS]: 'MS' };
export const STUDY_LOAD_LABEL = { [STUDY_LOAD.FULL_TIME]: 'Full-time', [STUDY_LOAD.PART_TIME]: 'Part-time' };

// Edit this list when the real sheet shows how nationality is written.
const LOCAL_WORDS = ['local', 'saudi', 'saudi arabia', 'kingdom of saudi arabia', 'ksa'];

export function isLocalNationality(value) {
    return LOCAL_WORDS.includes(String(value ?? '').trim().toLowerCase());
}

// Turns what the sheet says ("PhD", "Ph.D", "Master", "M.S.") into 'phd' or 'ms'. Returns null if unknown.
export function normalizeDegree(value) {
    const text = String(value ?? '').toLowerCase().replace(/[^a-z]/g, '');
    if (['phd', 'doctorate', 'doctoral', 'doctorofphilosophy'].includes(text)) return DEGREE.PHD;
    if (['ms', 'msc', 'master', 'masters', 'masterofscience'].includes(text)) return DEGREE.MS;
    return null;
}

export function normalizeStudyLoad(value) {
    const text = String(value ?? '').toLowerCase().replace(/[^a-z]/g, '');
    if (text === 'fulltime') return STUDY_LOAD.FULL_TIME;
    if (text === 'parttime') return STUDY_LOAD.PART_TIME;
    return null;
}

// An optional "study load" value in the sheet wins. Otherwise: local = part-time, international = full-time.
export function getStudyLoad(student) {
    const override = normalizeStudyLoad(student.studyLoadOverride);
    if (override) return override;
    return isLocalNationality(student.nationality) ? STUDY_LOAD.PART_TIME : STUDY_LOAD.FULL_TIME;
}

export function getMinCourses(student) {
    return MIN_COURSES_PER_SEMESTER[getStudyLoad(student)];
}