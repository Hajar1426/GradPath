import { DEGREE } from './statusValues';

// Advising records (Member 2): which advisor each student has, plus details for the advisor pages.
// The coordinator pages also read this list. Do not remove these fields:
//   userId, advisorId, program
// The capacity page counts students per advisorId.
// Study load is not stored here. getStudyLoad() in src/utils/studyRules.js works it out from nationality
// (local = part-time, international = full-time), the same rule the rest of the app uses.
export const students = [
    { userId: 'u-student-1', advisorId: 'adv-1', program: 'PhD Computer Science', name: 'Sara Alharbi', email: 'student@kfupm.edu.sa', studentNumber: '202011111', degree: DEGREE.PHD, nationality: 'Saudi Arabia', startTerm: '242' },
    { userId: 'u-student-2', advisorId: 'adv-1', program: 'MS Computer Science', name: 'Faris Alghamdi', email: 'faris.alghamdi@kfupm.edu.sa', studentNumber: '202355512', degree: DEGREE.MS, nationality: 'Egypt', startTerm: '251' },
    { userId: 'u-student-3', advisorId: 'adv-3', program: 'MS Software Engineering', name: 'Noura Alshehri', email: 'noura.alshehri@kfupm.edu.sa', studentNumber: '202244421', degree: DEGREE.MS, nationality: 'Saudi Arabia', startTerm: '241' },
    { userId: 'u-student-4', advisorId: 'adv-2', program: 'MS Computer Science', name: 'Ahmed Khan', email: 'ahmed.khan@kfupm.edu.sa', studentNumber: '202366631', degree: DEGREE.MS, nationality: 'Pakistan', startTerm: '251' },
    { userId: 'u-student-5', advisorId: 'adv-2', program: 'PhD Computer Science', name: 'Rana Alghamdi', email: 'rana.alghamdi@kfupm.edu.sa', studentNumber: '202133345', degree: DEGREE.PHD, nationality: 'Saudi Arabia', startTerm: '232' },
    { userId: 'u-student-6', advisorId: 'adv-2', program: 'MS Security', name: 'Yousef Alharthi', email: 'yousef.alharthi@kfupm.edu.sa', studentNumber: '202377712', degree: DEGREE.MS, nationality: 'Saudi Arabia', startTerm: '252' },
    { userId: 'u-student-7', advisorId: 'adv-2', program: 'MS Computer Science', name: 'Mariam Hassan', email: 'mariam.hassan@kfupm.edu.sa', studentNumber: '202288854', degree: DEGREE.MS, nationality: 'Sudan', startTerm: '242' },
    { userId: 'u-student-8', advisorId: 'adv-3', program: 'MS Software Engineering', name: 'Khalid Alotaibi', email: 'khalid.alotaibi@kfupm.edu.sa', studentNumber: '202399913', degree: DEGREE.MS, nationality: 'Saudi Arabia', startTerm: '252' },
    { userId: 'u-student-9', advisorId: 'adv-3', program: 'PhD Computer Science', name: 'Huda Rahman', email: 'huda.rahman@kfupm.edu.sa', studentNumber: '202111176', degree: DEGREE.PHD, nationality: 'India', startTerm: '231' },
    { userId: 'u-student-10', advisorId: 'adv-3', program: 'MS Security', name: 'Abdullah Alqahtani', email: 'abdullah.alqahtani@kfupm.edu.sa', studentNumber: '202322287', degree: DEGREE.MS, nationality: 'Saudi Arabia', startTerm: '251' },
    { userId: 'u-student-11', advisorId: 'adv-3', program: 'MS Computer Science', name: 'Lina Haddad', email: 'lina.haddad@kfupm.edu.sa', studentNumber: '202344490', degree: DEGREE.MS, nationality: 'Jordan', startTerm: '251' },
];