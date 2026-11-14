import { users } from './users';
import { notifications } from './notifications';
import { studentRoster } from './roster';
import { announcements } from './announcements';
import { resources } from './resources';
import { imports } from './imports';
import { attentionItems } from './attentionItems';
import { offerings } from './offerings';
import { capacityOverrides } from './capacityOverrides';
import { advisors } from './advisors';
import { students } from './students';
import { courseAuthorizations } from './courseAuthorizations';
import { courses } from './courses';

const copy = (list) => list.map((item) => ({ ...item }));

export function getInitialData() {
    return {
        users: copy(users),
        notifications: copy(notifications),
        studentRoster: copy(studentRoster),
        auditEvents: [],
        // Member 4
        announcements: copy(announcements),
        resources: copy(resources),
        imports: copy(imports),
        attentionItems: copy(attentionItems),
        offerings: copy(offerings),
        capacityOverrides: copy(capacityOverrides),
        // Temporary demo data until Members 2 and 3 merge their own files
        advisors: copy(advisors),
        students: copy(students),
        courseAuthorizations: copy(courseAuthorizations),
        //Member 3
        courses: copy(courses),
    };
}
