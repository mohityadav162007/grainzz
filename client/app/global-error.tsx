'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#fafafa', padding: '20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111', marginBottom: '16px' }}>Critical Application Error</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>A fatal error occurred. We have logged this issue.</p>
          <button 
            onClick={() => reset()}
            style={{ padding: '12px 24px', backgroundColor: '#1d5e20', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
