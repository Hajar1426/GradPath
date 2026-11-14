import { REPORT_RATING, REPORT_STATUS } from './statusValues';

// Annual progress reports (Member 2).
// A student submits one report per academic year. Their advisor evaluates it.
// evaluation is null until the advisor evaluates: { rating, comments, actionPlan, evaluatedAt, evaluatedBy }.
// An unsatisfactory rating also adds an item to attentionItems (shared with Member 4) with reportId = this id.
export const annualReports = [
    {
        id: 'rep-1',
        studentId: 'u-student-1',
        advisorId: 'adv-1',
        academicYear: '2025-2026',
        status: REPORT_STATUS.SUBMITTED,
        submittedAt: '2026-10-30T11:20:00',
        answers: {
            progress: 'Finished my literature review on federated learning and started the first experiments on non-IID data.',
            coursesCompleted: 'ICS 553, ICS 531, ICS 570',
            publications: 'One workshop paper under review.',
            challenges: 'Getting enough GPU time on the department cluster.',
            nextSteps: 'Defend my research proposal in Term 262 and submit a conference paper.',
        },
        evaluation: null,
    },
    {
        id: 'rep-2',
        studentId: 'u-student-2',
        advisorId: 'adv-1',
        academicYear: '2025-2026',
        status: REPORT_STATUS.SUBMITTED,
        submittedAt: '2026-11-08T16:05:00',
        answers: {
            progress: 'Completed my first year of coursework and picked a thesis topic on network intrusion detection.',
            coursesCompleted: 'ICS 512, ICS 535',
            publications: 'None yet.',
            challenges: 'Balancing coursework with my teaching assistant duties.',
            nextSteps: 'Write the thesis proposal and collect the dataset.',
        },
        evaluation: null,
    },
    {
        id: 'rep-9',
        studentId: 'u-student-3',
        advisorId: 'adv-3',
        academicYear: '2025-2026',
        status: REPORT_STATUS.EVALUATED,
        submittedAt: '2026-10-20T09:00:00',
        answers: {
            progress: 'Little progress this year because of work commitments.',
            coursesCompleted: 'SWE 530',
            publications: 'None.',
            challenges: 'Time management.',
            nextSteps: 'Take two courses next term.',
        },
        evaluation: {
            rating: REPORT_RATING.UNSATISFACTORY,
            comments: 'Progress is well below what is expected for the second year.',
            actionPlan: 'Meet every two weeks and complete two courses in Term 262.',
            evaluatedAt: '2026-10-30T10:00:00',
            evaluatedBy: 'adv-3',
        },
    },
    {
        id: 'rep-12',
        studentId: 'u-student-7',
        advisorId: 'adv-2',
        academicYear: '2025-2026',
        status: REPORT_STATUS.EVALUATED,
        submittedAt: '2026-10-01T09:00:00',
        answers: {
            progress: 'Dropped two courses and have not chosen a thesis topic yet.',
            coursesCompleted: 'ICS 571',
            publications: 'None.',
            challenges: 'Personal circumstances this year.',
            nextSteps: 'Choose a thesis topic.',
        },
        evaluation: {
            rating: REPORT_RATING.UNSATISFACTORY,
            comments: 'The thesis has not started and two planned courses were dropped.',
            actionPlan: 'Agree a thesis topic by the end of October and meet weekly until it is approved.',
            evaluatedAt: '2026-10-12T10:00:00',
            evaluatedBy: 'adv-2',
        },
    },
];