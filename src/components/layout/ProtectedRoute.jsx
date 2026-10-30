import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({ roles }) {
    const { currentUser } = useAuth();
    const location = useLocation();

    if (!currentUser) {
        return <Navigate to="/sign-in" replace state={{ from: location }} />;
    }
    if (roles && !roles.includes(currentUser.role)) {
        return <Navigate to="/forbidden" replace />;
    }
    return <Outlet />;
}