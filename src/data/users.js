import { ROLES, ACCOUNT_STATUS } from './statusValues';

export const users = [
    { id: 'u-student-1', name: 'Sara Alharbi', email: 'student@kfupm.edu.sa', password: 'demo1234', role: ROLES.STUDENT, status: ACCOUNT_STATUS.ACTIVE },
    { id: 'u-advisor-1', name: 'Dr. Yahya Osais', email: 'advisor@kfupm.edu.sa', password: 'demo1234', role: ROLES.ADVISOR, status: ACCOUNT_STATUS.ACTIVE },
    { id: 'u-coord-1', name: 'Dr. Saajjad', email: 'coordinator@kfupm.edu.sa', password: 'demo1234', role: ROLES.COORDINATOR, status: ACCOUNT_STATUS.ACTIVE },
    { id: 'u-admin-1', name: 'System Admin', email: 'admin@kfupm.edu.sa', password: 'demo1234', role: ROLES.ADMIN, status: ACCOUNT_STATUS.ACTIVE },
    { id: 'u-dean-1', name: 'Dr. Abdullah Sultan', email: 'dean@kfupm.edu.sa', password: 'demo1234', role: ROLES.DEAN, status: ACCOUNT_STATUS.ACTIVE },
    { id: 'u-chair-1', name: 'Dr. Malak Baslyman', email: 'chairperson@kfupm.edu.sa', password: 'demo1234', role: ROLES.CHAIRPERSON, status: ACCOUNT_STATUS.ACTIVE },
    { id: 'u-chair-2', name: 'Dr. Mohammad Waleed Shinwari', email: 'chairperson1@kfupm.edu.sa', password: 'demo1234', role: ROLES.CHAIRPERSON, status: ACCOUNT_STATUS.ACTIVE },
    { id: 'u-chair-3', name: 'Dr. Yasser Almoghathawi', email: 'chairperson2@kfupm.edu.sa', password: 'demo1234', role: ROLES.CHAIRPERSON, status: ACCOUNT_STATUS.ACTIVE },
    { id: 'u-chair-3', name: 'Dr. Monther Alfuraidan', email: 'chairperson3@kfupm.edu.sa', password: 'demo1234', role: ROLES.CHAIRPERSON, status: ACCOUNT_STATUS.ACTIVE },
];