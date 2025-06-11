const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: false // Not required for manual transactions
  },
  plaidTransactionId: {
    type: String,
    sparse: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Please add a transaction name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please add a transaction amount']
  },
  date: {
    type: Date,
    required: [true, 'Please add a transaction date'],
    default: Date.now
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Housing',
      'Transportation',
      'Food',
      'Utilities',
      'Insurance',
      'Healthcare',
      'Savings',
      'Personal',
      'Entertainment',
      'Education',
      'Debt',
      'Income',
      'Other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please add a transaction type'],
    enum: ['expense', 'income', 'transfer']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually', null],
    default: null
  },
  location: {
    type: {
      merchant: String,
      address: String,
      city: String,
      region: String,
      postalCode: String,
      country: String,
      lat: Number,
      lon: Number
    },
    default: null
  },
  isManual: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create index for faster queries
TransactionSchema.index({ user: 1, date: -1 });
TransactionSchema.index({ category: 1, date: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);