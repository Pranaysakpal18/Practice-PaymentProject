import React, { useState } from 'react';
import { useCheckoutStore } from '../store/stepStore';
import { client } from '../api/client';
import CheckoutHeader from '../components/CheckoutHeader';
import { Wallet as WalletIcon, ShieldCheck } from 'lucide-react';

const WALLET_OPTIONS = [
  { id: 'paytm', name: 'Paytm Wallet', description: 'Instant checkout using Paytm balance' },
  { id: 'phonepe', name: 'PhonePe Wallet', description: 'Fast payment via PhonePe' },
  { id: 'amazonpay', name: 'Amazon Pay', description: 'Pay using Amazon Pay balance' },
  { id: 'mobikwik', name: 'MobiKwik', description: 'SuperCash checkout options' }
];

export default function Wallet() {
  const { sessionData, setCurrentStep, setPaymentStatus } = useCheckoutStore();
  const [selectedWallet, setSelectedWallet] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleWalletSelect = (walletId) => {
    setSelectedWallet(walletId);
    setApiError('');
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!selectedWallet) {
      setApiError('Please select a wallet option to continue.');
      return;
    }

    setIsSubmitting(true);
    setApiError('');
    setCurrentStep('PROCESSING'); // Redirect to processing spinner screen

    try {
      const response = await client.post('/payment/pay', {
        sessionId: sessionData?.sessionId,
        method: 'WALLET',
        walletId: selectedWallet
      });

      setPaymentStatus(
        response.status,
        response.details,
        response.error
      );
    } catch (err) {
      setCurrentStep('WALLET');
      setApiError(err.message || 'Wallet transaction failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const formattedAmount = sessionData?.order?.amount
    ? `₹${sessionData.order.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : '₹2,500.00';

  return (
    <div className="step-container">
      <CheckoutHeader showBack onBack={() => setCurrentStep('PAYMENT_SELECTION')} />
      
      <h2>Digital Wallets</h2>
      <p className="step-subtitle">Select a digital wallet to authorize this checkout transaction.</p>

      {apiError && (
        <div style={{
          backgroundColor: 'var(--danger-light)',
          color: 'var(--danger)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8125rem',
          fontWeight: 500,
          marginBottom: '1.25rem',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          {apiError}
        </div>
      )}

      <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          marginBottom: '2rem'
        }}>
          {WALLET_OPTIONS.map((wallet) => {
            const isSelected = selectedWallet === wallet.id;
            return (
              <div
                key={wallet.id}
                onClick={() => handleWalletSelect(wallet.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--primary-light-bg)' : 'var(--bg-card)',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  background: isSelected ? '#fff' : 'var(--primary-light-bg)',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid transparent'
                }}>
                  <WalletIcon size={18} style={{ color: 'var(--primary)' }} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 650, color: 'var(--text-heading)', margin: 0 }}>
                    {wallet.name}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    {wallet.description}
                  </p>
                </div>
                <input
                  type="radio"
                  name="wallet"
                  checked={isSelected}
                  onChange={() => {}} // handled by parent div click
                  style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
              </div>
            );
          })}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary btn-block"
          style={{ marginTop: 'auto' }}
        >
          {isSubmitting ? <div className="spinner" /> : `Link & Pay ${formattedAmount}`}
        </button>

        {/* Footer Navigation */}
        <div className="step-nav-footer">
          <button type="button" onClick={() => setCurrentStep('PAYMENT_SELECTION')} className="back-btn">
            &larr; Back to Payment Selection
          </button>
          <div className="security-badge">
            <ShieldCheck size={12} style={{ color: 'var(--success)' }} />
            <span>Secure Wallet Redirection</span>
          </div>
        </div>
      </form>
    </div>
  );
}
