import { AVAILABILITY } from '../data/statusValues';

// Agreed with Member 2: returns AVAILABILITY.AVAILABLE, LIMITED or UNAVAILABLE.
// A coordinator override always wins. Otherwise: fewer than 4 students is green, exactly 4 is yellow, more is red.
export const LIMITED_AT = 4;
// An advisor has this many advisee slots. Full (red) when all are used.
export const ADVISEE_SLOTS = LIMITED_AT + 1;

export function computeAutoAvailability(assignedCount) {
    if (assignedCount < LIMITED_AT) return AVAILABILITY.AVAILABLE;
    if (assignedCount === LIMITED_AT) return AVAILABILITY.LIMITED;
    return AVAILABILITY.UNAVAILABLE;
}

export function computeAvailability(advisor, assignedCount) {
    if (advisor?.coordinatorOverride) return advisor.coordinatorOverride.value;
    return computeAutoAvailability(assignedCount);
}

// Written label to show next to the color (color is never the only signal).
export const AVAILABILITY_LABEL = {
    [AVAILABILITY.AVAILABLE]: 'Available',
    [AVAILABILITY.LIMITED]: 'Limited availability',
    [AVAILABILITY.UNAVAILABLE]: 'Unavailable',
};

// How many students each advisor has, from data.students ({ userId, advisorId }).
export function countAssigned(students, advisorId) {
    return (students ?? []).filter((s) => s.advisorId === advisorId).length;
}
