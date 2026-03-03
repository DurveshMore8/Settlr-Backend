import express from 'express';
import protect from '../middleware/auth.js';
import {
    addExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
    getAnalytics
} from '../controllers/expenseController.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

// Routes nested under trips
// POST /api/trips/:tripId/expenses
// GET  /api/trips/:tripId/expenses
router.route('/')
    .post(addExpense)
    .get(getExpenses);

router.get('/analytics', getAnalytics);

// Routes for specific expenses
// These are mapped to /api/expenses in index.js for simplicity
// But the controller also handles them
export const expenseStandaloneRouter = express.Router();
expenseStandaloneRouter.use(protect);
expenseStandaloneRouter.route('/:id')
    .put(updateExpense)
    .delete(deleteExpense);

export default router;
