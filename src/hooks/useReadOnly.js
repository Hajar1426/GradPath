import { useAuth } from './useAuth';
import { VIEW_ONLY_ROLES } from '../utils/roles';

// True when the signed-in user may look at pages but not change anything.
export function useReadOnly() {
    const { currentUser } = useAuth();
    return VIEW_ONLY_ROLES.includes(currentUser?.role);
}