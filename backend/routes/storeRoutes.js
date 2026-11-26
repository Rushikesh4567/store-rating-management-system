import express from 'express';
import {
    getStores,
    getStoreById,
    submitRating,
    updateRating,
    getMyRatings
} from '../controllers/storeController.js';

import authMiddleware from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authMiddleware, authorizeRoles('USER'));

router.get('/', getStores);
router.get('/search', getStores);
router.get('/my-ratings', getMyRatings);
router.post('/ratings', submitRating);
router.put('/ratings/:id', updateRating);
router.get('/:id', getStoreById);

export default router;
