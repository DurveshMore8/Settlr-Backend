import Trip from '../models/Trip.js';
import Expense from '../models/Expense.js';

// @desc    Create a new trip
// @route   POST /api/trips
export const createTrip = async (req, res) => {
    try {
        const { name, baseCurrency, budgetPerPerson } = req.body;

        const trip = await Trip.create({
            name,
            baseCurrency,
            budgetPerPerson,
            admin: req.user._id,
            members: [req.user._id], // Admin is automatically a member
        });

        const populated = await trip.populate('admin members', 'name email');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all trips for current user
// @route   GET /api/trips
export const getMyTrips = async (req, res) => {
    try {
        const trips = await Trip.find({ members: req.user._id })
            .populate('admin', 'name email')
            .populate('members', 'name email')
            .sort({ updatedAt: -1 });

        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get trip by ID
// @route   GET /api/trips/:id
export const getTripById = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id)
            .populate('admin', 'name email')
            .populate('members', 'name email');

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Check if user is a member
        const isMember = trip.members.some(
            (m) => m._id.toString() === req.user._id.toString()
        );
        if (!isMember) {
            return res.status(403).json({ message: 'Not a member of this trip' });
        }

        res.json(trip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update trip (admin only)
// @route   PUT /api/trips/:id
export const updateTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (trip.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the admin can update the trip' });
        }

        const { name, baseCurrency, budgetPerPerson } = req.body;
        if (name) trip.name = name;
        if (baseCurrency) trip.baseCurrency = baseCurrency;
        if (budgetPerPerson !== undefined) trip.budgetPerPerson = budgetPerPerson;

        await trip.save();
        const updated = await trip.populate('admin members', 'name email');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete trip and its expenses (admin only)
// @route   DELETE /api/trips/:id
export const deleteTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (trip.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the admin can delete the trip' });
        }

        // Delete all expenses for this trip
        await Expense.deleteMany({ trip: trip._id });
        await trip.deleteOne();

        res.json({ message: 'Trip deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Join trip via invite code
// @route   POST /api/trips/join/:inviteCode
export const joinTrip = async (req, res) => {
    try {
        const trip = await Trip.findOne({ inviteCode: req.params.inviteCode });
        if (!trip) {
            return res.status(404).json({ message: 'Invalid invite code' });
        }

        const alreadyMember = trip.members.some(
            (m) => m.toString() === req.user._id.toString()
        );
        if (alreadyMember) {
            return res.status(400).json({ message: 'Already a member of this trip' });
        }

        trip.members.addToSet(req.user._id);
        await trip.save();

        const populated = await trip.populate('admin members', 'name email');
        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove member from trip (admin only)
// @route   DELETE /api/trips/:id/members/:userId
export const removeMember = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (trip.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the admin can remove members' });
        }

        if (req.params.userId === trip.admin.toString()) {
            return res.status(400).json({ message: 'Cannot remove the admin from the trip' });
        }

        trip.members = trip.members.filter(
            (m) => m.toString() !== req.params.userId
        );
        await trip.save();

        const populated = await trip.populate('admin members', 'name email');
        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Complete trip (admin only)
// @route   PATCH /api/trips/:id/complete
export const completeTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (trip.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the admin can end the trip' });
        }

        trip.status = 'completed';
        await trip.save();

        const populated = await trip.populate('admin members', 'name email');
        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add itinerary item (admin only)
// @route   POST /api/trips/:id/itinerary
export const addItineraryItem = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (trip.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the admin can add itinerary items' });
        }

        const { type, title, details, address, dateTime } = req.body;

        trip.itinerary.push({
            type,
            title,
            details,
            address,
            dateTime
        });

        await trip.save();
        const populated = await trip.populate('admin members', 'name email');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove itinerary item (admin only)
// @route   DELETE /api/trips/:id/itinerary/:itemId
export const removeItineraryItem = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (trip.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the admin can remove itinerary items' });
        }

        trip.itinerary = trip.itinerary.filter(
            (item) => item._id.toString() !== req.params.itemId
        );

        await trip.save();
        const populated = await trip.populate('admin members', 'name email');
        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update itinerary item (admin only)
// @route   PUT /api/trips/:id/itinerary/:itemId
export const updateItineraryItem = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (trip.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the admin can update itinerary items' });
        }

        const itemIndex = trip.itinerary.findIndex(
            (item) => item._id.toString() === req.params.itemId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Itinerary item not found' });
        }

        const { type, title, details, address, dateTime } = req.body;
        if (type) trip.itinerary[itemIndex].type = type;
        if (title) trip.itinerary[itemIndex].title = title;
        if (details !== undefined) trip.itinerary[itemIndex].details = details;
        if (address !== undefined) trip.itinerary[itemIndex].address = address;
        if (dateTime !== undefined) trip.itinerary[itemIndex].dateTime = dateTime;

        await trip.save();
        const populated = await trip.populate('admin members', 'name email');
        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
