import { DEGREE } from './statusValues';

// The approved student list (in the real system it comes from the coordinator's Excel upload).
// hasAccount is true once the student has signed up.
export const studentRoster = [
    { id: 'r-1', studentId: '202011111', name: 'Sara Alharbi', email: 'student@kfupm.edu.sa', degree: DEGREE.PHD, nationality: 'Saudi Arabia', studyLoadOverride: '', hasAccount: true },
    { id: 'r-2', studentId: '202122222', name: 'Omar Alqahtani', email: 'omar.alqahtani@kfupm.edu.sa', degree: DEGREE.MS, nationality: 'Saudi Arabia', studyLoadOverride: '', hasAccount: false },
    { id: 'r-3', studentId: '202233333', name: 'Aisha Khan', email: 'aisha.khan@kfupm.edu.sa', degree: DEGREE.PHD, nationality: 'Pakistan', studyLoadOverride: '', hasAccount: false },
    { id: 'r-4', studentId: '202344444', name: 'Li Wei', email: 'li.wei@kfupm.edu.sa', degree: DEGREE.MS, nationality: 'China', studyLoadOverride: '', hasAccount: false },
];