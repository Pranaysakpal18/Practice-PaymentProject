import React, { useState } from 'react';
import { useCheckoutStore } from '../store/stepStore';
import { CheckCircle, XCircle, Clock, ArrowRight, Download, RefreshCw } from 'lucide-react';

export default function Result() {
  const { 
    sessionData, 
    paymentStatus, 
    paymentError, 
    transactionDetails, 
    setCurrentStep, 
    updateCheckoutState,
    resetStore 
  } = useCheckoutStore();

  const [checkingStatus, setCheckingStatus] = useState(false);

  const handleReturn = () => {
    if (window.confirm('Redirecting you back to the merchant page...')) {
      window.location.href = sessionData?.merchant?.termsUrl || 'https://google.com';
    }
  };

  const handleRetry = () => {
    // Take user back to payment instrument list to retry
    setCurrentStep('PAYMENT_SELECTION');
    updateCheckoutState({ paymentStatus: null, paymentError: null, transactionDetails: null });
  };

  const handleDownloadReceipt = () => {
    alert('Receipt PDF download triggered successfully!\nTransaction ID: ' + (transactionDetails?.transactionId || 'N/A'));
  };

  const handleCheckStatus = () => {
    setCheckingStatus(true);
    // Simulate query checking and transitioning to Success after 1.5 seconds!
    setTimeout(() => {
      setCheckingStatus(false);
      updateCheckoutState({
        paymentStatus: 'SUCCESS',
        paymentError: null,
        transactionDetails: {
          ...transactionDetails,
          date: new Date().toLocaleString()
        }
      });
    }, 1500);
  };

  const amountStr = transactionDetails?.amount
    ? `₹${transactionDetails.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : '₹2,500.00';

  // 1. SUCCESS VIEW
  if (paymentStatus === 'SUCCESS') {
    return (
      <div className="step-container" style={{ textAlign: 'center', alignItems: 'center', justifyContent: 'center', minHeight: '450px', padding: '1rem 0' }}>
        
        {/* Draw green circle check */}
        <div style={{
          background: '#ecfdf5',
          color: '#10b981',
          padding: '1.25rem',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.15)',
          animation: 'scaleUpCheck 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <CheckCircle size={48} />
        </div>

        <h2 style={{ color: '#10b981', fontSize: '1.5rem', marginBottom: '0.375rem' }}>Payment Successful!</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.75rem', maxWidth: '320px', marginInline: 'auto' }}>
          Your secure digital checkout transaction has completed successfully.
        </p>

        {/* Detailed Receipt info box */}
        <div style={{
          background: 'var(--bg-app)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          width: '100%',
          maxWidth: '380px',
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>Order ID:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-heading)', textAlign: 'right' }}>{sessionData?.order?.id || 'ORD123456789'}</span>
            
            <span>Transaction ID:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-heading)', textAlign: 'right', fontFamily: 'monospace' }}>{transactionDetails?.transactionId || 'TXN1992019'}</span>
            
            <span>Amount Paid:</span>
            <span style={{ fontWeight: 750, color: 'var(--primary)', textAlign: 'right', fontSize: '0.875rem' }}>{amountStr}</span>
            
            <span>Payment Method:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-heading)', textAlign: 'right' }}>{transactionDetails?.method || 'Card'}</span>
            
            <span>Date &amp; Time:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-heading)', textAlign: 'right' }}>{transactionDetails?.date || '24 May 2026, 11:30 AM'}</span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '380px' }}>
          <button onClick={handleReturn} className="btn btn-primary btn-block">
            Back to Merchant &larr;
          </button>
          
          <button 
            onClick={handleDownloadReceipt}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: 650,
              fontSize: '0.8125rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '0.5rem'
            }}
          >
            <Download size={14} />
            <span>Download PDF Receipt</span>
          </button>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes scaleUpCheck {
            from { transform: scale(0.6); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}} />
      </div>
    );
  }

  // 2. FAILURE VIEW
  if (paymentStatus === 'FAILURE') {
    return (
      <div className="step-container" style={{ textAlign: 'center', alignItems: 'center', justifyContent: 'center', minHeight: '450px', padding: '1rem 0' }}>
        
        {/* Draw red shake cancel circle */}
        <div style={{
          background: 'var(--danger-light)',
          color: 'var(--danger)',
          padding: '1.25rem',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.15)',
          animation: 'shakeCircle 0.5s ease'
        }}>
          <XCircle size={48} />
        </div>

        <h2 style={{ color: 'var(--danger)', fontSize: '1.5rem', marginBottom: '0.375rem' }}>Payment Failed</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.75rem', maxWidth: '320px', marginInline: 'auto' }}>
          {paymentError || 'Unfortunately, your payment could not be processed.'}
        </p>

        {/* Detailed Receipt info box */}
        <div style={{
          background: 'var(--bg-app)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          width: '100%',
          maxWidth: '380px',
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>Order ID:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-heading)', textAlign: 'right' }}>{sessionData?.order?.id || 'ORD123456789'}</span>
            
            <span>Transaction ID:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-heading)', textAlign: 'right', fontFamily: 'monospace' }}>{transactionDetails?.transactionId || 'TXN1992019'}</span>
            
            <span>Amount attempted:</span>
            <span style={{ fontWeight: 750, color: 'var(--danger)', textAlign: 'right', fontSize: '0.875rem' }}>{amountStr}</span>
            
            <span>Declined Reason:</span>
            <span style={{ fontWeight: 650, color: 'var(--danger)', textAlign: 'right' }}>{paymentError || 'Bank authentication aborted'}</span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '380px' }}>
          <button onClick={handleRetry} className="btn btn-primary btn-block">
            Try Again &rarr;
          </button>
          
          <button onClick={handleReturn} className="btn btn-secondary btn-block">
            Back to Merchant &larr;
          </button>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes shakeCircle {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-6px); }
            40%, 80% { transform: translateX(6px); }
          }
        `}} />
      </div>
    );
  }

  // 3. PENDING VIEW
  return (
    <div className="step-container" style={{ textAlign: 'center', alignItems: 'center', justifyContent: 'center', minHeight: '450px', padding: '1rem 0' }}>
      
      {/* Draw orange pulsing clock circle */}
      <div style={{
        background: 'var(--pending-light)',
        color: 'var(--pending)',
        padding: '1.25rem',
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.25rem',
        boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.15)',
        animation: 'pulseTimer 1.5s infinite ease-in-out'
      }}>
        <Clock size={48} />
      </div>

      <h2 style={{ color: 'var(--pending)', fontSize: '1.5rem', marginBottom: '0.375rem' }}>Payment Pending</h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.75rem', maxWidth: '320px', marginInline: 'auto' }}>
        We are waiting for final settlement confirmation from your bank issuer. This usually takes a few minutes.
      </p>

      {/* Detailed Receipt info box */}
      <div style={{
        background: 'var(--bg-app)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        width: '100%',
        maxWidth: '380px',
        marginBottom: '2rem',
        textAlign: 'left'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <span>Order ID:</span>
          <span style={{ fontWeight: 600, color: 'var(--text-heading)', textAlign: 'right' }}>{sessionData?.order?.id || 'ORD123456789'}</span>
          
          <span>Transaction ID:</span>
          <span style={{ fontWeight: 600, color: 'var(--text-heading)', textAlign: 'right', fontFamily: 'monospace' }}>{transactionDetails?.transactionId || 'TXN1992019'}</span>
          
          <span>Pending Amount:</span>
          <span style={{ fontWeight: 750, color: 'var(--pending)', textAlign: 'right', fontSize: '0.875rem' }}>{amountStr}</span>
          
          <span>Payment Instrument:</span>
          <span style={{ fontWeight: 600, color: 'var(--text-heading)', textAlign: 'right' }}>{transactionDetails?.method || 'Netbanking'}</span>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '380px' }}>
        <button 
          onClick={handleCheckStatus} 
          disabled={checkingStatus}
          className="btn btn-primary btn-block"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          {checkingStatus ? (
            <RefreshCw size={16} className="spin-fast" style={{ animation: 'spin 0.8s linear infinite' }} />
          ) : (
            <RefreshCw size={16} />
          )}
          <span>{checkingStatus ? 'Verifying...' : 'Check Status Again'}</span>
        </button>
        
        <button onClick={handleReturn} className="btn btn-secondary btn-block">
          Back to Merchant &larr;
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulseTimer {
          0% { transform: scale(1); box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.15); }
          50% { transform: scale(1.06); box-shadow: 0 10px 20px 0px rgba(249, 115, 22, 0.3); }
          100% { transform: scale(1); box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.15); }
        }
      `}} />
    </div>
  );
}
