import mongoose from 'mongoose';

const settlementSchema = new mongoose.Schema(
    {
        trip: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Trip',
            required: [true, 'Trip is required'],
        },
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Payer (from) is required'],
        },
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Recipient (to) is required'],
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0.01, 'Amount must be positive'],
        },
        method: {
            type: String,
            enum: ['Venmo', 'Cash', 'Bank Transfer', 'PayPal', 'UPI', 'Other'],
            default: 'Cash',
        },
        note: {
            type: String,
            trim: true,
            default: '',
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed'],
            default: 'pending',
        },
        confirmedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

const Settlement = mongoose.model('Settlement', settlementSchema);
export default Settlement;
