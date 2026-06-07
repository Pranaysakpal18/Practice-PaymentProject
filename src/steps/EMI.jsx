import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCheckoutStore } from '../store/stepStore';
import { client } from '../api/client';
import CheckoutHeader from '../components/CheckoutHeader';
import { CalendarRange, CreditCard, ShieldCheck } from 'lucide-react';

const EMI_PLANS = [
  { id: 'sbi-3', bank: 'SBI Credit Card', duration: '3 Months', rate: '13.5%', monthly: 852.00, totalInterest: 56.00 },
  { id: 'hdfc-6', bank: 'HDFC Credit Card', duration: '6 Months', rate: '14.0%', monthly: 433.00, totalInterest: 98.00 },
  { id: 'icici-9', bank: 'ICICI Credit Card', duration: '9 Months', rate: '14.5%', monthly: 295.00, totalInterest: 155.00 }
];

export default function EMI() {
  const { sessionData, setCurrentStep, setPaymentStatus } = useCheckoutStore();
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      cardNumber: '',
      expiry: '',
      cvv: ''
    }
  });

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    setApiError('');
  };

  const handlePayEMI = async (data) => {
    if (!selectedPlan) {
      setApiError('Please choose an installment plan option to continue.');
      return;
    }

    setIsSubmitting(true);
    setApiError('');
    setCurrentStep('PROCESSING'); // Redirect to processing spinner screen

    try {
      const activePlan = EMI_PLANS.find(p => p.id === selectedPlan);
      const response = await client.post('/payment/pay', {
        sessionId: sessionData?.sessionId,
        method: 'EMI',
        plan: activePlan,
        cardNumber: data.cardNumber.replace(/\D/g, '')
      });

      setPaymentStatus(
        response.status,
        response.details,
        response.error
      );
    } catch (err) {
      setCurrentStep('EMI');
      setApiError(err.message || 'EMI installment creation aborted. Please try again.');
      setIsSubmitting(false);
    }
  };

  const formattedAmount = sessionData?.order?.amount
    ? `₹${sessionData.order.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : '₹2,500.00';

  return (
    <div className="step-container">
      <CheckoutHeader showBack onBack={() => setCurrentStep('PAYMENT_SELECTION')} />
      
      <h2>EMI / Easy Installments</h2>
      <p className="step-subtitle">Select an installment plan and input credit card info to authorize.</p>

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

      <form onSubmit={handleSubmit(handlePayEMI)} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ maxHeight: '320px', overflowY: 'auto', paddingRight: '0.25rem', marginBottom: '1.25rem' }}>
          
          <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.75rem', textAlign: 'left' }}>
            Choose an Installment Plan
          </h4>

          {/* EMI Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {EMI_PLANS.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => handlePlanSelect(plan.id)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.875rem 1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--primary-light-bg)' : 'var(--bg-card)',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                    transition: 'all 0.2s'
                  }}
                >
                  <CalendarRange size={20} style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 650, color: 'var(--text-heading)' }}>
                      {plan.duration} at ₹{plan.monthly}/mo
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {plan.bank} • Interest Rate: {plan.rate} p.a.
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="emiPlan"
                    checked={isSelected}
                    onChange={() => {}} // handled by click
                    style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                </div>
              );
            })}
          </div>

          <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.75rem', textAlign: 'left' }}>
            Card Authorization Details
          </h4>

          {/* Card Inputs */}
          <div className="form-group">
            <label htmlFor="cardNumber">Credit Card Number</label>
            <input
              id="cardNumber"
              type="text"
              placeholder="4111 1111 1111 1111"
              className={`form-control ${errors.cardNumber ? 'is-invalid' : ''}`}
              {...register('cardNumber', { required: 'Card number is required' })}
            />
            {errors.cardNumber && <span className="error-message">{errors.cardNumber.message}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label htmlFor="expiry">Expiry</label>
              <input
                id="expiry"
                type="text"
                placeholder="MM/YY"
                className={`form-control ${errors.expiry ? 'is-invalid' : ''}`}
                {...register('expiry', { required: 'Expiry MM/YY is required' })}
              />
              {errors.expiry && <span className="error-message">{errors.expiry.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cvv">CVV</label>
              <input
                id="cvv"
                type="password"
                placeholder="•••"
                className={`form-control ${errors.cvv ? 'is-invalid' : ''}`}
                {...register('cvv', { required: 'CVV code is required' })}
              />
              {errors.cvv && <span className="error-message">{errors.cvv.message}</span>}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary btn-block"
        >
          {isSubmitting ? <div className="spinner" /> : `Authorize EMI Pay`}
        </button>

        {/* Footer Navigation */}
        <div className="step-nav-footer">
          <button type="button" onClick={() => setCurrentStep('PAYMENT_SELECTION')} className="back-btn">
            &larr; Back to Payment Selection
          </button>
          <div className="security-badge">
            <ShieldCheck size={12} style={{ color: 'var(--success)' }} />
            <span>Secure Installment Redirection</span>
          </div>
        </div>
      </form>
    </div>
  );
}
