import React from 'react';
import { useCheckoutStore } from '../store/stepStore';
import BaseModal from './BaseModal';

// Modal Registries and Types
export const MODAL_TYPES = {
  TERMS: 'TERMS',
  PRIVACY: 'PRIVACY',
  TIMEOUT: 'TIMEOUT'
};

export default function ModalRoot() {
  const { modal, closeModal, resetStore } = useCheckoutStore();

  const isOpen = modal.type !== null;

  const handleClose = () => {
    if (modal.type === MODAL_TYPES.TIMEOUT) {
      // If session expired, reset state and take back to contact
      resetStore();
    }
    closeModal();
  };

  return (
    <>
      {/* Terms & Conditions Modal */}
      <BaseModal 
        isOpen={isOpen && modal.type === MODAL_TYPES.TERMS} 
        onClose={handleClose} 
        title="Terms and Conditions"
      >
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)', lineHeight: 1.6, textAlign: 'left', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          <p style={{ marginBottom: '0.75rem' }}>
            Welcome to our payment checkout gateway. By completing this transaction, you agree to comply with and be bound by the following terms of purchase.
          </p>
          <p style={{ marginBottom: '0.75rem' }}>
            1. All card and digital transactions are secured and routed directly via standard merchant banks.
          </p>
          <p style={{ marginBottom: '0.75rem' }}>
            2. Any disputes regarding order items, delivery times, or bookings should be addressed directly to the merchant.
          </p>
          <p>
            3. Refunds, cancellations, and exchange requests are governed by the merchant's refund policy.
          </p>
        </div>
      </BaseModal>

      {/* Privacy Policy Modal */}
      <BaseModal 
        isOpen={isOpen && modal.type === MODAL_TYPES.PRIVACY} 
        onClose={handleClose} 
        title="Privacy Policy"
      >
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)', lineHeight: 1.6, textAlign: 'left' }}>
          <p style={{ marginBottom: '0.75rem' }}>
            We take your privacy extremely seriously. We do not store full credit card numbers or sensitive CVV codes on our servers.
          </p>
          <p style={{ marginBottom: '0.75rem' }}>
            All billing and contact details are transmitted securely using high-grade Secure Sockets Layer (SSL) encryption protocol.
          </p>
          <p>
            We adhere to PCI-DSS compliance regulations to ensure your payment credentials remain protected from unauthorized access at all times.
          </p>
        </div>
      </BaseModal>

      {/* Timeout Alert Modal */}
      <BaseModal 
        isOpen={isOpen && modal.type === MODAL_TYPES.TIMEOUT} 
        onClose={handleClose} 
        title="Session Expired"
      >
        <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.5, textAlign: 'center' }}>
          <p style={{ marginBottom: '1.25rem' }}>
            Your secure payment session has expired due to inactivity. Please refresh your browser or start the checkout process again.
          </p>
          <button 
            className="btn btn-primary btn-block"
            onClick={handleClose}
          >
            Start Over
          </button>
        </div>
      </BaseModal>
    </>
  );
}
