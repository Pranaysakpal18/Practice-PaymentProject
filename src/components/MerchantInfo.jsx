import React, { useEffect, useState } from 'react';
import { useCheckoutStore } from '../store/stepStore';
import { Lock, Timer, Info, CheckCircle2, ChevronDown, ChevronUp, Ticket } from 'lucide-react';
import BaseModal from './BaseModal';
import { useTranslation } from '../hooks/useTranslation';

export default function MerchantInfo() {
  const { sessionData, timer, tickTimer, updateCheckoutState } = useCheckoutStore();
  const [showDetails, setShowDetails] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const { t } = useTranslation();

  // Sync selectedBookingId with store data once loaded
  useEffect(() => {
    if (sessionData?.order?.bookingId) {
      setSelectedBookingId(sessionData.order.bookingId);
    }
  }, [sessionData?.order?.bookingId]);

  // Setup ticking checkout timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [tickTimer]);

  // Format seconds to MM:SS
  const formatTime = (timeInSeconds) => {
    if (timeInSeconds <= 0) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!sessionData) return null;

  const { merchant, order, pricing } = sessionData;
  const isTimeCritical = timer < 120; // highlight timer if less than 2 minutes left

  return (
    <div style={{
      background: 'var(--primary-light-bg)',
      borderRight: '1px solid var(--border-color)',
      padding: '2.25rem 1.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.75rem',
      transition: 'all 0.3s ease'
    }}>
      {/* Merchant Details */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {merchant?.logoUrl ? (
          <img 
            src={merchant.logoUrl} 
            alt={merchant.name} 
            style={{
              height: '40px',
              width: '40px',
              borderRadius: 'var(--radius-sm)',
              objectFit: 'cover',
              boxShadow: 'var(--shadow-sm)'
            }}
          />
        ) : (
          <div style={{
            height: '40px',
            width: '40px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.25rem'
          }}>
            {merchant.name.charAt(0)}
          </div>
        )}
        <div>
          <h1 style={{
            fontSize: '1.125rem',
            fontWeight: 650,
            margin: 0,
            letterSpacing: 'normal',
            color: 'var(--text-heading)',
            textAlign: 'left'
          }}>
            {merchant?.name}
          </h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.6875rem',
            color: 'var(--text-muted)',
            fontWeight: 500
          }}>
            <Lock size={10} />
            <span>{t('secure_payment_gateway')}</span>
          </div>
        </div>
      </div>

      {/* Expiry Countdown Timer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-md)',
        background: isTimeCritical ? 'var(--danger-light)' : 'var(--bg-card)',
        border: `1px solid ${isTimeCritical ? 'var(--danger)' : 'var(--border-color)'}`,
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: isTimeCritical ? 'var(--danger)' : 'var(--text-main)', fontWeight: 550 }}>
          <Timer size={16} className={isTimeCritical ? 'pulse-danger' : ''} />
          <span>{t('session_expires_in')}</span>
        </div>
        <span style={{
          fontFamily: '$font-mono',
          fontSize: '0.9375rem',
          fontWeight: 700,
          color: isTimeCritical ? 'var(--danger)' : 'var(--primary)'
        }}>
          {formatTime(timer)}
        </span>
      </div>

      {/* Order Summary Details Card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--text-heading)',
          marginBottom: '1rem',
          textAlign: 'left'
        }}>
          {t('order_summary')}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{t('order_id')}</span>
            <span style={{ fontWeight: 550, color: 'var(--text-main)' }}>{order?.id}</span>
          </div>
          <div 
            onClick={() => setIsBookingModalOpen(true)}
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '6px 8px',
              margin: '-6px -8px',
              borderRadius: 'var(--radius-sm)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-light-bg)';
              e.currentTarget.querySelector('.booking-id-text').style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.querySelector('.booking-id-text').style.color = 'var(--text-main)';
            }}
            title="Click to view all booking IDs"
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {t('booking_id')}
              <Info size={12} style={{ color: 'var(--text-muted)' }} />
            </span>
            <span 
              className="booking-id-text"
              style={{ 
                fontWeight: 600, 
                color: 'var(--text-main)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                transition: 'color 0.2s ease'
              }}
            >
              {selectedBookingId || order?.bookingId}
              <Ticket size={14} style={{ opacity: 0.7 }} />
            </span>
          </div>
          
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.25rem 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9375rem', fontWeight: 650, color: 'var(--text-heading)' }}>{t('amount_due')}</span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.125rem', fontWeight: 750, color: 'var(--primary)' }}>
                ₹{order?.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              color: 'var(--primary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginTop: '0.5rem',
              outline: 'none',
              fontWeight: 600
            }}
          >
            <span>{showDetails ? t('hide_details') : t('view_breakdown')}</span>
            {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {showDetails && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              marginTop: '0.5rem',
              padding: '0.75rem',
              background: 'var(--bg-app)',
              borderRadius: 'var(--radius-sm)',
              animation: 'slideUpFade 0.2s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span>{t('subtotal')}</span>
                <span>₹{pricing?.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span>{t('gst')}</span>
                <span>₹{pricing?.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span>{t('discounts')}</span>
                <span>-₹{pricing?.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PCI-DSS / Encryption Trust Block */}
      <div style={{
        marginTop: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5rem',
          textAlign: 'left',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)'
        }}>
          <CheckCircle2 size={18} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 650, color: 'var(--text-heading)' }}>{t('secure_payments_title')}</h4>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
              {t('secure_payments_desc')}
            </p>
          </div>
        </div>

        <div className="payment-badge-group">
          {/* Using Lucide or secure styled text nodes for standard payment cards to avoid broken images */}
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px', background: '#fff' }}>VISA</span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px', background: '#fff' }}>Mastercard</span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px', background: '#fff' }}>RuPay</span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, border: '1px solid var(--border-color)', padding: '2px 4px', borderRadius: '4px', background: '#fff' }}>PCI-DSS</span>
        </div>
      </div>

      {/* Booking IDs List Modal */}
      <BaseModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title={t('account_bookings')}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            {t('select_booking_desc')}
          </p>
          
          {[
            order?.bookingId || 'BK123456789',
            (order?.bookingId || 'BK123456789').replace(/\d+/, (n) => String(Number(n) + 1)),
            (order?.bookingId || 'BK123456789').replace(/\d+/, (n) => String(Number(n) + 2)),
            (order?.bookingId || 'BK123456789').replace(/\d+/, (n) => String(Number(n) + 3)),
            (order?.bookingId || 'BK123456789').replace(/\d+/, (n) => String(Number(n) + 4)),
          ].map((id, index) => {
            const isSelected = id === (selectedBookingId || order?.bookingId);
            return (
              <div
                key={id}
                onClick={() => {
                  setSelectedBookingId(id);
                  if (sessionData) {
                    updateCheckoutState({
                      sessionData: {
                        ...sessionData,
                        order: {
                          ...sessionData.order,
                          bookingId: id
                        }
                      }
                    });
                  }
                  setIsBookingModalOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                  background: isSelected ? 'var(--primary-light-bg)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--border-hover)';
                    e.currentTarget.style.background = 'var(--bg-app)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.background = 'var(--bg-card)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: isSelected ? 'var(--primary)' : 'var(--border-color)',
                    color: isSelected ? '#ffffff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {index + 1}
                  </div>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: isSelected ? 600 : 500,
                    color: isSelected ? 'var(--text-heading)' : 'var(--text-main)',
                    fontFamily: 'var(--mono)'
                  }}>
                    {id}
                  </span>
                </div>
                {isSelected && (
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--primary)', 
                    fontWeight: 650,
                    background: 'var(--primary-light-bg)',
                    border: '1px solid rgba(37, 99, 235, 0.2)',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}>
                    {t('active')}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </BaseModal>
    </div>
  );
}
