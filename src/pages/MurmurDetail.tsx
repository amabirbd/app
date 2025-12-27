import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMurmurById, likeMurmur, unlikeMurmur } from '../api/api';
import { useAuth } from '../context/AuthContext';
import type { Murmur } from '../types/types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function MurmurDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [murmur, setMurmur] = useState<Murmur | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMurmur();
    }
  }, [id]);

  const fetchMurmur = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getMurmurById(parseInt(id, 10));
      setMurmur(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Murmur not found');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch murmur');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!murmur || !user || isLiking) return;

    setIsLiking(true);
    try {
      // For simplicity, we'll check if user already liked by trying to unlike first
      // In a real app, you'd track this properly
      const response = await likeMurmur(murmur.id);
      setMurmur({ ...murmur, likeCount: response.likeCount });
    } catch (err: any) {
      if (err.response?.status === 409) {
        // Already liked, try to unlike
        try {
          const response = await unlikeMurmur(murmur.id);
          setMurmur({ ...murmur, likeCount: response.likeCount });
        } catch (unlikeErr) {
          console.error('Error unliking:', unlikeErr);
          alert('Failed to unlike murmur');
        }
      } else {
        alert('Failed to like murmur');
      }
    } finally {
      setIsLiking(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const detailStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
  };

  const cardStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '30px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '2px solid #eee',
  };

  const linkStyle: React.CSSProperties = {
    color: '#3498db',
    textDecoration: 'none',
  };

  const textStyle: React.CSSProperties = {
    fontSize: '18px',
    lineHeight: '1.6',
    margin: '20px 0',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '20px',
  };

  return (
    <div style={detailStyle}>
      <Link to="/" style={linkStyle}>
        ← Back to Timeline
      </Link>

      {loading && <LoadingSpinner message="Loading murmur..." />}

      {error && <ErrorMessage error={error} />}

      {!loading && !error && murmur && (
        <div style={cardStyle}>
          <div style={headerStyle}>
            <h1 style={{ margin: '0 0 10px 0' }}>Murmur Details</h1>
            {murmur.author && (
              <p style={{ margin: 0, color: '#666' }}>
                By:{' '}
                <Link
                  to={`/user/${murmur.author.id}`}
                  style={linkStyle}
                >
                  {murmur.author.name}
                </Link>
              </p>
            )}
            <p style={{ margin: '5px 0 0 0', color: '#999', fontSize: '14px' }}>
              {formatDate(murmur.createdAt)}
            </p>
          </div>

          <div style={textStyle}>{murmur.text}</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              onClick={handleLike}
              disabled={!user || isLiking}
              style={{
                ...buttonStyle,
                opacity: !user || isLiking ? 0.6 : 1,
                cursor: !user || isLiking ? 'not-allowed' : 'pointer',
              }}
            >
              {isLiking ? 'Processing...' : `Like (${murmur.likeCount})`}
            </button>
            <span style={{ color: '#666' }}>
              {murmur.likeCount} {murmur.likeCount === 1 ? 'like' : 'likes'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

