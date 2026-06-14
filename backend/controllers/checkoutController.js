import CheckoutSession from '../models/CheckoutSession.js';
import Address from '../models/Address.js';
import SavedCard from '../models/SavedCard.js';
import Offer from '../models/Offer.js';
import Payment from '../models/Payment.js';

// GET /api/checkout/sessions/:requestId
export const getSession = async (req, res) => {
  try {
    const session = await CheckoutSession.findOne({ requestId: req.params.requestId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Convert to simple object to allow modifications
    const responseData = session.toObject();

    // To simulate real-world API variations and satisfy "normalization" requirement,
    // we'll alias some fields randomly here or the frontend should handle them.
    // For demonstration, we'll return both standard and aliased fields
    responseData.mobileNumber = responseData.contact?.mobile;
    responseData.merchantName = responseData.merchant?.name;
    responseData.amount = responseData.pricing?.total;

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/send-otp
export const sendOtp = async (req, res) => {
  try {
    const { requestId, mobile } = req.body;
    // Simulate sending OTP
    console.log(`Sending OTP to ${mobile}`);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/verify-otp
export const verifyOtp = async (req, res) => {
  try {
    const { requestId, otp } = req.body;
    if (otp === '123456') {
      const session = await CheckoutSession.findOneAndUpdate(
        { requestId },
        { state: 'BILLING' }, // Move to next state
        { new: true }
      );
      res.json({ success: true, session });
    } else {
      res.status(400).json({ success: false, error: 'Invalid OTP' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/resend-otp
export const resendOtp = async (req, res) => {
  try {
    // Simulate resending
    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/save-address
export const saveAddress = async (req, res) => {
  try {
    const { requestId, type, address } = req.body;
    
    // Update session state to PAYMENT_SELECTION after address is saved
    const updateField = type === 'BILLING' ? 'billingAddress' : 'shippingAddress';
    const nextState = type === 'BILLING' ? 'SHIPPING' : 'PAYMENT_SELECTION';

    const session = await CheckoutSession.findOneAndUpdate(
      { requestId },
      { 
        [updateField]: address,
        state: nextState 
      },
      { new: true }
    );
    
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/skip-address
export const skipAddress = async (req, res) => {
  try {
    const { requestId } = req.body;
    const session = await CheckoutSession.findOneAndUpdate(
      { requestId },
      { state: 'PAYMENT_SELECTION' },
      { new: true }
    );
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/payment-options
export const getPaymentOptions = async (req, res) => {
  res.json({
    options: [
      { id: 'UPI', name: 'UPI', enabled: true },
      { id: 'CARD', name: 'Credit / Debit Card', enabled: true },
      { id: 'NETBANKING', name: 'Netbanking', enabled: true },
      { id: 'WALLET', name: 'Wallets', enabled: true },
      { id: 'EMI', name: 'EMI', enabled: true },
      { id: 'PAY_LATER', name: 'Pay Later', enabled: true }
    ]
  });
};

// GET /api/offers
export const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find();
    res.json({ offers });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/saved-cards
export const getSavedCards = async (req, res) => {
  try {
    // Hardcoded userId for demo purposes
    const cards = await SavedCard.find({ userId: 'demo-user' });
    res.json({ cards });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/saved-addresses
export const getSavedAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: 'demo-user' });
    res.json({ addresses });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/initiate-payment
export const initiatePayment = async (req, res) => {
  try {
    const { requestId, method, details } = req.body;
    
    const paymentId = 'pay_' + Math.random().toString(36).substr(2, 9);
    
    const newPayment = new Payment({
      sessionId: requestId,
      paymentId,
      amount: 1000, // mock amount
      currency: 'INR',
      method,
      status: 'PENDING'
    });

    await newPayment.save();

    // Update session state to PROCESSING
    await CheckoutSession.findOneAndUpdate(
      { requestId },
      { state: 'PROCESSING', paymentStatus: 'PENDING' }
    );

    // Mock Webhook behavior: Update to SUCCESS after 5 seconds
    setTimeout(async () => {
      await Payment.findOneAndUpdate({ paymentId }, { status: 'SUCCESS' });
      await CheckoutSession.findOneAndUpdate(
        { requestId },
        { state: 'RESULT', paymentStatus: 'SUCCESS' }
      );
      console.log(`Payment ${paymentId} updated to SUCCESS`);
    }, 5000);

    res.json({ success: true, paymentId, status: 'PENDING' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/payment-status/:paymentId
export const getPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findOne({ paymentId: req.params.paymentId });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    
    res.json({ status: payment.status, paymentId: payment.paymentId });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
