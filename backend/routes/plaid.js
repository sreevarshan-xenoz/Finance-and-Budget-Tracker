const express = require('express');
const {
  createLinkToken,
  exchangeToken,
  getAccounts,
  syncTransactions,
  unlinkAccount
} = require('../controllers/plaidController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/create-link-token', createLinkToken);
router.post('/exchange-token', exchangeToken);
router.get('/accounts', getAccounts);
router.post('/sync-transactions', syncTransactions);
router.delete('/items/:itemId', unlinkAccount);

module.exports = router;