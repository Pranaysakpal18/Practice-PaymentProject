import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CheckoutProvider } from './context/CheckoutContext';
import ThemeProvider from './components/ThemeProvider';
import { useCheckoutStore } from './store/stepStore';
import { useSession } from './hooks/useSession';
import MerchantInfo from './components/MerchantInfo';
import StepRenderer from './steps/StepRenderer';
import ModalRoot from './components/ModalRoot';
import Loader from './components/Loader';
import Error from './components/Error';

// Instructure standard React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    }
  }
});

function CheckoutPageInner({ requestId }) {
  const { data, isLoading, error, refetch } = useSession(requestId);
  const setSessionData = useCheckoutStore((state) => state.setSessionData);

  // Sync data to global Zustand store once loaded
  useEffect(() => {
    if (data) {
      setSessionData(data);
    }
  }, [data, setSessionData]);

  if (isLoading) {
    return <Loader fullScreen message="Loading secure checkout session..." />;
  }

  if (error || !data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-app)' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-premium)', width: '100%', maxWidth: '480px', padding: '1rem' }}>
          <Error 
            message={error?.message || 'The checkout session is invalid or expired. Please contact the merchant.'} 
            onRetry={refetch} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="checkout-wrapper">
        {/* Left Side: Merchant Order Info */}
        <MerchantInfo />

        {/* Right Side: Step wizard forms */}
        <div className="card-wrapper">
          <StepRenderer />
          <ModalRoot />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // Extract session_id or request_id from URL params
  const [requestId, setRequestId] = useState('demo-session');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('session_id') || params.get('request_id') || 'demo-session';
    setRequestId(id);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CheckoutProvider initialRequestId={requestId}>
        <ThemeProvider>
          <CheckoutPageInner requestId={requestId} />
        </ThemeProvider>
      </CheckoutProvider>
    </QueryClientProvider>
  );
}