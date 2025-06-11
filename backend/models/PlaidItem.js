const mongoose = require('mongoose');

const PlaidItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemId: {
    type: String,
    required: true,
    unique: true
  },
  accessToken: {
    type: String,
    required: true
  },
  institutionId: {
    type: String,
    required: true
  },
  institutionName: {
    type: String,
    required: true
  },
  accounts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  }],
  status: {
    type: String,
    enum: ['good', 'login_required', 'error'],
    default: 'good'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  transactionCursor: {
    type: String,
    default: null
  },
  webhook: {
    type: String,
    default: null
  },
  consentExpirationTime: Date,
  error: {
    type: {
      errorType: String,
      errorCode: String,
      errorMessage: String,
      displayMessage: String,
      status: Number
    },
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PlaidItem', PlaidItemSchema);