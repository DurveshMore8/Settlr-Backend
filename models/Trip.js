import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const tripSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Trip name is required'],
            trim: true,
        },
        baseCurrency: {
            type: String,
            required: [true, 'Base currency is required'],
            uppercase: true,
            trim: true,
        },
        budgetPerPerson: {
            type: Number,
            default: 0,
            min: [0, 'Budget cannot be negative'],
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Admin is required'],
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        inviteCode: {
            type: String,
            unique: true,
            default: () => uuidv4().slice(0, 8),
        },
        status: {
            type: String,
            enum: ['active', 'completed'],
            default: 'active',
        },
        invitations: [
            {
                email: {
                    type: String,
                    required: true,
                    lowercase: true,
                    trim: true,
                },
                status: {
                    type: String,
                    enum: ['pending', 'accepted'],
                    default: 'pending',
                },
                sentAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        itinerary: [
            {
                type: {
                    type: String,
                    enum: ['Flight', 'Train', 'Bus', 'Hotel', 'Activity', 'Other'],
                    required: true,
                },
                title: {
                    type: String,
                    required: true,
                    trim: true,
                },
                details: {
                    type: String,
                    trim: true,
                },
                address: {
                    type: String,
                    trim: true,
                },
                dateTime: {
                    type: Date,
                },
            },
        ],
    },
    { timestamps: true }
);

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
