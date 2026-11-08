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
import LandingPage from './pages/common/LandingPage';
import SignUpPage from './pages/common/SignUpPage';
import ActivatePage from './pages/common/ActivatePage';
import NotificationsPage from './pages/common/NotificationsPage';
import SettingsPage from './pages/common/SettingsPage';
import ForgotPasswordPage from './pages/common/ForgotPasswordPage';
import ResetPasswordPage from './pages/common/ResetPasswordPage';
import UserAccountsPage from './pages/admin/UserAccountsPage';
import AddUserPage from './pages/admin/AddUserPage';

const SHARED_PATHS = ['/settings', '/announcements', '/notifications'];

// Finished pages: each member adds a line  '/path': PageComponent
const PAGES = {
    // '/student/advisors': AdvisorDirectoryPage,
    '/admin/users': UserAccountsPage,
};

// Pages that are not in the sidebar (details pages), per role
const EXTRA_ROUTES = {
    // [ROLES.STUDENT]: [{ path: '/student/advisors/:id', element: <AdvisorPublicProfilePage /> }],
    [ROLES.ADMIN]: [{ path: '/admin/users/new', element: <AddUserPage /> }],
};

export default function AppRoutes() {
    const { currentUser } = useAuth();

    return (
        <Routes>
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/activate/:code" element={<ActivatePage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:code" element={<ResetPasswordPage />} />
            <Route path="/forbidden" element={<ForbiddenPage />} />
            <Route
                path="/"
                element={currentUser ? <Navigate to={HOME_BY_ROLE[currentUser.role]} replace /> : <LandingPage />}
            />

            {Object.values(ROLES).map((role) => (
                <Route key={role} element={<ProtectedRoute roles={[role]} />}>
                    <Route element={<AppLayout />}>
                        {NAV_BY_ROLE[role]
                            .filter((link) => !SHARED_PATHS.includes(link.to))
                            .map((link) => {
                                const Page = PAGES[link.to];
                                return (
                                    <Route
                                        key={link.to}
                                        path={link.to}
                                        element={Page ? <Page /> : <PlaceholderPage title={labelOf(link.label)} />}
                                    />
                                );
                            })}
                        {(EXTRA_ROUTES[role] ?? []).map((route) => (
                            <Route key={route.path} path={route.path} element={route.element} />
                        ))}
                    </Route>
                </Route>
            ))}

            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/announcements" element={<PlaceholderPage title="Announcements" />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}