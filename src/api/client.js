// Fetch API wrapper with optional mock interceptors for local development

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const USE_REAL_NETWORK = import.meta.env.VITE_USE_REAL_NETWORK === 'true';

// Parse fetch responses gracefully
async function parseResponse(response) {
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Something went wrong');
  }
  return data;
}

// In-memory mock DB state to preserve session across steps during testing
let mockDatabase = {
  session: {
    requestId: 'demo-session',
    sessionId: 'sess_99812498A',
    merchant: {
      name: 'Demo Merchant',
      logoUrl: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=128&auto=format&fit=crop&q=80',
      themeColor: '#2563eb', // Indigo brand color
      termsUrl: 'https://example.com/terms',
      privacyUrl: 'https://example.com/privacy'
    },
    order: {
      id: 'ORD123456789',
      bookingId: 'BK123456789',
      amount: 2500.00,
      currency: 'INR',
      description: 'Order Payment #ORD123456789',
      date: '24 May 2026'
    },
    pricing: {
      subtotal: 2500.00,
      tax: 0.00,
      discount: 0.00,
      total: 2500.00
    },
    settings: {
      timerSeconds: 600, // 10 minutes
      requiresOtp: true
    },
    contact: {
      mobile: '',
      email: ''
    },
    billingAddress: null,
    shippingAddress: null,
    paymentMethod: null
  }
};

// Simulate network latency (400ms) for high fidelity testing
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Interceptor Engine
const mockEndpoints = {
  // GET session data
  [`GET:/checkout/sessions/`]: async (path, requestId) => {
    await delay();
    const cleanId = requestId || 'demo-session';
    mockDatabase.session.requestId = cleanId;
    return { ...mockDatabase.session };
  },

  // POST contact details
  [`POST:/checkout/sessions/contact`]: async (path, payload) => {
    await delay(500);
    mockDatabase.session.contact = {
      mobile: payload.mobile,
      email: payload.email || ''
    };
    return { success: true, session: { ...mockDatabase.session } };
  },

  // POST verify contact OTP
  [`POST:/checkout/sessions/verify-otp`]: async (path, payload) => {
    await delay(500);
    if (!payload.otp || payload.otp.length !== 6) {
      throw new Error('Invalid OTP. Please enter a 6-digit code.');
    }
    return { success: true };
  },

  // POST billing address
  [`POST:/checkout/sessions/billing`]: async (path, payload) => {
    await delay(400);
    mockDatabase.session.billingAddress = payload;
    return { success: true, session: { ...mockDatabase.session } };
  },

  // POST shipping address
  [`POST:/checkout/sessions/shipping`]: async (path, payload) => {
    await delay(400);
    mockDatabase.session.shippingAddress = payload;
    return { success: true, session: { ...mockDatabase.session } };
  },

  // GET available payment methods
  [`GET:/checkout/sessions/payment-methods`]: async () => {
    await delay(300);
    return {
      methods: [
        { id: 'upi', name: 'UPI', description: 'Pay using UPI Apps / QR Codes', type: 'UPI' },
        { id: 'card', name: 'Cards', description: 'Debit / Credit Cards', type: 'CARD' },
        { id: 'netbanking', name: 'Netbanking', description: 'Pay using Internet Banking', type: 'NETBANKING' },
        { id: 'wallet', name: 'Wallet', description: 'Pay using Digital Wallets', type: 'WALLET' },
        { id: 'emi', name: 'EMI', description: 'Pay in easy installments', type: 'EMI' },
        { id: 'paylater', name: 'Pay Later', description: 'Buy Now, Pay Later', type: 'PAY_LATER' }
      ]
    };
  },

  // POST process payment transaction
  [`POST:/payment/pay`]: async (path, payload) => {
    await delay(1800); // Higher delay to show the beautiful processing screens!

    const transId = 'TXN' + Math.floor(1000000000 + Math.random() * 9000000000);
    const amount = mockDatabase.session.order.amount;
    const dateStr = new Date().toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // Custom Dev testing triggers
    let status = 'SUCCESS';
    let errorMessage = null;

    if (payload.method === 'UPI') {
      const vpa = payload.upiId || '';
      if (vpa.includes('fail')) {
        status = 'FAILURE';
        errorMessage = 'Your UPI transaction was declined by the bank.';
      } else if (vpa.includes('pending')) {
        status = 'PENDING';
      }
    } else if (payload.method === 'CARD') {
      const cardNum = payload.cardNumber || '';
      if (cardNum.endsWith('4444')) {
        status = 'FAILURE';
        errorMessage = 'Transaction declined: Insufficient funds in card account.';
      } else if (cardNum.endsWith('5555')) {
        status = 'PENDING';
      }
    } else if (payload.method === 'NETBANKING') {
      const bank = payload.bankId || '';
      if (bank === 'fail') {
        status = 'FAILURE';
        errorMessage = 'Internet banking login aborted or failed at gateway.';
      } else if (bank === 'pending') {
        status = 'PENDING';
      }
    }

    const txDetails = {
      transactionId: transId,
      amount: amount,
      date: dateStr,
      method: payload.method
    };

    return {
      success: status === 'SUCCESS',
      status: status,
      error: errorMessage,
      details: txDetails
    };
  }
};

// Main Fetch Client Object
export const client = {
  get: async (path) => {
    if (!USE_REAL_NETWORK) {
      // Intercept path and check for mock matching
      const mockKey = `GET:${path.split('?')[0]}`;
      
      // Check dynamic ID patterns: /checkout/sessions/:id -> match prefix
      if (path.startsWith('/checkout/sessions/') && !path.endsWith('/payment-methods')) {
        const parts = path.split('/');
        const id = parts[parts.length - 1];
        return await mockEndpoints[`GET:/checkout/sessions/`](path, id);
      }

      // Match exact match keys (sorted by length descending to match specific endpoints before generic ones)
      const matchKey = Object.keys(mockEndpoints)
        .sort((a, b) => b.length - a.length)
        .find(key => key.startsWith('GET:') && path.includes(key.replace('GET:', '')));
      
      if (matchKey) {
        return await mockEndpoints[matchKey](path);
      }
    }

    // Standard HTTP Request
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': crypto.randomUUID ? crypto.randomUUID() : 'client-correlation-id'
        }
      });
      return await parseResponse(response);
    } catch (e) {
      if (USE_REAL_NETWORK) {
        throw e;
      }
      console.warn('Real API failed. Falling back to local mock interceptor.', e.message);
      // If server doesn't respond, run mock as fallback
      if (path.includes('/payment-methods')) {
        return await mockEndpoints[`GET:/checkout/sessions/payment-methods`]();
      }
      return await mockEndpoints[`GET:/checkout/sessions/`](path, 'demo-session');
    }
  },

  post: async (path, body = {}) => {
    if (!USE_REAL_NETWORK) {
      // Check dynamic mock interceptors (sorted by length descending to match specific endpoints before generic ones)
      const matchKey = Object.keys(mockEndpoints)
        .sort((a, b) => b.length - a.length)
        .find(key => key.startsWith('POST:') && path.includes(key.replace('POST:', '')));
      
      if (matchKey) {
        return await mockEndpoints[matchKey](path, body);
      }
    }

    // Standard HTTP Request
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': crypto.randomUUID ? crypto.randomUUID() : 'client-correlation-id'
        },
        body: JSON.stringify(body)
      });
      return await parseResponse(response);
    } catch (e) {
      if (USE_REAL_NETWORK) {
        throw e;
      }
      console.warn('Real POST failed. Falling back to local mock.', e.message);
      // Match endpoints manually
      if (path.includes('/contact')) {
        return await mockEndpoints[`POST:/checkout/sessions/contact`](path, body);
      }
      if (path.includes('/verify-otp')) {
        return await mockEndpoints[`POST:/checkout/sessions/verify-otp`](path, body);
      }
      if (path.includes('/billing')) {
        return await mockEndpoints[`POST:/checkout/sessions/billing`](path, body);
      }
      if (path.includes('/shipping')) {
        return await mockEndpoints[`POST:/checkout/sessions/shipping`](path, body);
      }
      if (path.includes('/pay')) {
        return await mockEndpoints[`POST:/payment/pay`](path, body);
      }
      throw e;
    }
  }
};
