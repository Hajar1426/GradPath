import { AVAILABILITY } from '../data/statusValues';

export const LIMITED_AT = 4;
// Default number of advisee slots, used when an advisor has no valid capacity.
export const ADVISEE_SLOTS = LIMITED_AT + 1;

// An advisor's capacity. Missing or invalid values (null, '', 0, 'abc') use the default.
export function capacityOf(advisor) {
    const n = Number(advisor?.capacity);
    return Number.isInteger(n) && n >= 1 ? n : ADVISEE_SLOTS;
}

// Full when every slot is used, Limited when one slot is left, otherwise Available.
export function computeAutoAvailability(assignedCount, capacity = ADVISEE_SLOTS) {
    if (assignedCount >= capacity) return AVAILABILITY.UNAVAILABLE;
    if (assignedCount >= Math.max(1, capacity - 1)) return AVAILABILITY.LIMITED;
    return AVAILABILITY.AVAILABLE;
}

// Shared with Member 2 (advisor directory). Keep the two inputs agreed in the team guide.
// A coordinator override always wins.
export function computeAvailability(advisor, assignedCount) {
    if (advisor?.coordinatorOverride) return advisor.coordinatorOverride.value;
    return computeAutoAvailability(assignedCount, capacityOf(advisor));
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