import express from 'express';
import protect from '../middleware/auth.js';
import {
    createTrip,
    getMyTrips,
    getTripById,
    updateTrip,
    deleteTrip,
    joinTrip,
    removeMember,
    completeTrip,
    addItineraryItem,
    updateItineraryItem,
    removeItineraryItem,
} from '../controllers/tripController.js';

const router = express.Router();

router.use(protect); // All trip routes are protected

router.route('/').get(getMyTrips).post(createTrip);
router.post('/join/:inviteCode', joinTrip);
router.route('/:id').get(getTripById).put(updateTrip).delete(deleteTrip);
router.patch('/:id/complete', protect, completeTrip);
router.delete('/:id/members/:userId', removeMember);
router.post('/:id/itinerary', protect, addItineraryItem);
router.put('/:id/itinerary/:itemId', protect, updateItineraryItem); // Added this route based on the import
router.delete('/:id/itinerary/:itemId', protect, removeItineraryItem);

export default router;
