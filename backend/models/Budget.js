const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a budget name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please add a budget amount']
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
      'Other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  period: {
    type: String,
    required: [true, 'Please add a budget period'],
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annually']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date'],
    default: Date.now
  },
  endDate: {
    type: Date
  },
  isRecurring: {
    type: Boolean,
    default: true
  },
  alertThreshold: {
    type: Number,
    min: [0, 'Alert threshold must be at least 0%'],
    max: [100, 'Alert threshold cannot exceed 100%'],
    default: 80 // Alert at 80% of budget by default
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for current spending against this budget
BudgetSchema.virtual('currentSpending', {
  ref: 'Transaction',
  localField: 'user',
  foreignField: 'user',
  justOne: false,
  match: function() {
    // This will be populated by the controller based on date range and category
    return {};
  }
});

// Create index for faster queries
BudgetSchema.index({ user: 1, category: 1, period: 1 });

module.exports = mongoose.model('Budget', BudgetSchema);