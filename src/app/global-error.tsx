"use client";

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
        <div style={{ padding: '2rem', color: 'white', backgroundColor: 'black', height: '100vh', fontFamily: 'sans-serif' }}>
          <h2>Something went wrong!</h2>
          <p style={{ color: 'red', fontFamily: 'monospace', margin: '1rem 0', padding: '1rem', background: '#222', borderRadius: '4px' }}>
            {error.name}: {error.message}
          </p>
          <p style={{ fontSize: '12px', color: '#888', whiteSpace: 'pre-wrap' }}>
            {error.stack}
          </p>
          <button
            onClick={() => reset()}
            style={{ padding: '8px 16px', background: 'white', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' }}
          >
            Try again
          </button>
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                  }
                  alert('Service Workers Unregistered! Please refresh.');
                  window.location.reload();
                });
              }
            }}
            style={{ padding: '8px 16px', background: '#ff3333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem', marginLeft: '1rem' }}
          >
            Clear Cache & Reload
          </button>
        </div>
      </body>
    </html>
  );
}
