import React, { useState, useEffect, useRef } from 'react';
import { useCheckoutStore } from '../store/stepStore';
import { client } from '../api/client';
import CheckoutHeader from '../components/CheckoutHeader';
import { Shield } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function OTP() {
  const { sessionData, setCurrentStep } = useCheckoutStore();
  const mobileNumber = sessionData?.contact?.mobile || '+91 98765 43210';
  const { t } = useTranslation();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  
  const inputRefs = useRef([]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Tick Resend OTP timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timerId = setTimeout(() => {
      setResendTimer(resendTimer - 1);
    }, 1000);
    return () => clearTimeout(timerId);
  }, [resendTimer]);

  // Handle individual digit input changes
  const handleChange = (index, value) => {
    // Only accept numeric inputs
    if (value !== '' && !/^[0-9]$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setApiError('');

    // Auto-advance to next input field if typing a digit
    if (value !== '' && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspaces & retreats
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      
      // If current is empty, delete previous and focus it
      if (otp[index] === '' && index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        if (inputRefs.current[index - 1]) {
          inputRefs.current[index - 1].focus();
        }
      } else {
        // Just clear current
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  // Handle OTP pasting
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
    if (pastedData.length === 6) {
      const pastedArray = pastedData.split('');
      setOtp(pastedArray);
      inputRefs.current[5].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const completeOtp = otp.join('');
    
    if (completeOtp.length !== 6) {
      setApiError(t('otp_required'));
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      await client.post('/checkout/sessions/verify-otp', {
        otp: completeOtp
      });
      // OTP verified successfully, transition to Billing
      setCurrentStep('BILLING');
    } catch (err) {
      setApiError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    
    setResendTimer(30);
    setOtp(['', '', '', '', '', '']);
    setApiError('');
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    // Simulate API call for resending OTP
    console.log('OTP resent successfully to', mobileNumber);
  };

  return (
    <div className="step-container">
      <CheckoutHeader showBack onBack={() => setCurrentStep('CONTACT')} />
      
      <h2>{t('otp_title')}</h2>
      <p className="step-subtitle">
        {t('otp_subtitle_prefix')}<strong style={{ color: 'var(--text-heading)' }}>{mobileNumber}</strong>{t('otp_subtitle_suffix')}{' '}
        <button 
          onClick={() => setCurrentStep('CONTACT')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: 0,
            fontSize: 'inherit',
            fontWeight: 550
          }}
        >
          {t('change_number')}
        </button>
      </p>

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

      <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        
        {/* OTP Input Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '0.5rem',
          margin: '1.5rem 0',
          justifyContent: 'center'
        }}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              style={{
                width: '100%',
                height: '3.25rem',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                textAlign: 'center',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-heading)',
                outline: 'none',
                transition: 'all 0.2s',
                boxShadow: 'var(--shadow-sm)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 3px var(--primary-light-bg)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-color)';
                e.target.style.boxShadow = 'var(--shadow-sm)';
              }}
            />
          ))}
        </div>

        {/* Resend Helper */}
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center' }}>
          {resendTimer > 0 ? (
            <span>{t('resend_timer')}<strong style={{ color: 'var(--text-heading)', fontFamily: 'monospace' }}>00:{resendTimer.toString().padStart(2, '0')}</strong></span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 650,
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
                fontSize: 'inherit'
              }}
            >
              {t('resend_btn')}
            </button>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary btn-block"
        >
          {isSubmitting ? <div className="spinner" /> : t('verify_otp_btn')}
        </button>

        {/* Footer Navigation */}
        <div className="step-nav-footer">
          <button type="button" onClick={() => setCurrentStep('CONTACT')} className="back-btn">
            &larr; {t('back_to_contact')}
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
