import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCheckoutStore } from '../store/stepStore';
import { client } from '../api/client';
import CheckoutHeader from '../components/CheckoutHeader';
import { Copy, Check, QrCode, Smartphone, ShieldCheck, AlertCircle } from 'lucide-react';

export default function UPI() {
  const { sessionData, setCurrentStep, setPaymentStatus } = useCheckoutStore();
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' or 'vpa'
  const [qrTimer, setQrTimer] = useState(585); // 9 minutes 45 seconds countdown
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const merchantVpa = 'merchant@okaxis';

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      upiId: ''
    }
  });

  // Tick QR Code Timer
  useEffect(() => {
    if (activeTab !== 'qr' || qrTimer <= 0) return;
    const interval = setInterval(() => {
      setQrTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTab, qrTimer]);

  const formatQrTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(merchantVpa);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const onSubmitVpa = async (data) => {
    setApiError('');
    setIsSubmitting(true);
    setCurrentStep('PROCESSING'); // transition to processing spinner

    try {
      const response = await client.post('/payment/pay', {
        sessionId: sessionData?.sessionId,
        method: 'UPI',
        upiId: data.upiId
      });

      setPaymentStatus(
        response.status,
        response.details,
        response.error
      );
    } catch (err) {
      setCurrentStep('UPI');
      setApiError(err.message || 'UPI transaction failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Trigger QR Successful payment simulation after 8 seconds of viewing QR
  useEffect(() => {
    if (activeTab !== 'qr') return;
    
    const qrSuccessTimer = setTimeout(async () => {
      // Direct checkout simulation on active screen
      setCurrentStep('PROCESSING');
      try {
        const response = await client.post('/payment/pay', {
          sessionId: sessionData?.sessionId,
          method: 'UPI',
          upiId: 'qr-scan@okaxis'
        });
        setPaymentStatus(response.status, response.details, response.error);
      } catch (err) {
        setCurrentStep('UPI');
      }
    }, 10000); // Trigger successful payment after 10 seconds of QR display

    return () => clearTimeout(qrSuccessTimer);
  }, [activeTab, setCurrentStep, setPaymentStatus, sessionData]);

  const formattedAmount = sessionData?.order?.amount
    ? `₹${sessionData.order.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : '₹2,500.00';

  return (
    <div className="step-container">
      <CheckoutHeader showBack onBack={() => setCurrentStep('PAYMENT_SELECTION')} />
      
      <h2>UPI Payment</h2>
      <p className="step-subtitle">Pay quickly via QR scan or using your virtual payment address.</p>

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

      {/* Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '1.5rem'
      }}>
        <button
          onClick={() => setActiveTab('qr')}
          style={{
            padding: '0.75rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'qr' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'qr' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.2s'
          }}
        >
          Scan QR Code
        </button>
        <button
          onClick={() => setActiveTab('vpa')}
          style={{
            padding: '0.75rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'vpa' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'vpa' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.2s'
          }}
        >
          Pay to UPI ID
        </button>
      </div>

      {/* TAB CONTENT: QR CODE */}
      {activeTab === 'qr' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          animation: 'slideUpFade 0.3s ease'
        }}>
          {/* Beautiful Mock QR Graphic */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            width: '200px',
            height: '200px',
            position: 'relative'
          }}>
            {/* Styled vector QR simulation block */}
            <div style={{
              width: '100%',
              height: '100%',
              backgroundImage: 'radial-gradient(#334155 30%, transparent 30%), radial-gradient(#334155 30%, transparent 30%)',
              backgroundSize: '12px 12px',
              backgroundPosition: '0 0, 6px 6px',
              opacity: 0.85
            }} />
            {/* Corners overlay to make it look like a QR */}
            <div style={{ position: 'absolute', top: '15px', left: '15px', width: '35px', height: '35px', border: '5px solid #0f172a', background: '#fff' }} />
            <div style={{ position: 'absolute', top: '15px', right: '15px', width: '35px', height: '35px', border: '5px solid #0f172a', background: '#fff' }} />
            <div style={{ position: 'absolute', bottom: '15px', left: '15px', width: '35px', height: '35px', border: '5px solid #0f172a', background: '#fff' }} />
            {/* Logo in center */}
            <div style={{ position: 'absolute', background: '#fff', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>
              <QrCode size={20} style={{ color: 'var(--primary)' }} />
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', fontWeight: 550 }}>Scan this QR code using any UPI app</p>
            <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-heading)', margin: '4px 0' }}>
              Amount: {formattedAmount}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Time remaining:</span>
              <strong style={{ color: 'var(--success)', fontFamily: 'monospace', fontWeight: 700 }}>
                {formatQrTime(qrTimer)}
              </strong>
            </div>
          </div>

          <div style={{ width: '100%', borderTop: '1px dashed var(--border-color)', padding: '1rem 0' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Or pay using merchant UPI ID</span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              padding: '0.5rem 0.875rem',
              borderRadius: 'var(--radius-md)'
            }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-heading)' }}>
                {merchantVpa}
              </span>
              <button
                onClick={handleCopyVpa}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isCopied ? 'var(--success)' : 'var(--primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              >
                {isCopied ? <Check size={14} /> : <Copy size={14} />}
                <span>{isCopied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
          
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={10} />
            <span>Simulating auto-payment scan trigger in 10 seconds.</span>
          </p>
        </div>
      )}

      {/* TAB CONTENT: PAY BY VPA */}
      {activeTab === 'vpa' && (
        <form onSubmit={handleSubmit(onSubmitVpa)} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, animation: 'slideUpFade 0.3s ease' }}>
          <div className="form-group">
            <label htmlFor="upiId">Enter your UPI ID / VPA</label>
            <div className="input-wrapper">
              <input
                id="upiId"
                type="text"
                placeholder="name@okaxis"
                className={`form-control ${errors.upiId ? 'is-invalid' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                {...register('upiId', {
                  required: 'UPI ID is required',
                  pattern: {
                    value: /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/,
                    message: 'Please enter a valid UPI address format (e.g. username@bank)'
                  }
                })}
              />
              <Smartphone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            {errors.upiId && <span className="error-message">{errors.upiId.message}</span>}
          </div>

          <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'left', lineHeight: 1.4 }}>
            💡 Hint: Enter <strong style={{ color: 'var(--danger)' }}>fail@upi</strong> to simulate a <strong>declined</strong> flow, or <strong style={{ color: 'var(--pending)' }}>pending@upi</strong> to test <strong>pending transaction</strong> outcomes!
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-block"
            style={{ marginTop: 'auto' }}
          >
            {isSubmitting ? <div className="spinner" /> : `Verify & Pay ${formattedAmount}`}
          </button>
        </form>
      )}

      {/* Footer Navigation */}
      <div className="step-nav-footer">
        <button type="button" onClick={() => setCurrentStep('PAYMENT_SELECTION')} className="back-btn">
          &larr; Back to Payment Methods
        </button>
        <div className="security-badge">
          <ShieldCheck size={12} style={{ color: 'var(--success)' }} />
          <span>PCI-DSS Secured</span>
        </div>
      </div>
    </div>
  );
}
