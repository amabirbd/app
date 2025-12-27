import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, followUser, unfollowUser, getFollowStatus } from '../api/api';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types/types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followingStatus, setFollowingStatus] = useState<Record<number, boolean>>({});
  const [followingLoading, setFollowingLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await getUsers();
      // Filter out current user
      const otherUsers = usersData.filter((u) => u.id !== currentUser?.id);
      setUsers(otherUsers);

      // Fetch follow status for each user
      const statusPromises = otherUsers.map(async (u) => {
        try {
          const status = await getFollowStatus(u.id);
          return { userId: u.id, isFollowing: status.isFollowing };
        } catch {
          return { userId: u.id, isFollowing: false };
        }
      });

      const statuses = await Promise.all(statusPromises);
      const statusMap: Record<number, boolean> = {};
      statuses.forEach((s) => {
        statusMap[s.userId] = s.isFollowing;
      });
      setFollowingStatus(statusMap);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: number) => {
    if (!currentUser || followingLoading[userId]) return;

    setFollowingLoading((prev) => ({ ...prev, [userId]: true }));

    try {
      const isCurrentlyFollowing = followingStatus[userId];
      if (isCurrentlyFollowing) {
        await unfollowUser(userId);
        setFollowingStatus((prev) => ({ ...prev, [userId]: false }));
      } else {
        await followUser(userId);
        setFollowingStatus((prev) => ({ ...prev, [userId]: true }));
      }
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
        'Failed to follow/unfollow user. Please try again.',
      );
    } finally {
      setFollowingLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading users..." />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={fetchUsers} />;
  }

  const containerStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
  };

  const userCardStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '15px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const userInfoStyle: React.CSSProperties = {
    flex: 1,
  };

  const userNameStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#333',
  };

  const userEmailStyle: React.CSSProperties = {
    color: '#666',
    fontSize: '14px',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    minWidth: '120px',
  };

  const followingButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#95a5a6',
  };

  return (
    <div style={containerStyle}>
      <h1>Discover Users</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Follow users to see their murmurs in your timeline
      </p>

      {users.length === 0 ? (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            color: '#999',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <h2>No other users found</h2>
          <p>Be the first to join!</p>
        </div>
      ) : (
        <div>
          {users.map((user) => {
            const isFollowing = followingStatus[user.id] || false;
            const isLoading = followingLoading[user.id] || false;

            return (
              <div key={user.id} style={userCardStyle}>
                <div style={userInfoStyle}>
                  <Link
                    to={`/user/${user.id}`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <div style={userNameStyle}>{user.name}</div>
                    <div style={userEmailStyle}>{user.email}</div>
                  </Link>
                </div>
                <button
                  onClick={() => handleFollow(user.id)}
                  disabled={isLoading}
                  style={isFollowing ? followingButtonStyle : buttonStyle}
                >
                  {isLoading
                    ? '...'
                    : isFollowing
                    ? '✓ Following'
                    : '+ Follow'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

