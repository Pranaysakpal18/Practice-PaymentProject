import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  discountType: {
    type: String,
    enum: ['PERCENTAGE', 'FLAT'],
    default: 'FLAT'
  },
  discountValue: Number,
  minOrderValue: Number,
  maxDiscount: Number,
  validTill: Date,
  applicablePaymentMethods: [String], // e.g., ['UPI', 'CREDIT_CARD']
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Offer', offerSchema);
