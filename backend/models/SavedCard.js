import mongoose from 'mongoose';

const savedCardSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  cardNetwork: String, // Visa, MasterCard, RuPay
  bankName: String,
  last4: String,
  cardType: String, // CREDIT, DEBIT
  token: String,
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('SavedCard', savedCardSchema);
