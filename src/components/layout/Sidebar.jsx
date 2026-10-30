import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NAV_BY_ROLE, HOME_BY_ROLE, labelOf } from '../../utils/roles';

export default function Sidebar() {
    const { currentUser } = useAuth();
    const links = NAV_BY_ROLE[currentUser.role] ?? [];

    return (
        <nav className="sidebar" aria-label="Main navigation">
            <div className="sidebar__brand">Grad Path</div>
            {links.map((link) => (
                <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === HOME_BY_ROLE[currentUser.role]}
                    className={({ isActive }) => 'sidebar__link' + (isActive ? ' active' : '')}
                >
                    {labelOf(link.label)}
                </NavLink>
            ))}
        </nav>
    );
}