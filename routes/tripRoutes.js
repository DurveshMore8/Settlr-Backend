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
    sendInvitations,
    getInvitations,
    resendInvitation,
} from '../controllers/tripController.js';

const router = express.Router();

router.use(protect); // All trip routes are protected

router.route('/').get(getMyTrips).post(createTrip);
router.post('/join/:inviteCode', joinTrip);
router.route('/:id').get(getTripById).put(updateTrip).delete(deleteTrip);
router.patch('/:id/complete', completeTrip);
router.delete('/:id/members/:userId', removeMember);
router.route('/:id/invitations').get(getInvitations).post(sendInvitations);
router.post('/:id/invitations/resend', resendInvitation);
router.post('/:id/itinerary', addItineraryItem);
router.put('/:id/itinerary/:itemId', updateItineraryItem);
router.delete('/:id/itinerary/:itemId', removeItineraryItem);

export default router;
