import mongoose from 'mongoose';

const CATEGORIES = [
    'Food',
    'Transport',
    'Lodging',
    'Activities',
    'Shopping',
    'General',
    'Other',
];

const expenseSchema = new mongoose.Schema(
    {
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0, 'Amount cannot be negative'],
        },
        currency: {
            type: String,
            required: [true, 'Currency is required'],
            uppercase: true,
            trim: true,
        },
        convertedAmount: {
            type: Number,
            required: [true, 'Converted amount is required'],
            min: [0, 'Converted amount cannot be negative'],
        },
        payer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Payer is required'],
        },
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        trip: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Trip',
            required: [true, 'Trip is required'],
        },
        category: {
            type: String,
            enum: CATEGORIES,
            default: 'General',
        },
        receiptUrl: {
            type: String,
            trim: true,
            default: null,
        },
    },
    { timestamps: true }
);

const Expense = mongoose.model('Expense', expenseSchema);
export { CATEGORIES };
export default Expense;
