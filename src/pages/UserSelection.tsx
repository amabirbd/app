import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, createUser } from '../api/api';
import type { User } from '../types/types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function UserSelection() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId: number) => {
    localStorage.setItem('currentUserId', userId.toString());
    navigate('/');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Name is required');
      return;
    }

    if (!formData.email.trim()) {
      setFormError('Email is required');
      return;
    }

    if (!formData.email.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }

    try {
      setRegistering(true);
      const newUser = await createUser(formData.name.trim(), formData.email.trim());
      localStorage.setItem('currentUserId', newUser.id.toString());
      navigate('/');
    } catch (err: any) {
      if (err.response?.status === 409) {
        setFormError('Email already registered');
      } else {
        setFormError(err.response?.data?.message?.[0] || 'Failed to create user');
      }
    } finally {
      setRegistering(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '40px',
  };

  const userListStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px',
    marginTop: '20px',
  };

  const userCardStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    cursor: 'pointer',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
  };

  const formStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    boxSizing: 'border-box' as const,
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    width: '100%',
  };

  return (
    <div style={containerStyle}>
      <h1>Select or Register a User</h1>

      <section style={sectionStyle}>
        <h2>Existing Users</h2>
        {loading && <LoadingSpinner message="Loading users..." />}
        {error && <ErrorMessage error={error} onRetry={fetchUsers} />}
        {!loading && !error && (
          <>
            {users.length === 0 ? (
              <p style={{ color: '#999', fontStyle: 'italic' }}>
                No users found. Please register a new user below.
              </p>
            ) : (
              <div style={userListStyle}>
                {users.map((user) => (
                  <div
                    key={user.id}
                    style={userCardStyle}
                    onClick={() => handleUserSelect(user.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }}
                  >
                    <h3 style={{ margin: '0 0 5px 0' }}>{user.name}</h3>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                      {user.email}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <section style={sectionStyle}>
        <h2>Register New User</h2>
        <form style={formStyle} onSubmit={handleRegister}>
          {formError && (
            <div
              style={{
                padding: '10px',
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                borderRadius: '4px',
                color: '#c33',
                marginBottom: '15px',
              }}
            >
              {formError}
            </div>
          )}
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={inputStyle}
            disabled={registering}
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            style={inputStyle}
            disabled={registering}
          />
          <button
            type="submit"
            disabled={registering}
            style={{
              ...buttonStyle,
              opacity: registering ? 0.6 : 1,
              cursor: registering ? 'not-allowed' : 'pointer',
            }}
          >
            {registering ? 'Registering...' : 'Register'}
          </button>
        </form>
      </section>
    </div>
  );
}

