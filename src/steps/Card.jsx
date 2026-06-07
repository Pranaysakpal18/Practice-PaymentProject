import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useCheckoutStore } from '../store/stepStore';
import { validateLuhn, detectCardType, updateTransaction } from '../api/card';
import CheckoutHeader from '../components/CheckoutHeader';
import BaseModal from '../components/BaseModal';
import { CreditCard, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function Card() {
  const { t } = useTranslation();
  const { sessionData, setCurrentStep, setPaymentStatus } = useCheckoutStore();
  const [cardBrand, setCardBrand] = useState('generic');
  const [showCvv, setShowCvv] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // 3D-Secure (3DS) States
  const [show3DSModal, setShow3DSModal] = useState(false);
  const [otpValue, setOtpValue] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpTimer, setOtpTimer] = useState(30);
  const [pendingCardData, setPendingCardData] = useState(null);
  const otpRefs = useRef([]);

  // Mock 3DS Bank OTP Resend Countdown Timer
  useEffect(() => {
    if (otpTimer <= 0 || !show3DSModal) return;
    const timerId = setTimeout(() => {
      setOtpTimer(otpTimer - 1);
    }, 1000);
    return () => clearTimeout(timerId);
  }, [otpTimer, show3DSModal]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      cardNumber: '',
      expiry: '',
      cvv: '',
      nameOnCard: '',
      saveCard: false
    }
  });

  const cardNumberValue = watch('cardNumber') || '';
  const expiryValue = watch('expiry') || '';

  // Format Card Number (adds spaces every 4 digits) and detects brand
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    let brand = detectCardType(val);
    setCardBrand(brand);
    
    // Spacing formatting: 4444 4444 4444 4444
    let formattedVal = val.match(/.{1,4}/g)?.join(' ') || val;
    setValue('cardNumber', formattedVal);
  };

  // Format Expiry: MM/YY
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    setValue('expiry', val);
  };

  const onSubmitCard = async (data) => {
    setApiError('');
    const cleanCardNum = data.cardNumber.replace(/\D/g, '');

    // Luhn validation check
    if (!validateLuhn(cleanCardNum)) {
      setApiError('The credit card number entered is invalid. Please double check.');
      return;
    }

    // Expiry date structural validation
    const parts = data.expiry.split('/');
    if (parts.length !== 2) {
      setApiError('Invalid expiration date format. Use MM/YY.');
      return;
    }
    const month = parseInt(parts[0], 10);
    const year = parseInt('20' + parts[1], 10);
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    if (month < 1 || month > 12) {
      setApiError('Invalid expiry month. Enter a value between 01 and 12.');
      return;
    }
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      setApiError('The credit card has expired.');
      return;
    }

    // Store card data and show 3D Secure Verification Modal
    setPendingCardData({
      cardNumber: cleanCardNum,
      nameOnCard: data.nameOnCard,
      saveCard: data.saveCard
    });
    setOtpValue(['', '', '', '', '', '']);
    setOtpError('');
    setOtpTimer(30);
    setShow3DSModal(true);

    // Auto-focus first input on opening modal
    setTimeout(() => {
      if (otpRefs.current[0]) {
        otpRefs.current[0].focus();
      }
    }, 100);
  };

  const handleVerify3DS = async (e) => {
    e.preventDefault();
    const completeOtp = otpValue.join('');

    if (completeOtp.length !== 6) {
      setOtpError('Please enter all 6 digits of the secure authentication code.');
      return;
    }

    // 123456 is mock success OTP
    if (completeOtp !== '123456') {
      setOtpError('Bank OTP authentication failed. Please enter the correct 6-digit test code (123456).');
      return;
    }

    setShow3DSModal(false);
    setIsSubmitting(true);
    setCurrentStep('PROCESSING');

    try {
      const response = await updateTransaction(sessionData?.sessionId, {
        cardNumber: pendingCardData.cardNumber,
        cardBrand: cardBrand,
        nameOnCard: pendingCardData.nameOnCard,
        saveCard: pendingCardData.saveCard
      });

      // Update global transaction results
      setPaymentStatus(
        response.status, 
        response.details, 
        response.error
      );
    } catch (err) {
      setCurrentStep('CARD');
      setApiError(err.message || 'Payment processing failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = () => {
    if (otpTimer > 0) return;
    setOtpTimer(30);
    setOtpValue(['', '', '', '', '', '']);
    setOtpError('');
    setTimeout(() => {
      if (otpRefs.current[0]) {
        otpRefs.current[0].focus();
      }
    }, 50);
  };

  const handleOtpDigitChange = (index, value) => {
    if (value !== '' && !/^[0-9]$/.test(value)) return;

    const newOtp = [...otpValue];
    newOtp[index] = value;
    setOtpValue(newOtp);
    setOtpError('');

    // Advance focus
    if (value !== '' && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otpValue];
      if (otpValue[index] === '' && index > 0) {
        newOtp[index - 1] = '';
        setOtpValue(newOtp);
        if (otpRefs.current[index - 1]) {
          otpRefs.current[index - 1].focus();
        }
      } else {
        newOtp[index] = '';
        setOtpValue(newOtp);
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
    if (pastedData.length === 6) {
      setOtpValue(pastedData.split(''));
      if (otpRefs.current[5]) {
        otpRefs.current[5].focus();
      }
    }
  };

  const getBrandLogo = (brand) => {
    switch (brand) {
      case 'visa':
        return <span style={{ fontSize: '0.625rem', color: '#1a1f71', fontWeight: 'bold', border: '1px solid #1a1f71', padding: '1px 4px', borderRadius: '2px', background: '#fff' }}>VISA</span>;
      case 'mastercard':
        return <span style={{ fontSize: '0.625rem', color: '#f79e1b', fontWeight: 'bold', border: '1px solid #eb001b', padding: '1px 4px', borderRadius: '2px', background: '#fff' }}>MC</span>;
      case 'rupay':
        return <span style={{ fontSize: '0.625rem', color: '#00549c', fontWeight: 'bold', border: '1px solid #f79e1b', padding: '1px 4px', borderRadius: '2px', background: '#fff' }}>RuPay</span>;
      case 'amex':
        return <span style={{ fontSize: '0.625rem', color: '#007bc1', fontWeight: 'bold', border: '1px solid #007bc1', padding: '1px 4px', borderRadius: '2px', background: '#fff' }}>AMEX</span>;
      default:
        return <CreditCard size={18} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  const get3DSBadge = () => {
    switch (cardBrand) {
      case 'visa':
        return { label: 'Visa Secure', color: '#1a1f71', bg: '#f1f5f9' };
      case 'mastercard':
        return { label: 'Mastercard Identity Check', color: '#eb001b', bg: '#fff5f5' };
      case 'rupay':
        return { label: 'RuPay SecurePay', color: '#00549c', bg: '#f0f9ff' };
      case 'amex':
        return { label: 'American Express SafeKey', color: '#007bc1', bg: '#f0f9ff' };
      default:
        return { label: '3D Secure Unified Bank Auth', color: 'var(--primary)', bg: 'var(--primary-light-bg)' };
    }
  };

  const badge3DS = get3DSBadge();

  const formattedAmount = sessionData?.order?.amount
    ? `₹${sessionData.order.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : '₹2,500.00';

  return (
    <div className="step-container">
      <CheckoutHeader showBack onBack={() => setCurrentStep('PAYMENT_SELECTION')} />
      
      <h2>{t('card_title')}</h2>
      <p className="step-subtitle">{t('card_subtitle')}</p>

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

      {/* Interactive Card Graphic for premium wow factor */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #1e40af 100%)',
        color: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        minHeight: '160px',
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Dynamic design ring */}
        <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.8, letterSpacing: '1px' }}>SECURE DEBIT/CREDIT CARD</span>
          {getBrandLogo(cardBrand)}
        </div>

        {/* Dynamic Card Number */}
        <div style={{
          fontSize: '1.25rem',
          fontFamily: 'monospace',
          letterSpacing: '3px',
          fontWeight: 'bold',
          margin: '0.5rem 0'
        }}>
          {cardNumberValue || '•••• •••• •••• ••••'}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <div>
            <span style={{ fontSize: '0.625rem', opacity: 0.6, display: 'block' }}>CARD HOLDER</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {watch('nameOnCard') || 'YOUR NAME'}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.625rem', opacity: 0.6, display: 'block' }}>EXPIRES</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'monospace' }}>
              {expiryValue || 'MM/YY'}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmitCard)} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        
        {/* Card Number Input */}
        <div className="form-group">
          <label htmlFor="cardNumber">{t('card_number')}</label>
          <div className="input-wrapper">
            <input
              id="cardNumber"
              type="tel"
              placeholder="4111 1111 1111 1111"
              maxLength={19}
              className={`form-control ${errors.cardNumber ? 'is-invalid' : ''}`}
              style={{ paddingLeft: '2.5rem' }}
              {...register('cardNumber', { 
                required: 'Card number is required',
                onChange: handleCardNumberChange
              })}
            />
            <CreditCard size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
          {errors.cardNumber && <span className="error-message">{errors.cardNumber.message}</span>}
        </div>

        {/* Expiry & CVV Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label htmlFor="expiry">{t('expiry_date')}</label>
            <input
              id="expiry"
              type="text"
              placeholder="MM/YY"
              maxLength={5}
              className={`form-control ${errors.expiry ? 'is-invalid' : ''}`}
              {...register('expiry', { 
                required: 'Expiry MM/YY required',
                onChange: handleExpiryChange
              })}
            />
            {errors.expiry && <span className="error-message">{errors.expiry.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="cvv">{t('cvv')}</label>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <input
                id="cvv"
                type={showCvv ? 'text' : 'password'}
                placeholder="•••"
                maxLength={4}
                className={`form-control ${errors.cvv ? 'is-invalid' : ''}`}
                {...register('cvv', { 
                  required: 'CVV code required',
                  pattern: {
                    value: /^\d{3,4}$/,
                    message: 'Enter 3 or 4 digits'
                  }
                })}
              />
              <button
                type="button"
                onClick={() => setShowCvv(!showCvv)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {showCvv ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.cvv && <span className="error-message">{errors.cvv.message}</span>}
          </div>
        </div>

        {/* Name on Card */}
        <div className="form-group">
          <label htmlFor="nameOnCard">{t('name_on_card')}</label>
          <input
            id="nameOnCard"
            type="text"
            placeholder="John Doe"
            className={`form-control ${errors.nameOnCard ? 'is-invalid' : ''}`}
            {...register('nameOnCard', { 
              required: 'Name on card is required',
              pattern: {
                value: /^[a-zA-Z\s]+$/,
                message: 'Name can only contain alphabetic characters'
              }
            })}
          />
          {errors.nameOnCard && <span className="error-message">{errors.nameOnCard.message}</span>}
        </div>

        {/* Save Card for Vault Checkbox */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          margin: '0.5rem 0 1.5rem',
          textAlign: 'left'
        }}>
          <input
            type="checkbox"
            id="saveCard"
            style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
            {...register('saveCard')}
          />
          <label htmlFor="saveCard" style={{ fontSize: '0.8125rem', color: 'var(--text-main)', cursor: 'pointer', margin: 0, fontWeight: 500 }}>
            {t('save_card')}
          </label>
        </div>

        {/* Tip indicator */}
        <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1rem' }}>
          💡 Tip: Use <strong style={{ color: 'var(--danger)' }}>XXXX XXXX XXXX 4444</strong> to test a <strong>Declined</strong> card, <strong style={{ color: 'var(--pending)' }}>5555</strong> for <strong>Pending</strong>, or any valid card for <strong>Success</strong>!
        </p>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary btn-block"
        >
          {isSubmitting ? <div className="spinner" /> : `${t('pay_btn')} ${formattedAmount}`}
        </button>

        {/* Footer Navigation */}
        <div className="step-nav-footer">
          <button type="button" onClick={() => setCurrentStep('PAYMENT_SELECTION')} className="back-btn">
            &larr; {t('back_to_payment_selection')}
          </button>
          <div className="security-badge">
            <ShieldCheck size={12} style={{ color: 'var(--success)' }} />
            <span>{t('fully_encrypted')}</span>
          </div>
        </div>
      </form>

      {/* 3D-Secure Authentication Modal */}
      <BaseModal
        isOpen={show3DSModal}
        onClose={() => setShow3DSModal(false)}
        title="3D Secure Authentication"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
          
          {/* Dynamic 3DS Security Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: badge3DS.bg,
            border: `1px solid ${badge3DS.color}33`,
          }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: badge3DS.color }}>
              {badge3DS.label}
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.625rem',
              color: 'var(--text-muted)',
              fontWeight: 600
            }}>
              <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
              <span>SECURE BANK ROUTING</span>
            </div>
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', lineHeight: 1.45, margin: 0 }}>
            Enter the 6-digit secure verification code sent to your registered mobile number ending in <strong style={{ color: 'var(--text-heading)' }}>•••• {sessionData?.contact?.mobile ? sessionData.contact.mobile.slice(-4) : '4321'}</strong> to complete this purchase.
          </p>

          {otpError && (
            <div style={{
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: 550,
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              {otpError}
            </div>
          )}

          <form onSubmit={handleVerify3DS} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* OTP Input Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '0.5rem',
              margin: '0.5rem 0'
            }}>
              {otpValue.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  style={{
                    width: '100%',
                    height: '2.75rem',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-heading)',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = badge3DS.color;
                    e.target.style.boxShadow = `0 0 0 3px ${badge3DS.color}22`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-color)';
                    e.target.style.boxShadow = 'var(--shadow-sm)';
                  }}
                />
              ))}
            </div>

            {/* Resend Helper */}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              {otpTimer > 0 ? (
                <span>Resend secure OTP in <strong style={{ color: 'var(--text-heading)', fontFamily: 'monospace' }}>00:{otpTimer.toString().padStart(2, '0')}</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
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
                  Resend OTP Code
                </button>
              )}
            </div>

            <div style={{
              fontSize: '0.6875rem',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--primary-light-bg)',
              padding: '0.625rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              lineHeight: 1.4
            }}>
              💡 <strong>Test Mode Simulator:</strong> Enter OTP <strong style={{ color: 'var(--primary)', fontFamily: 'var(--mono)' }}>123456</strong> to successfully authorize, or enter any other digits to test failure!
            </div>

            {/* Submit */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: badge3DS.color,
                color: '#ffffff',
                border: 'none',
                fontWeight: 650,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = 0.9}
              onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
            >
              Verify &amp; Authorize Payment
            </button>
          </form>
        </div>
      </BaseModal>
    </div>
  );
}
