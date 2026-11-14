
import { AVAILABILITY } from '../data/statusValues';

// Default number of advisee slots.
export const ADVISEE_SLOTS = 5;

// An advisor's capacity. Missing or invalid values use the default.
export function capacityOf(advisor) {
    const n = Number(advisor?.capacity);
    return Number.isInteger(n) && n >= 1 ? n : ADVISEE_SLOTS;
}

// Limited from 75% of capacity, Unavailable at 100%.
export function computeAutoAvailability(assignedCount, capacity = ADVISEE_SLOTS) {
    const ratio = assignedCount / capacity;

    if (ratio >= 1) return AVAILABILITY.UNAVAILABLE;
    if (ratio >= 0.75) return AVAILABILITY.LIMITED;

    return AVAILABILITY.AVAILABLE;
}

// Shared with Member 2 (advisor directory).
// A coordinator override always wins.
export function computeAvailability(advisor, assignedCount) {
    if (advisor?.coordinatorOverride) {
        return advisor.coordinatorOverride.value;
    }

    return computeAutoAvailability(assignedCount, capacityOf(advisor));
}

// Written label to show next to the color.
export const AVAILABILITY_LABEL = {
    [AVAILABILITY.AVAILABLE]: 'Available',
    [AVAILABILITY.LIMITED]: 'Limited availability',
    [AVAILABILITY.UNAVAILABLE]: 'Unavailable',
};

// How many students each advisor has, from data.students ({ userId, advisorId }).
export function countAssigned(students, advisorId) {
    return (students ?? []).filter(
        (s) => s.advisorId === advisorId
    ).length;
}
