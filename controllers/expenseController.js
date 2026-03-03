import Expense from '../models/Expense.js';
import Trip from '../models/Trip.js';
import { convertAmount } from '../utils/currency.js';
import { simplifyDebts } from '../utils/settlement.js';


// @desc    Add a new expense to a trip
// @route   POST /api/trips/:tripId/expenses
export const addExpense = async (req, res) => {
    try {
        const { description, amount, currency, participants, category, receiptUrl } = req.body;
        const { tripId } = req.params;

        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Check if user is the admin of the trip
        if (trip.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the trip admin can add expenses' });
        }

        // Convert amount to trip base currency
        const convertedAmount = await convertAmount(amount, currency, trip.baseCurrency);

        const { payer } = req.body; // Admin can specify who paid
        const payerId = payer || req.user._id;

        const expense = await Expense.create({
            description,
            amount,
            currency,
            convertedAmount,
            payer: payerId,
            participants: participants || trip.members, // Default to all members if not specified
            trip: tripId,
            category,
            receiptUrl
        });

        const populatedExpense = await expense.populate('payer participants', 'name email');
        res.status(201).json(populatedExpense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all expenses for a trip
// @route   GET /api/trips/:tripId/expenses
export const getExpenses = async (req, res) => {
    try {
        const { tripId } = req.params;

        // Check if trip exists and user is member
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (!trip.members.includes(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized to view expenses for this trip' });
        }

        const expenses = await Expense.find({ trip: tripId })
            .populate('payer participants', 'name email')
            .sort({ createdAt: -1 });

        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
export const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Only trip admin can update
        const trip = await Trip.findById(expense.trip);
        if (trip.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the trip admin can update expenses' });
        }

        const { description, amount, currency, participants, category, receiptUrl, payer } = req.body;

        if (description) expense.description = description;
        if (category) expense.category = category;
        if (receiptUrl !== undefined) expense.receiptUrl = receiptUrl;
        if (participants) expense.participants = participants;
        if (payer) expense.payer = payer;

        // If amount or currency changed, re-convert
        if (amount || currency) {
            const newAmount = amount || expense.amount;
            const newCurrency = currency || expense.currency;
            expense.amount = newAmount;
            expense.currency = newCurrency;
            expense.convertedAmount = await convertAmount(newAmount, newCurrency, trip.baseCurrency);
        }

        await expense.save();
        const updated = await expense.populate('payer participants', 'name email');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
export const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Only trip admin can delete
        const trip = await Trip.findById(expense.trip);
        if (trip.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the trip admin can delete expenses' });
        }

        await expense.deleteOne();
        res.json({ message: 'Expense removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get analytics for a trip
// @route   GET /api/trips/:tripId/analytics
export const getAnalytics = async (req, res) => {
    try {
        const { tripId } = req.params;
        const trip = await Trip.findById(tripId).populate('members', 'name email homeCurrency');

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        const expenses = await Expense.find({ trip: tripId });

        // 1. Budget Stats
        const totalSpent = expenses.reduce((sum, ex) => sum + ex.convertedAmount, 0);
        const totalBudget = trip.budgetPerPerson * trip.members.length;

        // 2. Category Breakdown
        const categoryBreakdown = {};
        expenses.forEach(ex => {
            categoryBreakdown[ex.category] = (categoryBreakdown[ex.category] || 0) + ex.convertedAmount;
        });

        // 3. Member Balances (Who owes what)
        // Positive balance means the person is owed money, negative means they owe money.
        const balances = {};
        trip.members.forEach(member => {
            balances[member._id] = 0;
        });

        expenses.forEach(ex => {
            // Payer gets credit for the whole amount
            balances[ex.payer] += ex.convertedAmount;

            // Each participant owes their share
            const share = ex.convertedAmount / ex.participants.length;
            ex.participants.forEach(pId => {
                balances[pId] -= share;
            });
        });

        // 4. Debt Simplification (Who pays whom)
        const suggestedSettlements = simplifyDebts(balances);

        res.json({
            totalSpent,
            totalBudget,
            remainingBudget: totalBudget - totalSpent,
            categoryBreakdown,
            balances,
            suggestedSettlements,
            tripDetails: {
                name: trip.name,
                baseCurrency: trip.baseCurrency,
                budgetPerPerson: trip.budgetPerPerson
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
