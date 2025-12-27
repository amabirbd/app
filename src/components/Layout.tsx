import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const navStyle: React.CSSProperties = {
    backgroundColor: '#3498db',
    padding: '15px 20px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const linkStyle: React.CSSProperties = {
    color: 'white',
    textDecoration: 'none',
    margin: '0 15px',
    fontWeight: 'bold',
  };

  const userInfoStyle: React.CSSProperties = {
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  };

  return (
    <div>
      <nav style={navStyle}>
        <div>
          <Link to="/" style={linkStyle}>
            Timeline
          </Link>
          <Link to="/users" style={linkStyle}>
            Discover Users
          </Link>
        </div>
        <div style={userInfoStyle}>
          {user ? (
            <>
              <span>
                Logged in as: <strong>{user.name}</strong>
              </span>
              <Link
                to={`/user/${user.id}`}
                style={{ ...linkStyle, textDecoration: 'underline' }}
              >
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/signin" style={linkStyle}>
              Sign In
            </Link>
          )}
        </div>
      </nav>
      <main style={{ padding: '0 20px' }}>{children}</main>
    </div>
  );
}

