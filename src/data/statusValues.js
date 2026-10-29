export const ROLES = {
    STUDENT: 'student',
    ADVISOR: 'advisor',
    COORDINATOR: 'coordinator',
    ADMIN: 'admin',
};

export const ACCOUNT_STATUS = {
    ACTIVE: 'active',
    PENDING: 'pending',
    DISABLED: 'disabled',
};

export const AVAILABILITY = {
    AVAILABLE: 'available',
    LIMITED: 'limited',
    UNAVAILABLE: 'unavailable',
};

export const PLAN_STATUS = {
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    CHANGES_REQUESTED: 'changes_requested',
    APPROVED: 'approved',
};

export const AUTHORIZATION_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
};

export const REPORT_STATUS = {
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    EVALUATED: 'evaluated',
};

export const REPORT_RATING = {
    SATISFACTORY: 'satisfactory',
    NEEDS_IMPROVEMENT: 'needs_improvement',
    UNSATISFACTORY: 'unsatisfactory',
};

export const ALERT_SEVERITY = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high' };
export const ALERT_STATUS = { OPEN: 'open', IN_PROGRESS: 'in_progress', RESOLVED: 'resolved' };

export const PUBLISH_STATUS = { DRAFT: 'draft', PUBLISHED: 'published', ARCHIVED: 'archived' };

export const IMPORT_ROW_STATUS = {
    NEW: 'new',
    UPDATED: 'updated',
    DUPLICATE: 'duplicate',
    INVALID: 'invalid',
};