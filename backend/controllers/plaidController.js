const plaid = require('plaid');
const User = require('../models/User');
const PlaidItem = require('../models/PlaidItem');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// Initialize Plaid client
const plaidClient = new plaid.Client({
  clientID: process.env.PLAID_CLIENT_ID,
  secret: process.env.PLAID_SECRET,
  env: plaid.environments[process.env.PLAID_ENV || 'sandbox'],
  options: {
    version: '2020-09-14'
  }
});

// @desc    Create a link token for Plaid Link
// @route   POST /api/plaid/create-link-token
// @access  Private
exports.createLinkToken = async (req, res, next) => {
  try {
    const { id } = req.user;
    
    const configs = {
      user: {
        client_user_id: id
      },
      client_name: 'Finance and Budget Tracker',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en'
    };

    const createTokenResponse = await plaidClient.createLinkToken(configs);
    
    res.status(200).json({
      success: true,
      link_token: createTokenResponse.link_token
    });
  } catch (err) {
    console.error('Error creating link token:', err);
    next(err);
  }
};

// @desc    Exchange public token for access token
// @route   POST /api/plaid/exchange-token
// @access  Private
exports.exchangeToken = async (req, res, next) => {
  try {
    const { public_token, institution } = req.body;
    
    // Exchange public token for access token
    const tokenResponse = await plaidClient.exchangePublicToken(public_token);
    const accessToken = tokenResponse.access_token;
    const itemId = tokenResponse.item_id;
    
    // Get institution details
    const institutionId = institution.institution_id;
    const institutionName = institution.name;
    
    // Create Plaid item in database
    const plaidItem = await PlaidItem.create({
      user: req.user.id,
      itemId,
      accessToken,
      institutionId,
      institutionName,
      status: 'good'
    });
    
    // Add Plaid item to user
    await User.findByIdAndUpdate(req.user.id, {
      $push: { plaidItems: plaidItem._id }
    });
    
    // Get accounts associated with this item
    await syncAccounts(plaidItem, req.user.id);
    
    res.status(201).json({
      success: true,
      data: {
        item_id: itemId,
        institution_name: institutionName
      }
    });
  } catch (err) {
    console.error('Error exchanging token:', err);
    next(err);
  }
};

// @desc    Get all accounts for a user
// @route   GET /api/plaid/accounts
// @access  Private
exports.getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({ user: req.user.id }).sort({ institution: 1, type: 1 });
    
    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Sync transactions for all linked accounts
// @route   POST /api/plaid/sync-transactions
// @access  Private
exports.syncTransactions = async (req, res, next) => {
  try {
    // Get all Plaid items for user
    const plaidItems = await PlaidItem.find({ user: req.user.id });
    
    if (plaidItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No linked bank accounts found'
      });
    }
    
    let totalNewTransactions = 0;
    let totalUpdatedTransactions = 0;
    let totalRemovedTransactions = 0;
    
    // Process each Plaid item
    for (const item of plaidItems) {
      const syncResults = await syncTransactionsForItem(item, req.user.id);
      
      totalNewTransactions += syncResults.added;
      totalUpdatedTransactions += syncResults.modified;
      totalRemovedTransactions += syncResults.removed;
    }
    
    res.status(200).json({
      success: true,
      data: {
        added: totalNewTransactions,
        modified: totalUpdatedTransactions,
        removed: totalRemovedTransactions
      }
    });
  } catch (err) {
    console.error('Error syncing transactions:', err);
    next(err);
  }
};

// @desc    Unlink a bank account
// @route   DELETE /api/plaid/items/:itemId
// @access  Private
exports.unlinkAccount = async (req, res, next) => {
  try {
    const plaidItem = await PlaidItem.findOne({
      itemId: req.params.itemId,
      user: req.user.id
    });
    
    if (!plaidItem) {
      return res.status(404).json({
        success: false,
        error: 'Plaid item not found'
      });
    }
    
    // Remove Plaid item from user
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { plaidItems: plaidItem._id }
    });
    
    // Get associated accounts
    const accounts = await Account.find({ plaidItemId: plaidItem.itemId });
    const accountIds = accounts.map(account => account._id);
    
    // Mark transactions as deleted (don't actually delete them)
    await Transaction.updateMany(
      { account: { $in: accountIds } },
      { isDeleted: true }
    );
    
    // Mark accounts as inactive
    await Account.updateMany(
      { plaidItemId: plaidItem.itemId },
      { isActive: false }
    );
    
    // Delete Plaid item
    await plaidItem.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// Helper function to sync accounts for a Plaid item
async function syncAccounts(plaidItem, userId) {
  try {
    // Get accounts from Plaid
    const accountsResponse = await plaidClient.getAccounts(plaidItem.accessToken);
    const plaidAccounts = accountsResponse.accounts;
    
    // Process each account
    for (const plaidAccount of plaidAccounts) {
      // Check if account already exists
      let account = await Account.findOne({ plaidAccountId: plaidAccount.account_id });
      
      if (account) {
        // Update existing account
        account.balance.current = plaidAccount.balances.current;
        account.balance.available = plaidAccount.balances.available;
        account.balance.limit = plaidAccount.balances.limit;
        account.balance.isoCurrencyCode = plaidAccount.balances.iso_currency_code;
        account.balance.lastUpdated = Date.now();
        await account.save();
      } else {
        // Create new account
        account = await Account.create({
          user: userId,
          plaidItemId: plaidItem.itemId,
          plaidAccountId: plaidAccount.account_id,
          name: plaidAccount.name,
          officialName: plaidAccount.official_name,
          type: plaidAccount.type,
          subtype: plaidAccount.subtype,
          mask: plaidAccount.mask,
          balance: {
            current: plaidAccount.balances.current,
            available: plaidAccount.balances.available,
            limit: plaidAccount.balances.limit,
            isoCurrencyCode: plaidAccount.balances.iso_currency_code,
            lastUpdated: Date.now()
          },
          institution: {
            id: plaidItem.institutionId,
            name: plaidItem.institutionName
          },
          isManual: false,
          isActive: true
        });
        
        // Add account to Plaid item
        plaidItem.accounts.push(account._id);
      }
    }
    
    await plaidItem.save();
    return plaidItem.accounts.length;
  } catch (err) {
    console.error('Error syncing accounts:', err);
    throw err;
  }
}

// Helper function to sync transactions for a Plaid item
async function syncTransactionsForItem(plaidItem, userId) {
  try {
    // Get cursor for this item
    let cursor = plaidItem.transactionCursor;
    
    // Set up counters
    let added = 0;
    let modified = 0;
    let removed = 0;
    let hasMore = true;
    
    // Process transactions in batches until no more are available
    while (hasMore) {
      let options = {};
      
      if (cursor) {
        options.cursor = cursor;
      } else {
        // Initial sync - get transactions from the last 30 days
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const endDate = new Date().toISOString().split('T')[0];
        options = { start_date: startDate, end_date: endDate };
      }
      
      // Get transactions from Plaid
      const response = cursor
        ? await plaidClient.getTransactionsRefresh(plaidItem.accessToken, options)
        : await plaidClient.getTransactions(plaidItem.accessToken, options.start_date, options.end_date);
      
      // Update cursor
      if (response.next_cursor) {
        cursor = response.next_cursor;
        plaidItem.transactionCursor = cursor;
        await plaidItem.save();
      }
      
      hasMore = response.has_more;
      
      // Process added transactions
      if (response.added && response.added.length > 0) {
        added += await processAddedTransactions(response.added, plaidItem, userId);
      }
      
      // Process modified transactions
      if (response.modified && response.modified.length > 0) {
        modified += await processModifiedTransactions(response.modified, userId);
      }
      
      // Process removed transactions
      if (response.removed && response.removed.length > 0) {
        removed += await processRemovedTransactions(response.removed, userId);
      }
      
      // If no more transactions, break the loop
      if (!hasMore) break;
    }
    
    return { added, modified, removed };
  } catch (err) {
    console.error('Error syncing transactions for item:', err);
    throw err;
  }
}

// Helper function to process added transactions
async function processAddedTransactions(transactions, plaidItem, userId) {
  try {
    let addedCount = 0;
    
    for (const transaction of transactions) {
      // Check if transaction already exists
      const existingTransaction = await Transaction.findOne({
        plaidTransactionId: transaction.transaction_id
      });
      
      if (existingTransaction) continue;
      
      // Get account for this transaction
      const account = await Account.findOne({
        plaidAccountId: transaction.account_id
      });
      
      if (!account) continue;
      
      // Determine transaction type
      let type = 'expense';
      if (transaction.amount < 0) {
        type = 'income';
        transaction.amount = Math.abs(transaction.amount);
      }
      
      // Map Plaid category to our category system
      let category = 'Other';
      if (transaction.category && transaction.category.length > 0) {
        category = mapPlaidCategory(transaction.category[0]);
      }
      
      // Create new transaction
      await Transaction.create({
        user: userId,
        account: account._id,
        plaidTransactionId: transaction.transaction_id,
        name: transaction.name,
        amount: Math.abs(transaction.amount),
        date: new Date(transaction.date),
        category,
        subcategory: transaction.category ? transaction.category[1] : null,
        type,
        notes: '',
        isRecurring: false,
        location: {
          merchant: transaction.merchant_name,
          address: transaction.location?.address,
          city: transaction.location?.city,
          region: transaction.location?.region,
          postalCode: transaction.location?.postal_code,
          country: transaction.location?.country
        },
        isManual: false
      });
      
      addedCount++;
    }
    
    return addedCount;
  } catch (err) {
    console.error('Error processing added transactions:', err);
    throw err;
  }
}

// Helper function to process modified transactions
async function processModifiedTransactions(transactions, userId) {
  try {
    let modifiedCount = 0;
    
    for (const transaction of transactions) {
      // Find existing transaction
      const existingTransaction = await Transaction.findOne({
        plaidTransactionId: transaction.transaction_id
      });
      
      if (!existingTransaction) continue;
      
      // Determine transaction type
      let type = 'expense';
      if (transaction.amount < 0) {
        type = 'income';
        transaction.amount = Math.abs(transaction.amount);
      }
      
      // Map Plaid category to our category system
      let category = existingTransaction.category;
      if (transaction.category && transaction.category.length > 0) {
        const mappedCategory = mapPlaidCategory(transaction.category[0]);
        if (mappedCategory !== 'Other') {
          category = mappedCategory;
        }
      }
      
      // Update transaction
      existingTransaction.name = transaction.name;
      existingTransaction.amount = Math.abs(transaction.amount);
      existingTransaction.date = new Date(transaction.date);
      existingTransaction.category = category;
      existingTransaction.subcategory = transaction.category ? transaction.category[1] : existingTransaction.subcategory;
      existingTransaction.type = type;
      existingTransaction.location = {
        merchant: transaction.merchant_name,
        address: transaction.location?.address,
        city: transaction.location?.city,
        region: transaction.location?.region,
        postalCode: transaction.location?.postal_code,
        country: transaction.location?.country
      };
      
      await existingTransaction.save();
      modifiedCount++;
    }
    
    return modifiedCount;
  } catch (err) {
    console.error('Error processing modified transactions:', err);
    throw err;
  }
}

// Helper function to process removed transactions
async function processRemovedTransactions(transactions, userId) {
  try {
    let removedCount = 0;
    
    for (const transaction of transactions) {
      // Find and mark transaction as deleted
      const result = await Transaction.updateOne(
        { plaidTransactionId: transaction.transaction_id },
        { isDeleted: true }
      );
      
      if (result.nModified > 0) {
        removedCount++;
      }
    }
    
    return removedCount;
  } catch (err) {
    console.error('Error processing removed transactions:', err);
    throw err;
  }
}

// Helper function to map Plaid categories to our category system
function mapPlaidCategory(plaidCategory) {
  const categoryMap = {
    'Food and Drink': 'Food',
    'Travel': 'Transportation',
    'Transportation': 'Transportation',
    'Payment': 'Debt',
    'Shops': 'Personal',
    'Recreation': 'Entertainment',
    'Healthcare': 'Healthcare',
    'Service': 'Utilities',
    'Community': 'Other',
    'Bank Fees': 'Other',
    'Cash Advance': 'Other',
    'Interest': 'Income',
    'Transfer': 'Transfer',
    'Rent': 'Housing',
    'Mortgage': 'Housing',
    'Loan': 'Debt',
    'Tax': 'Other',
    'Insurance': 'Insurance',
    'Subscription': 'Personal',
    'Income': 'Income',
    'Education': 'Education'
  };
  
  return categoryMap[plaidCategory] || 'Other';
}