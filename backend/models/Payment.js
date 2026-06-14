import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  amount: Number,
  currency: String,
  method: String,
  status: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILURE', 'TIMEOUT'],
    default: 'PENDING'
  },
  transactionDetails: {
    bankReference: String,
    timestamp: Date,
    errorCode: String,
    errorMessage: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Payment', paymentSchema);
