import { PUBLISH_STATUS } from './statusValues';

// Owned by Member 4. type is the category. course is a course code or 'Common'.
// url is a website (https://...), a file in public/ (/resources/...), or an uploaded file (data: URL).
export const RESOURCE_TYPES = [
    { value: 'guide', label: 'Guides' },
    { value: 'template', label: 'Templates' },
    { value: 'form', label: 'Forms' },
    { value: 'link', label: 'Links' },
];

export const resources = [
    { id: 'res-1', title: 'New Student Orientation Guide', fileName: 'graduate-handbook.pdf', type: 'guide', course: 'Common', url: '/resources/graduate-handbook.pdf', description: 'Rules for graduate study, milestones and deadlines.', status: PUBLISH_STATUS.PUBLISHED, uploadedBy: 'u-coord-1', updatedAt: '2026-09-01T10:00:00' },
    { id: 'res-2', title: 'Thesis proposal template', fileName: 'thesis-proposal-template.txt', type: 'template', course: 'Common', url: '/resources/thesis-proposal-template.txt', description: 'Sections expected in a thesis proposal.', status: PUBLISH_STATUS.PUBLISHED, uploadedBy: 'u-coord-1', updatedAt: '2026-09-15T10:00:00' },
    { id: 'res-3', title: 'ICS 553 reading list', type: 'link', course: 'ICS 553', url: 'https://www.kfupm.edu.sa', description: 'Papers discussed in the course.', status: PUBLISH_STATUS.PUBLISHED, uploadedBy: 'u-coord-1', updatedAt: '2026-10-02T10:00:00' },
    { id: 'res-4', title: 'SWE 530 project guidelines', fileName: 'swe530-project-guidelines.txt', type: 'guide', course: 'SWE 530', url: '/resources/swe530-project-guidelines.txt', description: 'Team project rules and grading.', status: PUBLISH_STATUS.DRAFT, uploadedBy: 'u-coord-1', updatedAt: '2026-11-05T10:00:00' },
];
