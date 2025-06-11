const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

// @desc    Get all transactions for a user
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    // Build query with filters
    let query = { user: req.user.id };
    
    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      query.date = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.date = { $lte: new Date(req.query.endDate) };
    }
    
    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Type filter (expense, income, transfer)
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    // Account filter
    if (req.query.account) {
      query.account = req.query.account;
    }
    
    // Amount range filter
    if (req.query.minAmount || req.query.maxAmount) {
      query.amount = {};
      if (req.query.minAmount) query.amount.$gte = parseFloat(req.query.minAmount);
      if (req.query.maxAmount) query.amount.$lte = parseFloat(req.query.maxAmount);
    }
    
    // Search by name
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Transaction.countDocuments(query);

    // Execute query with pagination
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('account', 'name type');

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: transactions.length,
      pagination,
      data: transactions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('account', 'name type');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Make sure user owns transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this transaction'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res, next) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;
    req.body.isManual = true;
    
    // If account is provided, verify it belongs to user
    if (req.body.account) {
      const account = await Account.findById(req.body.account);
      
      if (!account) {
        return res.status(404).json({
          success: false,
          error: 'Account not found'
        });
      }
      
      if (account.user.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to use this account'
        });
      }
    }

    const transaction = await Transaction.create(req.body);

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Make sure user owns transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this transaction'
      });
    }
    
    // Don't allow updating plaid transactions except for category and notes
    if (!transaction.isManual && req.body.plaidTransactionId) {
      const allowedUpdates = ['category', 'subcategory', 'notes'];
      const updates = Object.keys(req.body);
      
      for (const update of updates) {
        if (!allowedUpdates.includes(update) && update !== 'user') {
          return res.status(400).json({
            success: false,
            error: `Cannot update ${update} for synced transactions`
          });
        }
      }
    }

    transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Make sure user owns transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this transaction'
      });
    }
    
    // Don't allow deleting plaid transactions
    if (!transaction.isManual) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete synced transactions'
      });
    }

    await transaction.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};