
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Registration API
export const registerUser = async (req, res) => {
    try {
        const { name, email, address, password } = req.body;
        if (!name || !email || !address || !password) {
            return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
}

        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length > 0) {
            return res.status(409).json({
                message: 'Email already registered'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (name, email, password, address, role)
            VALUES (?, ?, ?, ?, 'USER')
        `;

        await pool.query(sql, [
            name,
            email,
            hashedPassword,
            address
        ]);

        res.status(201).json({
            success: true,
            message: 'User registered successfully'
        });

    } catch (error) {
        console.error('Registration Error:', error);

        res.status(500).json({
            success: false,
            message: 'Server Error!'
        });
    }
};


// Login API
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login Error:', error);

        res.status(500).json({
            success: false,
            message: 'Server Error!'
        });
    }
};
