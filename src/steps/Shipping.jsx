import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCheckoutStore } from '../store/stepStore';
import { client } from '../api/client';
import CheckoutHeader from '../components/CheckoutHeader';
import { Shield } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function Shipping() {
  const { sessionData, setCurrentStep, updateCheckoutState } = useCheckoutStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const { t } = useTranslation();
  
  const billingAddress = sessionData?.billingAddress || {};
  const savedShippingAddress = sessionData?.shippingAddress || {};

  // Check if same billing/shipping is enabled or previously active
  const [sameAsBilling, setSameAsBilling] = useState(
    savedShippingAddress.isSameAsBilling !== false
  );

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      fullName: savedShippingAddress.fullName || billingAddress.fullName || '',
      addressLine1: savedShippingAddress.addressLine1 || billingAddress.addressLine1 || '',
      addressLine2: savedShippingAddress.addressLine2 || billingAddress.addressLine2 || '',
      city: savedShippingAddress.city || billingAddress.city || '',
      state: savedShippingAddress.state || billingAddress.state || '',
      pincode: savedShippingAddress.pincode || billingAddress.pincode || '',
      country: savedShippingAddress.country || billingAddress.country || 'India'
    }
  });

  // If sameAsBilling is toggled, auto-sync values from billing
  useEffect(() => {
    if (sameAsBilling && billingAddress.fullName) {
      setValue('fullName', billingAddress.fullName);
      setValue('addressLine1', billingAddress.addressLine1);
      setValue('addressLine2', billingAddress.addressLine2 || '');
      setValue('city', billingAddress.city);
      setValue('state', billingAddress.state);
      setValue('pincode', billingAddress.pincode);
      setValue('country', billingAddress.country || 'India');
    }
  }, [sameAsBilling, billingAddress, setValue]);

  const onSubmitShipping = async (data) => {
    setIsSubmitting(true);
    setApiError('');

    const payload = sameAsBilling 
      ? { ...billingAddress, isSameAsBilling: true } 
      : { ...data, isSameAsBilling: false };

    try {
      await client.post('/checkout/sessions/shipping', payload);
      
      // Update store
      updateCheckoutState({
        sessionData: {
          ...sessionData,
          shippingAddress: payload
        }
      });

      // Advance step to Payment Selection
      setCurrentStep('PAYMENT_SELECTION');
    } catch (err) {
      setApiError(err.message || 'Failed to save shipping address. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="step-container">
      <CheckoutHeader showBack onBack={() => setCurrentStep('BILLING')} />
      
      <h2>{t('shipping_title')}</h2>
      <p className="step-subtitle">{t('shipping_subtitle')}</p>

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

      <form onSubmit={handleSubmit(onSubmitShipping)} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        
        {/* Same as Billing Checkbox */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          background: 'var(--primary-light-bg)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
          border: '1px solid var(--border-color)',
          cursor: 'pointer'
        }}
        onClick={() => setSameAsBilling(!sameAsBilling)}
        >
          <input
            type="checkbox"
            id="sameBilling"
            checked={sameAsBilling}
            onChange={() => {}} // handled by parent div click
            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
          />
          <label htmlFor="sameBilling" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-heading)', cursor: 'pointer', margin: 0 }}>
            {t('same_as_billing')}
          </label>
        </div>

        {/* Dynamic Form Area */}
        {!sameAsBilling && (
          <div style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '0.25rem', marginBottom: '1.25rem', animation: 'slideUpFade 0.3s ease' }}>
            
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="fullName">{t('full_name')}</label>
              <input
                id="fullName"
                type="text"
                placeholder="John Doe"
                className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                {...register('fullName', { required: t('fullname_required') })}
              />
              {errors.fullName && <span className="error-message">{errors.fullName.message}</span>}
            </div>

            {/* Address Line 1 */}
            <div className="form-group">
              <label htmlFor="addressLine1">{t('address_line1')}</label>
              <input
                id="addressLine1"
                type="text"
                placeholder="123, Main Road"
                className={`form-control ${errors.addressLine1 ? 'is-invalid' : ''}`}
                {...register('addressLine1', { required: t('address1_required') })}
              />
              {errors.addressLine1 && <span className="error-message">{errors.addressLine1.message}</span>}
            </div>

            {/* Address Line 2 */}
            <div className="form-group">
              <label htmlFor="addressLine2">{t('address_line2')} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>({t('optional')})</span></label>
              <input
                id="addressLine2"
                type="text"
                placeholder="Near Metro Station"
                className="form-control"
                {...register('addressLine2')}
              />
            </div>

            {/* Grid: City & State */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label htmlFor="city">{t('city')}</label>
                <input
                  id="city"
                  type="text"
                  placeholder="Bengaluru"
                  className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                  {...register('city', { required: t('city_required') })}
                />
                {errors.city && <span className="error-message">{errors.city.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="state">{t('state')}</label>
                <input
                  id="state"
                  type="text"
                  placeholder="Karnataka"
                  className={`form-control ${errors.state ? 'is-invalid' : ''}`}
                  {...register('state', { required: t('state_required') })}
                />
                {errors.state && <span className="error-message">{errors.state.message}</span>}
              </div>
            </div>

            {/* Grid: Pin & Country */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label htmlFor="pincode">{t('pincode')}</label>
                <input
                  id="pincode"
                  type="text"
                  placeholder="560001"
                  className={`form-control ${errors.pincode ? 'is-invalid' : ''}`}
                  {...register('pincode', { 
                    required: t('pincode_required'),
                    pattern: {
                      value: /^\d{5,6}$/,
                      message: t('pincode_pattern')
                    }
                  })}
                />
                {errors.pincode && <span className="error-message">{errors.pincode.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="country">{t('country')}</label>
                <select
                  id="country"
                  className="form-control"
                  {...register('country')}
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="UAE">UAE</option>
                </select>
              </div>
            </div>

          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary btn-block"
          style={{ marginTop: 'auto' }}
        >
          {isSubmitting ? <div className="spinner" /> : t('continue_payment')}
        </button>

        {/* Footer Navigation */}
        <div className="step-nav-footer">
          <button type="button" onClick={() => setCurrentStep('BILLING')} className="back-btn">
            &larr; {t('back_to_billing')}
          </button>
          <div className="security-badge">
            <Shield size={12} style={{ color: 'var(--success)' }} />
            <span>{t('encryption_badge')}</span>
          </div>
        </div>
      </form>
    </div>
  );
}
