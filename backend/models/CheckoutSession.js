import mongoose from 'mongoose';

const checkoutSessionSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true
  },
  state: {
    type: String,
    enum: ['CONTACT', 'OTP', 'BILLING', 'SHIPPING', 'PAYMENT_SELECTION', 'PROCESSING', 'RESULT'],
    default: 'CONTACT'
  },
  merchant: {
    name: String,
    logo: String,
    themeColor: String,
    supportEmail: String
  },
  pricing: {
    amount: Number,
    currency: String,
    taxes: Number,
    shipping: Number,
    discount: Number,
    total: Number
  },
  contact: {
    email: String,
    mobile: String,
    countryCode: String
  },
  billingAddress: {
    name: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
    isGST: Boolean,
    gstNumber: String,
    companyName: String
  },
  shippingAddress: {
    name: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  settings: {
    timerSeconds: Number,
    enableOffers: Boolean,
    enableEMI: Boolean,
    enablePayLater: Boolean
  },
  paymentMethod: String, // UPI, CARD, WALLET, etc.
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILURE', null],
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 15 * 60 * 1000) // 15 mins expiry
  }
});

export default mongoose.model('CheckoutSession', checkoutSessionSchema);
