import express from 'express';
import {
    getDashboard,
    getAllUsers,
    createUser,
    getUserById,
    updateUser,
    getAllStores,
    createStore,
    getStoreById,
    updateStore,
    deleteStore
} from '../controllers/adminController.js';

import authMiddleware from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authMiddleware, authorizeRoles('ADMIN'));

router.get('/dashboard', getDashboard);

router.get('/users', getAllUsers);
router.post('/users', createUser);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);

router.get('/stores', getAllStores);
router.post('/stores', createStore);
router.get('/stores/:id', getStoreById);
router.put('/stores/:id', updateStore);
router.delete('/stores/:id', deleteStore);

export default router;
