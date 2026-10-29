import { ROLES, ACCOUNT_STATUS } from './statusValues';

export const users = [
    { id: 'u-student-1', name: 'Sara Alharbi', email: 'student@kfupm.edu.sa', password: 'demo1234', role: ROLES.STUDENT, status: ACCOUNT_STATUS.ACTIVE },
    { id: 'u-advisor-1', name: 'Dr. Yahya Osais', email: 'advisor@kfupm.edu.sa', password: 'demo1234', role: ROLES.ADVISOR, status: ACCOUNT_STATUS.ACTIVE },
    { id: 'u-coord-1', name: 'Dr. Saajjad', email: 'coordinator@kfupm.edu.sa', password: 'demo1234', role: ROLES.COORDINATOR, status: ACCOUNT_STATUS.ACTIVE },
    { id: 'u-admin-1', name: 'System Admin', email: 'admin@kfupm.edu.sa', password: 'demo1234', role: ROLES.ADMIN, status: ACCOUNT_STATUS.ACTIVE },
];