import { useAuth } from './hooks/useAuth';
import { users } from './data/users';

export default function App() {
  const { currentUser, signIn, signOut } = useAuth();

  return (
      <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
        <h1>GradPath</h1>
        {currentUser ? (
            <>
              <p>
                Signed in as {currentUser.name} ({currentUser.role})
              </p>
              <button onClick={signOut}>Sign out</button>
            </>
        ) : (
            <>
              <p>Temporary test sign in. Click a role:</p>
              {users.map((u) => (
                  <button
                      key={u.id}
                      onClick={() => signIn(u.email, u.password)}
                      style={{ marginRight: 8 }}
                  >
                    {u.role}
                  </button>
              ))}
            </>
        )}
      </main>
  );
}