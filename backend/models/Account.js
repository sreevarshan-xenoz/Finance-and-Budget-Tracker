const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plaidItemId: {
    type: String,
    required: false
  },
  plaidAccountId: {
    type: String,
    sparse: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Please add an account name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  officialName: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please add an account type'],
    enum: ['checking', 'savings', 'credit', 'investment', 'loan', 'other']
  },
  subtype: {
    type: String
  },
  balance: {
    current: {
      type: Number,
      default: 0
    },
    available: {
      type: Number,
      default: 0
    },
    limit: {
      type: Number,
      default: null
    },
    isoCurrencyCode: {
      type: String,
      default: 'USD'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  institution: {
    id: String,
    name: String,
    logo: String
  },
  mask: {
    type: String
  },
  isManual: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  includeInNetWorth: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create index for faster queries
AccountSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Account', AccountSchema);