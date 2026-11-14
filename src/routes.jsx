import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ROLES } from './data/statusValues';
import { NAV_BY_ROLE, HOME_BY_ROLE, labelOf, BASE_ROLES, ROLES_WITH_ACCESS } from './utils/roles';
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
import AuditLogPage from './pages/admin/AuditLogPage';
import SecuritySettingsPage from './pages/admin/SecuritySettingsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
// Member 4
import CoordinatorDashboardPage from './pages/coordinator/CoordinatorDashboardPage';
import AdvisorCapacityPage from './pages/coordinator/AdvisorCapacityPage';
import RecordImportPage from './pages/coordinator/RecordImportPage';
import ImportResultPage from './pages/coordinator/ImportResultPage';
import StudentListPage from './pages/coordinator/StudentListPage';
import StatisticsPage from './pages/coordinator/StatisticsPage';
import CoursesSchedulePage from './pages/coordinator/CoursesSchedulePage';
import OfferingEditorPage from './pages/coordinator/OfferingEditorPage';
import AnnouncementsManagePage from './pages/coordinator/AnnouncementsManagePage';
import AnnouncementEditorPage from './pages/coordinator/AnnouncementEditorPage';
import ResourcesManagePage from './pages/coordinator/ResourcesManagePage';
import AnnouncementsPage from './pages/common/AnnouncementsPage';
import CourseResourcesPage from './pages/student/CourseResourcesPage';
import AdvisorDirectoryPage from './pages/student/AdvisorDirectoryPage';
// Member 2
import AdvisorProfilePage from './pages/student/AdvisorProfilePage';


const SHARED_PATHS = ['/settings', '/announcements', '/notifications'];

// Finished pages: each member adds a line  '/path': PageComponent
const PAGES = {
    // Member 2
    '/student/advisors': AdvisorDirectoryPage,
    '/admin/users': UserAccountsPage,
    '/admin/audit': AuditLogPage,
    '/admin/security': SecuritySettingsPage,
    '/admin': AdminDashboardPage,
    // Member 4
    '/coordinator': CoordinatorDashboardPage,
    '/coordinator/capacity': AdvisorCapacityPage,
    '/coordinator/students': StudentListPage,
    '/coordinator/import': RecordImportPage,
    '/coordinator/offerings': CoursesSchedulePage,
    '/coordinator/statistics': StatisticsPage,
    '/coordinator/announcements': AnnouncementsManagePage,
    '/coordinator/resources': ResourcesManagePage,
    '/student/resources': CourseResourcesPage,
};

// Pages that are not in the sidebar (details pages), per role
const EXTRA_ROUTES = {
    // Member 2
    [ROLES.STUDENT]: [{ path: '/student/advisors/:id', element: <AdvisorProfilePage /> }],
    [ROLES.ADMIN]: [{ path: '/admin/users/new', element: <AddUserPage /> }],
    // Member 4 (dean and chairperson get these too, in view-only mode)
    [ROLES.COORDINATOR]: [
        { path: '/coordinator/import/result', element: <ImportResultPage /> },
        // Requests now live in a tab of Courses & Schedule. Keep the old address working.
        { path: '/coordinator/requests', element: <Navigate to="/coordinator/offerings?tab=requests" replace /> },
        { path: '/coordinator/offerings/:id', element: <OfferingEditorPage /> },
        { path: '/coordinator/announcements/:id', element: <AnnouncementEditorPage /> },
    ],
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

            {BASE_ROLES.map((role) => (
                <Route key={role} element={<ProtectedRoute roles={ROLES_WITH_ACCESS[role]} />}>
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
                    <Route path="/announcements" element={<AnnouncementsPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}