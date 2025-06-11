const express = require('express');
const {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getBudgets)
  .post(protect, createBudget);

router
  .route('/:id')
  .get(protect, getBudget)
  .put(protect, updateBudget)
  .delete(protect, deleteBudget);

module.exports = router;