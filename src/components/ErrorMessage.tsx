interface ErrorMessageProps {
  error: string | Error;
  onRetry?: () => void;
}

export default function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div
      style={{
        padding: '15px',
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '4px',
        color: '#c33',
        margin: '20px 0',
      }}
    >
      <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Error:</p>
      <p style={{ margin: 0 }}>{errorMessage}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}

