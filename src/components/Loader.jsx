import React from 'react';

export default function Loader({ fullScreen = false, message = 'Loading...' }) {
  if (fullScreen) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-app)',
        color: 'var(--text-main)',
        gap: '1rem'
      }}>
        <div style={{
          width: '3.5rem',
          height: '3.5rem',
          border: '4px solid var(--border-color)',
          borderRadius: '50%',
          borderTopColor: 'var(--primary)',
          animation: 'spin 1s cubic-bezier(0.53, 0.21, 0.29, 0.67) infinite'
        }} />
        <p style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{message}</p>
      </div>
    );
  }

  // standard small/inline loader
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      gap: '0.75rem',
      flexDirection: 'column'
    }}>
      <div style={{
        width: '2rem',
        height: '2rem',
        border: '3px solid var(--border-color)',
        borderRadius: '50%',
        borderTopColor: 'var(--primary)',
        animation: 'spin 1s cubic-bezier(0.53, 0.21, 0.29, 0.67) infinite'
      }} />
      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{message}</span>
    </div>
  );
}
