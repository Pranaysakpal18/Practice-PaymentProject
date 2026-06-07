import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCheckoutStore } from '../store/stepStore';
import { client } from '../api/client';
import CheckoutHeader from '../components/CheckoutHeader';
import { MapPin, Shield } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function Billing() {
  const { sessionData, setCurrentStep, updateCheckoutState } = useCheckoutStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const { t } = useTranslation();

  const savedAddress = sessionData?.billingAddress || {};

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: savedAddress.fullName || '',
      addressLine1: savedAddress.addressLine1 || '',
      addressLine2: savedAddress.addressLine2 || '',
      city: savedAddress.city || '',
      state: savedAddress.state || '',
      pincode: savedAddress.pincode || '',
      country: savedAddress.country || 'India',
      gstNumber: savedAddress.gstNumber || ''
    }
  });

  const onSubmitBilling = async (data) => {
    setIsSubmitting(true);
    setApiError('');

    try {
      await client.post('/checkout/sessions/billing', data);
      
      // Update store
      updateCheckoutState({
        sessionData: {
          ...sessionData,
          billingAddress: data
        }
      });

      // Advance step
      setCurrentStep('SHIPPING');
    } catch (err) {
      setApiError(err.message || 'Failed to save billing address. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="step-container">
      <CheckoutHeader showBack onBack={() => setCurrentStep('OTP')} />
      
      <h2>{t('billing_title')}</h2>
      <p className="step-subtitle">{t('billing_subtitle')}</p>

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

      <form onSubmit={handleSubmit(onSubmitBilling)} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '0.25rem', marginBottom: '1.25rem' }}>
          
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

          {/* GST */}
          <div className="form-group">
            <label htmlFor="gstNumber">{t('gst_number')} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>({t('optional')})</span></label>
            <input
              id="gstNumber"
              type="text"
              placeholder="22AAAAA0000A1Z5"
              className={`form-control ${errors.gstNumber ? 'is-invalid' : ''}`}
              {...register('gstNumber', {
                pattern: {
                  value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                  message: t('gst_pattern')
                }
              })}
            />
            {errors.gstNumber && <span className="error-message">{errors.gstNumber.message}</span>}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary btn-block"
        >
          {isSubmitting ? <div className="spinner" /> : t('continue_shipping')}
        </button>

        {/* Footer Navigation */}
        <div className="step-nav-footer">
          <button type="button" onClick={() => setCurrentStep('OTP')} className="back-btn">
            &larr; {t('back_to_otp')}
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
