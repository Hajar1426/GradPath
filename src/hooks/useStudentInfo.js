import { useData } from './useData';
import { useAuth } from './useAuth';
import { getStudyLoad, getMinCourses } from '../utils/studyRules';

// useStudentInfo() gives the signed-in student's info. useStudentInfo(user) gives it for any user.
// Returns null when the user is not on the student list.
export function useStudentInfo(user) {
    const { data } = useData();
    const { currentUser } = useAuth();
    const target = user ?? currentUser;
    const email = target?.email?.toLowerCase();
    const row = (data.studentRoster ?? []).find((r) => r.email.toLowerCase() === email);
    if (!row) return null;
    return { ...row, studyLoad: getStudyLoad(row), minCourses: getMinCourses(row) };
}