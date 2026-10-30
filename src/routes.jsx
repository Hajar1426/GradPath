import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ROLES } from './data/statusValues';
import { NAV_BY_ROLE, HOME_BY_ROLE, labelOf } from './utils/roles';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import PlaceholderPage from './pages/common/PlaceholderPage';
import SignInPage from './pages/common/SignInPage';
import ForbiddenPage from './pages/common/ForbiddenPage';
import NotFoundPage from './pages/common/NotFoundPage';

const SHARED_PATHS = ['/settings', '/announcements'];

export default function AppRoutes() {
    const { currentUser } = useAuth();

    return (
        <Routes>
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/forbidden" element={<ForbiddenPage />} />
            <Route
                path="/"
                element={<Navigate to={currentUser ? HOME_BY_ROLE[currentUser.role] : '/sign-in'} replace />}
            />

            {Object.values(ROLES).map((role) => (
                <Route key={role} element={<ProtectedRoute roles={[role]} />}>
                    <Route element={<AppLayout />}>
                        {NAV_BY_ROLE[role]
                            .filter((link) => !SHARED_PATHS.includes(link.to))
                            .map((link) => (
                                <Route
                                    key={link.to}
                                    path={link.to}
                                    element={<PlaceholderPage title={labelOf(link.label)} />}
                                />
                            ))}
                    </Route>
                </Route>
            ))}

            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
                    <Route path="/announcements" element={<PlaceholderPage title="Announcements" />} />
                </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}