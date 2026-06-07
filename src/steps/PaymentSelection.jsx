import React, { useEffect, useState } from 'react';
import { useCheckoutStore } from '../store/stepStore';
import { client } from '../api/client';
import CheckoutHeader from '../components/CheckoutHeader';
import Loader from '../components/Loader';
import { CreditCard, Landmark, QrCode, ChevronRight, ShieldCheck, Wallet, CalendarDays, Clock } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function PaymentSelection() {
  const { sessionData, setCurrentStep, setSelectedPaymentMethod } = useCheckoutStore();
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // Fetch payment methods
  useEffect(() => {
    let active = true;
    const fetchMethods = async () => {
      try {
        const response = await client.get('/checkout/sessions/payment-methods');
        if (active) {
          setMethods(response.methods || []);
        }
      } catch (err) {
        console.error('Error fetching payment methods, using defaults', err);
        if (active) {
          // Fallback static list
          setMethods([
            { id: 'upi', name: 'UPI', description: 'Pay using UPI Apps / QR Codes', type: 'UPI' },
            { id: 'card', name: 'Cards', description: 'Debit / Credit Cards', type: 'CARD' },
            { id: 'netbanking', name: 'Netbanking', description: 'Pay using Internet Banking', type: 'NETBANKING' },
            { id: 'wallet', name: 'Wallet', description: 'Pay using Digital Wallets', type: 'WALLET' },
            { id: 'emi', name: 'EMI', description: 'Pay in easy installments', type: 'EMI' },
            { id: 'paylater', name: 'Pay Later', description: 'Buy Now, Pay Later', type: 'PAY_LATER' }
          ]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchMethods();
    return () => { active = false; };
  }, []);

  const handleSelectMethod = (type) => {
    setSelectedPaymentMethod(type);
    setCurrentStep(type); // Transition to the specific component: CARD, UPI, NETBANKING, WALLET, EMI, PAY_LATER
  };

  const formattedAmount = sessionData?.order?.amount
    ? `₹${sessionData.order.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : '₹2,500.00';

  // Map icon component
  const getIcon = (type) => {
    switch (type) {
      case 'UPI':
        return <QrCode size={22} style={{ color: 'var(--primary)' }} />;
      case 'CARD':
        return <CreditCard size={22} style={{ color: 'var(--primary)' }} />;
      case 'NETBANKING':
        return <Landmark size={22} style={{ color: 'var(--primary)' }} />;
      case 'WALLET':
        return <Wallet size={22} style={{ color: 'var(--primary)' }} />;
      case 'EMI':
        return <CalendarDays size={22} style={{ color: 'var(--primary)' }} />;
      case 'PAY_LATER':
        return <Clock size={22} style={{ color: 'var(--primary)' }} />;
      default:
        return <Wallet size={22} style={{ color: 'var(--primary)' }} />;
    }
  };

  if (loading) {
    return (
      <div className="step-container">
        <CheckoutHeader />
        <h2>{t('select_payment')}</h2>
        <Loader message={t('loading_methods')} />
      </div>
    );
  }

  return (
    <div className="step-container">
      <CheckoutHeader showBack onBack={() => setCurrentStep('SHIPPING')} />
      
      <h2>{t('select_payment')}</h2>
      <p className="step-subtitle">{t('select_payment_subtitle')}<strong style={{ color: 'var(--text-heading)' }}>{formattedAmount}</strong>.</p>

      {/* Methods list */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
        marginBottom: '2rem'
      }}>
        {methods.map((method) => (
          <div
            key={method.id}
            onClick={() => handleSelectMethod(method.type)}
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              alignItems: 'center',
              gap: '1rem',
              padding: '1.125rem 1.25rem',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              background: 'var(--bg-card)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Left Icon Area */}
            <div style={{
              background: 'var(--primary-light-bg)',
              padding: '0.625rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {getIcon(method.type)}
            </div>

            {/* Middle Title Details */}
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 650, color: 'var(--text-heading)', margin: 0 }}>
                {method.name}
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                {method.description}
              </p>
            </div>

            {/* Right Chevron */}
            <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
        ))}
      </div>

      {/* Footer Navigation */}
      <div className="step-nav-footer">
        <button type="button" onClick={() => setCurrentStep('SHIPPING')} className="back-btn">
          &larr; {t('back_to_shipping')}
        </button>
        <div className="security-badge">
          <ShieldCheck size={12} style={{ color: 'var(--success)' }} />
          <span>{t('pci_compliant')}</span>
        </div>
      </div>
    </div>
  );
}
