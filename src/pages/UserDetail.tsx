import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getUserById,
  getMurmurs,
  followUser,
  unfollowUser,
  deleteMurmur,
  getFollowStatus,
} from '../api/api';
import { useAuth } from '../context/AuthContext';
import type { UserStats, Murmur } from '../types/types';
import MurmurCard from '../components/MurmurCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Pagination from '../components/Pagination';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<UserStats | null>(null);
  const [murmurs, setMurmurs] = useState<Murmur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [murmursLoading, setMurmursLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUserData();
    }
  }, [id]);

  useEffect(() => {
    if (id && user) {
      fetchUserMurmurs();
    }
  }, [id, currentPage, user]);

  const fetchUserData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const userData = await getUserById(parseInt(id, 10));
      setUser(userData);
      // Set follow status from response
      if (userData.isFollowing !== undefined) {
        setIsFollowing(userData.isFollowing);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('User not found');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMurmurs = async () => {
    if (!id) return;

    try {
      setMurmursLoading(true);
      // Fetch all murmurs and filter by userId on frontend
      // In a real app, you'd have a dedicated endpoint for user's murmurs
      const response = await getMurmurs(currentPage, 10);
      const userMurmurs = response.data.filter(
        (murmur) => murmur.userId === parseInt(id, 10),
      );
      setMurmurs(userMurmurs);
      // Calculate total pages based on filtered results
      // This is a simplified approach - ideally backend would handle this
      setTotalPages(Math.max(1, Math.ceil(userMurmurs.length / 10)));
    } catch (err) {
      console.error('Error fetching user murmurs:', err);
    } finally {
      setMurmursLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!id || !currentUser || isFollowingLoading) return;

    setIsFollowingLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(parseInt(id, 10));
        setIsFollowing(false);
        if (user) {
          setUser({ ...user, followersCount: user.followersCount - 1 });
        }
      } else {
        await followUser(parseInt(id, 10));
        setIsFollowing(true);
        if (user) {
          setUser({ ...user, followersCount: user.followersCount + 1 });
        }
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        setIsFollowing(true);
      } else {
        alert('Failed to follow/unfollow user');
      }
    } finally {
      setIsFollowingLoading(false);
    }
  };

  const handleDeleteMurmur = async (murmurId: number) => {
    try {
      await deleteMurmur(murmurId);
      setMurmurs(murmurs.filter((m) => m.id !== murmurId));
      if (user) {
        setUser({ ...user, murmursCount: user.murmursCount - 1 });
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        alert('You can only delete your own murmurs');
      } else {
        alert('Failed to delete murmur');
      }
      throw err;
    }
  };

  const handleLikeChange = () => {
    fetchUserMurmurs();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const isOwnProfile = currentUser && id && currentUser.id === parseInt(id, 10);

  const containerStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
  };

  const profileCardStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '30px',
    marginBottom: '30px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const statsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '30px',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
  };

  const statItemStyle: React.CSSProperties = {
    textAlign: 'center',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    backgroundColor: isFollowing ? '#e74c3c' : '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '20px',
  };

  if (loading) {
    return <LoadingSpinner message="Loading user profile..." />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!user) {
    return null;
  }

  return (
    <div style={containerStyle}>
      <Link to="/" style={{ color: '#3498db', textDecoration: 'none' }}>
        ← Back to Timeline
      </Link>

      <div style={profileCardStyle}>
        <h1 style={{ margin: '0 0 10px 0' }}>{user.name}</h1>
        {isOwnProfile && (
          <p style={{ margin: '5px 0', color: '#666' }}>{user.email}</p>
        )}

        <div style={statsStyle}>
          <div style={statItemStyle}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {user.followersCount}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Followers</div>
          </div>
          <div style={statItemStyle}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {user.followingCount}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Following</div>
          </div>
          <div style={statItemStyle}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {user.murmursCount}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Murmurs</div>
          </div>
        </div>

        {!isOwnProfile && currentUser && (
          <button
            onClick={handleFollow}
            disabled={isFollowingLoading}
            style={{
              ...buttonStyle,
              backgroundColor: isFollowing ? '#95a5a6' : '#3498db',
              opacity: isFollowingLoading ? 0.6 : 1,
              cursor: isFollowingLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              padding: '12px 24px',
            }}
          >
            {isFollowingLoading
              ? 'Processing...'
              : isFollowing
              ? '✓ Following'
              : '+ Follow'}
          </button>
        )}
      </div>

      <h2>Murmurs</h2>

      {murmursLoading && <LoadingSpinner message="Loading murmurs..." />}

      {!murmursLoading && murmurs.length === 0 && (
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
          <p>No murmurs yet.</p>
        </div>
      )}

              {!murmursLoading &&
        murmurs.map((murmur) => (
          <MurmurCard
            key={murmur.id}
            murmur={murmur}
            currentUserId={currentUser?.id || null}
            onLikeChange={handleLikeChange}
            showDelete={isOwnProfile || false}
            onDelete={isOwnProfile ? handleDeleteMurmur : undefined}
          />
        ))}

      {!murmursLoading && murmurs.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

