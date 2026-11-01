import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import Button from '../common/Button';

export default function Topbar() {
    const { currentUser, signOut } = useAuth();
    const { unreadCount } = useNotifications();
    const navigate = useNavigate();

    function handleSignOut() {
        signOut();
        navigate('/sign-in');
    }

    return (
        <header className="topbar">
            <Link
                className="topbar__bell"
                to="/notifications"
                aria-label={`Notifications, ${unreadCount} unread`}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4" />
                </svg>
                {unreadCount > 0 && <span className="topbar__count">{unreadCount}</span>}
            </Link>
            <span className="topbar__user">
        {currentUser.name} · {currentUser.role}
      </span>
            <Button variant="ghost" onClick={handleSignOut}>
                Sign out
            </Button>
        </header>
    );
}