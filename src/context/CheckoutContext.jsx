import React, { createContext, useContext } from 'react';
import { useCheckoutStore } from '../store/stepStore';

const CheckoutContext = createContext(null);

export function CheckoutProvider({ children, initialRequestId }) {
  // We can attach any custom props or fetch overrides here
  const store = useCheckoutStore();

  return (
    <CheckoutContext.Provider value={{ store, requestId: initialRequestId }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}
