import { DEGREE } from './statusValues';

// The approved student list (in the real system it comes from the coordinator's Excel upload).
// hasAccount is true once the student has signed up.
export const studentRoster = [
    { id: 'r-1', studentId: '202011111', name: 'Sara Alharbi', email: 'student@kfupm.edu.sa', degree: DEGREE.PHD, nationality: 'Saudi Arabia', studyLoadOverride: '', hasAccount: true },
    { id: 'r-2', studentId: '202122222', name: 'Omar Alqahtani', email: 'omar.alqahtani@kfupm.edu.sa', degree: DEGREE.MS, nationality: 'Saudi Arabia', studyLoadOverride: '', hasAccount: false },
    { id: 'r-3', studentId: '202233333', name: 'Aisha Khan', email: 'aisha.khan@kfupm.edu.sa', degree: DEGREE.PHD, nationality: 'Pakistan', studyLoadOverride: '', hasAccount: false },
    { id: 'r-4', studentId: '202344444', name: 'Li Wei', email: 'li.wei@kfupm.edu.sa', degree: DEGREE.MS, nationality: 'China', studyLoadOverride: '', hasAccount: false },
    { id: 'r-5', studentId: '202355512', name: 'Faris Alghamdi', email: 'faris.alghamdi@kfupm.edu.sa', degree: DEGREE.MS, nationality: 'Egypt', studyLoadOverride: '', hasAccount: true },
    { id: 'r-6', studentId: '202244421', name: 'Noura Alshehri', email: 'noura.alshehri@kfupm.edu.sa', degree: DEGREE.MS, nationality: 'Saudi Arabia', studyLoadOverride: '', hasAccount: true },
    { id: 'r-7', studentId: '202366631', name: 'Ahmed Khan', email: 'ahmed.khan@kfupm.edu.sa', degree: DEGREE.MS, nationality: 'Pakistan', studyLoadOverride: '', hasAccount: true },
    { id: 'r-8', studentId: '202133345', name: 'Rana Alghamdi', email: 'rana.alghamdi@kfupm.edu.sa', degree: DEGREE.PHD, nationality: 'Saudi Arabia', studyLoadOverride: '', hasAccount: true },
    { id: 'r-9', studentId: '202377712', name: 'Yousef Alharthi', email: 'yousef.alharthi@kfupm.edu.sa', degree: DEGREE.MS, nationality: 'Saudi Arabia', studyLoadOverride: '', hasAccount: true },
    { id: 'r-10', studentId: '202288854', name: 'Mariam Hassan', email: 'mariam.hassan@kfupm.edu.sa', degree: DEGREE.MS, nationality: 'Sudan', studyLoadOverride: '', hasAccount: true },
    { id: 'r-11', studentId: '202399913', name: 'Khalid Alotaibi', email: 'khalid.alotaibi@kfupm.edu.sa', degree: DEGREE.MS, nationality: 'Saudi Arabia', studyLoadOverride: '', hasAccount: true },
    { id: 'r-12', studentId: '202111176', name: 'Huda Rahman', email: 'huda.rahman@kfupm.edu.sa', degree: DEGREE.PHD, nationality: 'India', studyLoadOverride: '', hasAccount: true },
    { id: 'r-13', studentId: '202322287', name: 'Abdullah Alqahtani', email: 'abdullah.alqahtani@kfupm.edu.sa', degree: DEGREE.MS, nationality: 'Saudi Arabia', studyLoadOverride: '', hasAccount: true },
    { id: 'r-14', studentId: '202344490', name: 'Lina Haddad', email: 'lina.haddad@kfupm.edu.sa', degree: DEGREE.MS, nationality: 'Jordan', studyLoadOverride: '', hasAccount: true },
];