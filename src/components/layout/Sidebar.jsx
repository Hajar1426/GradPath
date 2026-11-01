import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { NAV_BY_ROLE, HOME_BY_ROLE, labelOf } from '../../utils/roles';

function initials(name) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('');
}

export default function Sidebar() {
    const { currentUser, signOut } = useAuth();
    const { unreadCount } = useNotifications();
    const navigate = useNavigate();
    const links = NAV_BY_ROLE[currentUser.role] ?? [];
    const profileLink = links.find((link) => link.to.endsWith('/profile'));
    const role = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);

    function handleSignOut() {
        signOut();
        navigate('/sign-in');
    }

    return (
        <nav className="sidebar" aria-label="Main navigation">
            <div className="sidebar__brand">Grad Path</div>

            {(() => {
                const content = (
                    <>
                        <span className="sidebar__avatar" aria-hidden="true">{initials(currentUser.name)}</span>
                        <span>
              <span className="sidebar__name">{currentUser.name}</span>
              <span className="sidebar__role">{role}</span>
            </span>
                    </>
                );
                return profileLink ? (
                    <NavLink
                        to={profileLink.to}
                        className={({ isActive }) => 'sidebar__user' + (isActive ? ' active' : '')}
                        aria-label={`${currentUser.name}, ${role}. View my profile`}
                    >
                        {content}
                    </NavLink>
                ) : (
                    <div className="sidebar__user">{content}</div>
                );
            })()}

            {links.filter((link) => !link.hidden).map((link) => (
                <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === HOME_BY_ROLE[currentUser.role]}
                    className={({ isActive }) => 'sidebar__link' + (isActive ? ' active' : '')}
                >
                    {labelOf(link.label)}
                    {link.to === '/notifications' && unreadCount > 0 && (
                        <span className="sidebar__count" aria-label={`${unreadCount} unread`}>
              {unreadCount}
            </span>
                    )}
                </NavLink>
            ))}

            <button type="button" className="sidebar__signout" onClick={handleSignOut}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9" />
                </svg>
                Sign out
            </button>
        </nav>
    );
}