import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.status(200).json({
        success: true,
        messege: 'Store Rating System API is running!'
    })
});

const PORT = process.env.PORT || 5000;

console.log("Port:", process.env.PORT);
console.log("Application:", process.env.APP_NAME);


app.get('/api/health/db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 AS result');

        res.status(200).json({
            success: true,
            message: 'Database connected successfully!',
            data: rows
        });

    } catch (error) {
        console.error('Database connection error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Database connection failed!'
        });
    }
});

app.listen(PORT,()=>{
    console.log(`Server is running at port ${PORT}`);
})

