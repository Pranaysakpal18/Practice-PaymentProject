import React, { useState } from 'react';
import { useCheckoutStore } from '../store/stepStore';
import { client } from '../api/client';
import CheckoutHeader from '../components/CheckoutHeader';
import { Landmark, ShieldCheck } from 'lucide-react';

const POPULAR_BANKS = [
  { id: 'sbi', name: 'State Bank of India', short: 'SBI' },
  { id: 'hdfc', name: 'HDFC Bank', short: 'HDFC' },
  { id: 'icici', name: 'ICICI Bank', short: 'ICICI' },
  { id: 'axis', name: 'Axis Bank', short: 'AXIS' },
  { id: 'kotak', name: 'Kotak Bank (Declines)', short: 'KOTAK' },
  { id: 'yes', name: 'Yes Bank (Pending)', short: 'YES' }
];

const ALL_OTHER_BANKS = [
  { id: 'bob', name: 'Bank of Baroda' },
  { id: 'boi', name: 'Bank of India' },
  { id: 'canara', name: 'Canara Bank' },
  { id: 'pnb', name: 'Punjab National Bank' },
  { id: 'union', name: 'Union Bank of India' },
  { id: 'idbi', name: 'IDBI Bank' },
  { id: 'indusind', name: 'IndusInd Bank' }
];

export default function Netbanking() {
  const { sessionData, setCurrentStep, setPaymentStatus } = useCheckoutStore();
  const [selectedBank, setSelectedBank] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleBankSelect = (bankId) => {
    setSelectedBank(bankId);
    setApiError('');
  };

  const handleDropdownChange = (e) => {
    setSelectedBank(e.target.value);
    setApiError('');
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!selectedBank) {
      setApiError('Please select a bank to proceed with the payment.');
      return;
    }

    setIsSubmitting(true);
    setApiError('');
    setCurrentStep('PROCESSING'); // switch to dynamic spinner loading screen

    try {
      // Kotak bank simulates standard declined transaction
      // Yes bank simulates pending transaction
      let testBankVal = selectedBank;
      if (selectedBank === 'kotak') testBankVal = 'fail';
      if (selectedBank === 'yes') testBankVal = 'pending';

      const response = await client.post('/payment/pay', {
        sessionId: sessionData?.sessionId,
        method: 'NETBANKING',
        bankId: testBankVal
      });

      setPaymentStatus(
        response.status,
        response.details,
        response.error
      );
    } catch (err) {
      setCurrentStep('NETBANKING');
      setApiError(err.message || 'Netbanking redirection failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const formattedAmount = sessionData?.order?.amount
    ? `₹${sessionData.order.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : '₹2,500.00';

  return (
    <div className="step-container">
      <CheckoutHeader showBack onBack={() => setCurrentStep('PAYMENT_SELECTION')} />
      
      <h2>Internet Banking</h2>
      <p className="step-subtitle">Select your retail bank and authenticate securely.</p>

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
        <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.75rem', textAlign: 'left' }}>
          Popular Banks
        </h4>

        {/* Popular Banks Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          {POPULAR_BANKS.map((bank) => {
            const isSelected = selectedBank === bank.id;
            return (
              <button
                key={bank.id}
                type="button"
                onClick={() => handleBankSelect(bank.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.875rem 0.5rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'var(--primary-light-bg)' : 'var(--bg-card)',
                  color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  gap: '0.375rem',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.backgroundColor = 'var(--primary-light-bg)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                  }
                }}
              >
                <Landmark size={18} style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }} />
                <span>{bank.short}</span>
              </button>
            );
          })}
        </div>

        {/* All Other Banks Dropdown */}
        <div className="form-group">
          <label htmlFor="otherBanks">Or select another bank</label>
          <select
            id="otherBanks"
            className="form-control"
            value={ALL_OTHER_BANKS.some(b => b.id === selectedBank) ? selectedBank : ''}
            onChange={handleDropdownChange}
          >
            <option value="">-- Choose from other options --</option>
            {ALL_OTHER_BANKS.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>

        <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textAlign: 'left', marginBottom: '1.5rem', lineHeight: 1.4 }}>
          💡 Testing hint: Selecting **Kotak** bank triggers a failed payment transaction; choosing **Yes Bank** simulates pending; select others for immediate success!
        </p>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary btn-block"
          style={{ marginTop: 'auto' }}
        >
          {isSubmitting ? <div className="spinner" /> : `Pay ${formattedAmount}`}
        </button>

        {/* Footer Navigation */}
        <div className="step-nav-footer">
          <button type="button" onClick={() => setCurrentStep('PAYMENT_SELECTION')} className="back-btn">
            &larr; Back to Payment Selection
          </button>
          <div className="security-badge">
            <ShieldCheck size={12} style={{ color: 'var(--success)' }} />
            <span>Secure NB Routing</span>
          </div>
        </div>
      </form>
    </div>
  );
}
