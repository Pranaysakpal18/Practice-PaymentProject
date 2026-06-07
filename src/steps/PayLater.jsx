import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCheckoutStore } from '../store/stepStore';
import { client } from '../api/client';
import CheckoutHeader from '../components/CheckoutHeader';
import { Landmark, Smartphone, ShieldCheck } from 'lucide-react';

const PAY_LATER_OPTIONS = [
  { id: 'simpl', name: 'Simpl PayLater', description: 'Pay consolidated bills once every 15 days' },
  { id: 'lazypay', name: 'LazyPay', description: 'Buy now, pay next month with zero interest' },
  { id: 'icici', name: 'ICICI Bank PayLater', description: 'Instant credit line up to 30 days' }
];

export default function PayLater() {
  const { sessionData, setCurrentStep, setPaymentStatus } = useCheckoutStore();
  const [selectedProvider, setSelectedProvider] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      registeredMobile: sessionData?.contact?.mobile || ''
    }
  });

  const handleProviderSelect = (providerId) => {
    setSelectedProvider(providerId);
    setApiError('');
  };

  const handlePayLater = async (data) => {
    if (!selectedProvider) {
      setApiError('Please select a PayLater provider to continue.');
      return;
    }

    setIsSubmitting(true);
    setApiError('');
    setCurrentStep('PROCESSING'); // Redirect to processing spinner screen

    try {
      const response = await client.post('/payment/pay', {
        sessionId: sessionData?.sessionId,
        method: 'PAY_LATER',
        providerId: selectedProvider,
        mobile: data.registeredMobile
      });

      setPaymentStatus(
        response.status,
        response.details,
        response.error
      );
    } catch (err) {
      setCurrentStep('PAY_LATER');
      setApiError(err.message || 'Failed to authenticate PayLater account. Try again.');
      setIsSubmitting(false);
    }
  };

  const formattedAmount = sessionData?.order?.amount
    ? `₹${sessionData.order.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : '₹2,500.00';

  return (
    <div className="step-container">
      <CheckoutHeader showBack onBack={() => setCurrentStep('PAYMENT_SELECTION')} />
      
      <h2>Buy Now, Pay Later</h2>
      <p className="step-subtitle">Select a micro-credit provider and link using your registered phone number.</p>

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

      <form onSubmit={handleSubmit(handlePayLater)} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          {PAY_LATER_OPTIONS.map((provider) => {
            const isSelected = selectedProvider === provider.id;
            return (
              <div
                key={provider.id}
                onClick={() => handleProviderSelect(provider.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.875rem 1.125rem',
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
                  <Landmark size={18} style={{ color: 'var(--primary)' }} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 650, color: 'var(--text-heading)', margin: 0 }}>
                    {provider.name}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    {provider.description}
                  </p>
                </div>
                <input
                  type="radio"
                  name="paylater"
                  checked={isSelected}
                  onChange={() => {}} // handled by click
                  style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
              </div>
            );
          })}
        </div>

        {/* Link input phone */}
        <div className="form-group">
          <label htmlFor="registeredMobile">Linked Mobile Number</label>
          <div className="input-wrapper">
            <input
              id="registeredMobile"
              type="tel"
              placeholder="+91 98765 43210"
              className={`form-control ${errors.registeredMobile ? 'is-invalid' : ''}`}
              style={{ paddingLeft: '2.5rem' }}
              {...register('registeredMobile', { required: 'Mobile number is required to link account' })}
            />
            <Smartphone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
          {errors.registeredMobile && <span className="error-message">{errors.registeredMobile.message}</span>}
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
            <span>Secure Credit Settlement</span>
          </div>
        </div>
      </form>
    </div>
  );
}
