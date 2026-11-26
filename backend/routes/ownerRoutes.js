import express from 'express';

import {
    getOwnerDashboard,
    getOwnerStore,
    getOwnerRatings
} from '../controllers/ownerController.js';

import authMiddleware from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authMiddleware, authorizeRoles('OWNER'));

router.get('/dashboard', getOwnerDashboard);
router.get('/store', getOwnerStore);
router.get('/ratings', getOwnerRatings);

export default router;
