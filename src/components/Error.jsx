import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function Error({ message = 'An unexpected error occurred while loading your checkout session.', onRetry }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 2rem',
      textAlign: 'center',
      minHeight: '400px',
      gap: '1.25rem',
      animation: 'slideUpFade 0.4s ease'
    }}>
      <div style={{
        background: 'var(--danger-light)',
        color: 'var(--danger)',
        padding: '1rem',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <AlertCircle size={32} />
      </div>
      
      <div style={{ maxWidth: '400px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 650, color: 'var(--text-heading)', marginBottom: '0.5rem' }}>
          Unable to Load Checkout
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {message}
        </p>
      </div>

      {onRetry && (
        <button 
          onClick={onRetry} 
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RotateCcw size={16} />
          Try Reloading
        </button>
      )}
    </div>
  );
}
