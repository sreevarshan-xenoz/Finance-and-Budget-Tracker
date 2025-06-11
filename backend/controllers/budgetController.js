const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get all budgets for a user
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res, next) => {
  try {
    // Build query with filters
    let query = { user: req.user.id };
    
    // Filter by active status
    if (req.query.isActive) {
      query.isActive = req.query.isActive === 'true';
    }
    
    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by period
    if (req.query.period) {
      query.period = req.query.period;
    }
    
    // Filter by date range (budgets that overlap with the given range)
    if (req.query.startDate || req.query.endDate) {
      const dateQuery = {};
      
      if (req.query.startDate) {
        dateQuery.endDate = { $gte: new Date(req.query.startDate) };
      }
      
      if (req.query.endDate) {
        dateQuery.startDate = { $lte: new Date(req.query.endDate) };
      }
      
      query = { ...query, ...dateQuery };
    }

    // Execute query
    const budgets = await Budget.find(query).sort({ startDate: -1 });

    // Calculate current spending for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const budgetObj = budget.toObject();
        
        // Determine date range for spending calculation
        const startDate = budget.startDate;
        const endDate = budget.endDate || new Date();
        
        // Query transactions for this budget's category within the date range
        const transactions = await Transaction.find({
          user: req.user.id,
          category: budget.category,
          date: { $gte: startDate, $lte: endDate },
          type: 'expense' // Only count expenses against budget
        });
        
        // Calculate total spending
        const spending = transactions.reduce((total, transaction) => {
          return total + transaction.amount;
        }, 0);
        
        // Add spending to budget object
        budgetObj.currentSpending = spending;
        budgetObj.percentUsed = (spending / budget.amount) * 100;
        
        return budgetObj;
      })
    );

    res.status(200).json({
      success: true,
      count: budgetsWithSpending.length,
      data: budgetsWithSpending
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single budget
// @route   GET /api/budgets/:id
// @access  Private
exports.getBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    // Make sure user owns budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this budget'
      });
    }
    
    // Calculate current spending for this budget
    const budgetObj = budget.toObject();
    
    // Determine date range for spending calculation
    const startDate = budget.startDate;
    const endDate = budget.endDate || new Date();
    
    // Query transactions for this budget's category within the date range
    const transactions = await Transaction.find({
      user: req.user.id,
      category: budget.category,
      date: { $gte: startDate, $lte: endDate },
      type: 'expense' // Only count expenses against budget
    });
    
    // Calculate total spending
    const spending = transactions.reduce((total, transaction) => {
      return total + transaction.amount;
    }, 0);
    
    // Add spending to budget object
    budgetObj.currentSpending = spending;
    budgetObj.percentUsed = (spending / budget.amount) * 100;
    budgetObj.transactions = transactions;

    res.status(200).json({
      success: true,
      data: budgetObj
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new budget
// @route   POST /api/budgets
// @access  Private
exports.createBudget = async (req, res, next) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;
    
    // Check if there's already an active budget for this category and period
    const existingBudget = await Budget.findOne({
      user: req.user.id,
      category: req.body.category,
      period: req.body.period,
      isActive: true,
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: new Date() } }
      ]
    });
    
    if (existingBudget) {
      return res.status(400).json({
        success: false,
        error: `You already have an active ${req.body.period} budget for ${req.body.category}`
      });
    }

    const budget = await Budget.create(req.body);

    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
exports.updateBudget = async (req, res, next) => {
  try {
    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    // Make sure user owns budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this budget'
      });
    }
    
    // If changing category or period, check for conflicts
    if ((req.body.category && req.body.category !== budget.category) ||
        (req.body.period && req.body.period !== budget.period)) {
      
      const existingBudget = await Budget.findOne({
        user: req.user.id,
        category: req.body.category || budget.category,
        period: req.body.period || budget.period,
        isActive: true,
        _id: { $ne: req.params.id }, // Exclude current budget
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: new Date() } }
        ]
      });
      
      if (existingBudget) {
        return res.status(400).json({
          success: false,
          error: `You already have an active ${req.body.period || budget.period} budget for ${req.body.category || budget.category}`
        });
      }
    }

    budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    // Make sure user owns budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this budget'
      });
    }

    await budget.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};