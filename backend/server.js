import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import authMiddleware from './middleware/authMiddleware.js';
import adminRoutes from './routes/adminRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Authentication routes
app.use('/api/auth', authRoutes);

app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/owner', ownerRoutes);

// Home route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Store Rating System API is running!'
    });
});

// Protected test route
app.get('/api/protected', authMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'You have accessed a protected route!',
        user: req.user
    });
});

const PORT = process.env.PORT || 5000;

console.log('Port:', process.env.PORT);
console.log('Application:', process.env.APP_NAME);

app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});
