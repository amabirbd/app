import { useState, useEffect } from 'react';
import { getTimeline, createMurmur } from '../api/api';
import { useAuth } from '../context/AuthContext';
import type { Murmur, PaginatedResponse } from '../types/types';
import MurmurCard from '../components/MurmurCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Pagination from '../components/Pagination';

export default function Timeline() {
  const [timeline, setTimeline] = useState<PaginatedResponse<Murmur> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [newMurmurText, setNewMurmurText] = useState('');
  const [creatingMurmur, setCreatingMurmur] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTimeline();
    }
  }, [user, currentPage]);

  const fetchTimeline = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getTimeline(currentPage, 10);
      setTimeline(data);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message 
        ? Array.isArray(err.response.data.message) 
          ? err.response.data.message.join(', ')
          : err.response.data.message
        : err instanceof Error 
          ? err.message 
          : 'Failed to fetch timeline';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeChange = () => {
    fetchTimeline();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateMurmur = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMurmurText.trim() || creatingMurmur) return;

    try {
      setCreatingMurmur(true);
      await createMurmur(newMurmurText.trim());
      setNewMurmurText('');
      // Refresh timeline to show the new murmur
      await fetchTimeline();
      // Reset to first page to see the new murmur
      setCurrentPage(1);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message 
        ? Array.isArray(err.response.data.message) 
          ? err.response.data.message.join(', ')
          : err.response.data.message
        : 'Failed to create murmur';
      alert(errorMessage);
    } finally {
      setCreatingMurmur(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>Timeline</h1>

      {/* Create Murmur Form */}
      <form
        onSubmit={handleCreateMurmur}
        style={{
          marginBottom: '30px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '15px' }}>Create a Murmur</h2>
        <textarea
          value={newMurmurText}
          onChange={(e) => setNewMurmurText(e.target.value)}
          placeholder="What's on your mind?"
          rows={4}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
            fontFamily: 'inherit',
            resize: 'vertical' as const,
            boxSizing: 'border-box' as const,
            marginBottom: '10px',
          }}
          disabled={creatingMurmur}
        />
        <button
          type="submit"
          disabled={!newMurmurText.trim() || creatingMurmur}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: creatingMurmur || !newMurmurText.trim() ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            opacity: creatingMurmur || !newMurmurText.trim() ? 0.6 : 1,
          }}
        >
          {creatingMurmur ? 'Posting...' : 'Post Murmur'}
        </button>
      </form>

      {loading && <LoadingSpinner message="Loading timeline..." />}

      {error && <ErrorMessage error={error} onRetry={fetchTimeline} />}

      {!loading && !error && timeline && (
        <>
          {timeline.data.length === 0 ? (
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
              <h2>No murmurs yet</h2>
              <p>Follow some users to see their murmurs in your timeline!</p>
            </div>
          ) : (
            <>
              {timeline.data.map((murmur) => (
                <MurmurCard
                  key={murmur.id}
                  murmur={murmur}
                  currentUserId={user.id}
                  onLikeChange={handleLikeChange}
                />
              ))}
              <Pagination
                currentPage={currentPage}
                totalPages={timeline.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

