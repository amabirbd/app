import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Murmur } from '../types/types';
import { likeMurmur, unlikeMurmur } from '../api/api';

interface MurmurCardProps {
  murmur: Murmur;
  currentUserId: number | null;
  onLikeChange?: () => void;
  showDelete?: boolean;
  onDelete?: (id: number) => void;
}

export default function MurmurCard({
  murmur,
  currentUserId,
  onLikeChange,
  showDelete = false,
  onDelete,
}: MurmurCardProps) {
  const [likeCount, setLikeCount] = useState(murmur.likeCount);
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false); // For simplicity, track locally
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const handleLike = async () => {
    if (!currentUserId || isLiking) return;

    setIsLiking(true);
    try {
      if (hasLiked) {
        const response = await unlikeMurmur(murmur.id);
        setLikeCount(response.likeCount);
        setHasLiked(false);
      } else {
        const response = await likeMurmur(murmur.id);
        setLikeCount(response.likeCount);
        setHasLiked(true);
      }
      if (onLikeChange) {
        onLikeChange();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Failed to like/unlike murmur');
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (window.confirm('Are you sure you want to delete this murmur?')) {
      try {
        await onDelete(murmur.id);
      } catch (error) {
        console.error('Error deleting murmur:', error);
        alert('Failed to delete murmur');
      }
    }
  };

  const cardStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  };

  const authorLinkStyle: React.CSSProperties = {
    color: '#3498db',
    textDecoration: 'none',
    fontWeight: 'bold',
  };

  const textStyle: React.CSSProperties = {
    margin: '10px 0',
    lineHeight: '1.5',
  };

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '15px',
    paddingTop: '10px',
    borderTop: '1px solid #eee',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  };

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <div>
          {murmur.author ? (
            <Link
              to={`/user/${murmur.author.id}`}
              style={authorLinkStyle}
              onClick={(e) => e.stopPropagation()}
            >
              {murmur.author.name}
            </Link>
          ) : (
            <span style={{ fontWeight: 'bold' }}>Unknown User</span>
          )}
        </div>
        <span style={{ color: '#999', fontSize: '14px' }}>
          {formatDate(murmur.createdAt)}
        </span>
      </div>

      <div
        onClick={() => navigate(`/murmur/${murmur.id}`)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            navigate(`/murmur/${murmur.id}`);
          }
        }}
        style={{ ...textStyle, cursor: 'pointer' }}
      >
        {murmur.text}
      </div>

      <div style={footerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleLike}
            disabled={!currentUserId || isLiking}
            style={{
              ...buttonStyle,
              backgroundColor: hasLiked ? '#e74c3c' : '#3498db',
              color: 'white',
              opacity: !currentUserId || isLiking ? 0.6 : 1,
              cursor: !currentUserId || isLiking ? 'not-allowed' : 'pointer',
            }}
          >
            {isLiking ? '...' : hasLiked ? 'Unlike' : 'Like'} ({likeCount})
          </button>
          {showDelete && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              style={{
                ...buttonStyle,
                backgroundColor: '#e74c3c',
                color: 'white',
              }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

