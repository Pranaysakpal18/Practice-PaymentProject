import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCheckoutStore } from '../store/stepStore';
import { client } from '../api/client';
import CheckoutHeader from '../components/CheckoutHeader';
import { Mail, Phone, Shield } from 'lucide-react';
import { MODAL_TYPES } from '../components/ModalRoot';
import { useTranslation } from '../hooks/useTranslation';

export default function Contact() {
  const { sessionData, setCurrentStep, updateCheckoutState, openModal } = useCheckoutStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const { t } = useTranslation();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      countryCode: '+91',
      mobile: sessionData?.contact?.mobile || '',
      email: sessionData?.contact?.email || ''
    }
  });

  const onSubmitContact = async (data) => {
    setIsSubmitting(true);
    setApiError('');
    try {
      const fullMobile = `${data.countryCode}${data.mobile}`;
      await client.post('/checkout/sessions/contact', {
        mobile: fullMobile,
        email: data.email
      });
      
      // Update store
      updateCheckoutState({
        sessionData: {
          ...sessionData,
          contact: {
            mobile: fullMobile,
            email: data.email
          }
        }
      });

      // Move to OTP step
      setCurrentStep('OTP');
    } catch (err) {
      setApiError(err.message || 'Failed to submit contact info. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToMerchant = () => {
    if (window.confirm(t('cancel_confirm'))) {
      window.location.href = sessionData?.merchant?.termsUrl || 'https://google.com';
    }
  };

  return (
    <div className="step-container">
      <CheckoutHeader />
      
      <h2>{t('contact_title')}</h2>
      <p className="step-subtitle">{t('contact_subtitle')}</p>
      
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

      <form onSubmit={handleSubmit(onSubmitContact)} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* Mobile Input Group */}
        <div className="form-group">
          <label htmlFor="mobile">{t('mobile_label')}</label>
          <div className="input-wrapper" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.5rem' }}>
            <select
              {...register('countryCode')}
              className="form-control"
              style={{ paddingRight: '0.5rem', textAlign: 'center' }}
            >
              <option value="+91">+91 (IN)</option>
              <option value="+1">+1 (US)</option>
              <option value="+44">+44 (UK)</option>
              <option value="+971">+971 (AE)</option>
            </select>
            <div style={{ position: 'relative' }}>
              <input
                id="mobile"
                type="tel"
                placeholder="98765 43210"
                className={`form-control ${errors.mobile ? 'is-invalid' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                {...register('mobile', {
                  required: t('mobile_required'),
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: t('mobile_pattern')
                  }
                })}
              />
              <Phone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>
          {errors.mobile && <span className="error-message">{errors.mobile.message}</span>}
        </div>

        {/* Email Input Group */}
        <div className="form-group">
          <label htmlFor="email">{t('email_label')} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>({t('optional')})</span></label>
          <div className="input-wrapper">
            <input
              id="email"
              type="email"
              placeholder="abcde@gmail.com"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              style={{ paddingLeft: '2.5rem' }}
              {...register('email', {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('email_pattern')
                }
              })}
            />
            <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
          {errors.email && <span className="error-message">{errors.email.message}</span>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary btn-block"
          style={{ marginTop: '1.25rem' }}
        >
          {isSubmitting ? <div className="spinner" /> : t('btn_continue')}
        </button>

        <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center', lineHeight: 1.4 }}>
          {t('agree_terms_policy_prefix')}
          <button type="button" onClick={() => openModal(MODAL_TYPES.TERMS)} style={{ border: 'none', background: 'none', padding: 0, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>{t('terms_conditions')}</button>
          {t('agree_terms_policy_and')}
          <button type="button" onClick={() => openModal(MODAL_TYPES.PRIVACY)} style={{ border: 'none', background: 'none', padding: 0, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>{t('privacy_policy')}</button>.
        </p>

        {/* Footer Navigation */}
        <div className="step-nav-footer">
          <button type="button" onClick={handleBackToMerchant} className="back-btn">
            &larr; {t('back_to_merchant')}
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
