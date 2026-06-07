import React from 'react';
import { useCheckoutStore } from '../store/stepStore';
import Contact from './Contact';
import OTP from './OTP';
import Billing from './Billing';
import Shipping from './Shipping';
import PaymentSelection from './PaymentSelection';
import Card from './Card';
import UPI from './UPI';
import Netbanking from './Netbanking';
import Wallet from './Wallet';
import EMI from './EMI';
import PayLater from './PayLater';
import Result from './Result';
import Loader from '../components/Loader';

export default function StepRenderer() {
  const currentStep = useCheckoutStore((state) => state.currentStep);

  switch (currentStep) {
    case 'CONTACT':
      return <Contact />;
    case 'OTP':
      return <OTP />;
    case 'BILLING':
      return <Billing />;
    case 'SHIPPING':
      return <Shipping />;
    case 'PAYMENT_SELECTION':
      return <PaymentSelection />;
    case 'CARD':
      return <Card />;
    case 'UPI':
      return <UPI />;
    case 'NETBANKING':
      return <Netbanking />;
    case 'WALLET':
      return <Wallet />;
    case 'EMI':
      return <EMI />;
    case 'PAY_LATER':
      return <PayLater />;
    case 'PROCESSING':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', minHeight: '350px' }}>
          <Loader message="Verifying transaction details with your issuer bank. Please do not refresh." />
        </div>
      );
    case 'RESULT':
      return <Result />;
    default:
      return <Contact />;
  }
}
