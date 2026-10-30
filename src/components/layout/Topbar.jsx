import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Topbar() {
    const { currentUser, signOut } = useAuth();
    const navigate = useNavigate();

    function handleSignOut() {
        signOut();
        navigate('/sign-in');
    }

    return (
        <header className="topbar">
      <span className="topbar__user">
        {currentUser.name} · {currentUser.role}
      </span>
            <button className="btn btn--ghost" onClick={handleSignOut}>
                Sign out
            </button>
        </header>
    );
}