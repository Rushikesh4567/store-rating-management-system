import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

// GET ADMIN DASHBOARD
export const getDashboard = async (req, res) => {
    try {
        const [[users]] = await pool.query(
            'SELECT COUNT(*) AS totalUsers FROM users'
        );

        const [[stores]] = await pool.query(
            'SELECT COUNT(*) AS totalStores FROM stores'
        );

        const [[ratings]] = await pool.query(
            'SELECT COUNT(*) AS totalRatings FROM ratings'
        );

        res.json({
            success: true,
            dashboard: {
                totalUsers: users.totalUsers,
                totalStores: stores.totalStores,
                totalRatings: ratings.totalRatings
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// GET ALL USERS WITH FILTERS
export const getAllUsers = async (req, res) => {
    try {
        const { name, email, address, role, sortBy, order } = req.query;

        let sql = `
            SELECT id, name, email, address, role, created_at
            FROM users
            WHERE 1=1
        `;

        const values = [];

        if (name) {
            sql += ' AND name LIKE ?';
            values.push(`%${name}%`);
        }

        if (email) {
            sql += ' AND email LIKE ?';
            values.push(`%${email}%`);
        }

        if (address) {
            sql += ' AND address LIKE ?';
            values.push(`%${address}%`);
        }

        if (role) {
            sql += ' AND role = ?';
            values.push(role);
        }

        const allowedSort = ['name', 'email', 'address', 'role', 'created_at'];
        const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'created_at';
        const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

        sql += ` ORDER BY ${sortColumn} ${sortOrder}`;

        const [users] = await pool.query(sql, values);

        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// CREATE USER / ADMIN / OWNER
export const createUser = async (req, res) => {
    try {
        const { name, email, address, password, role } = req.body;

        if (!name || !email || !address || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (!['ADMIN', 'USER', 'OWNER'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        if (name.length < 20 || name.length > 60) {
            return res.status(400).json({
                success: false,
                message: 'Name must be 20 to 60 characters'
            });
        }

        if (address.length > 400) {
            return res.status(400).json({
                success: false,
                message: 'Address cannot exceed 400 characters'
            });
        }

        if (
            password.length < 8 ||
            password.length > 16 ||
            !/[A-Z]/.test(password) ||
            !/[!@#$%^&*]/.test(password)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Password must be 8-16 characters with uppercase and special character'
            });
        }

        const [existing] = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            `INSERT INTO users (name, email, password, address, role)
             VALUES (?, ?, ?, ?, ?)`,
            [name, email, hashedPassword, address, role]
        );

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            userId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// GET SINGLE USER DETAILS
export const getUserById = async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT id, name, email, address, role, created_at
             FROM users WHERE id = ?`,
            [req.params.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let storeRatings = [];

        if (users[0].role === 'OWNER') {
            const [rows] = await pool.query(
                `SELECT s.id AS storeId, s.name AS storeName,
                        u.name AS userName, u.email AS userEmail,
                        r.rating, r.created_at
                 FROM stores s
                 JOIN ratings r ON s.id = r.store_id
                 JOIN users u ON r.user_id = u.id
                 WHERE s.owner_id = ?`,
                [req.params.id]
            );

            storeRatings = rows;
        }

        res.json({
            success: true,
            user: users[0],
            storeRatings
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// UPDATE USER DETAILS
export const updateUser = async (req, res) => {
    try {
        const { name, email, address, role } = req.body;
        const id = req.params.id;

        if (role && !['ADMIN', 'USER', 'OWNER'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        const [result] = await pool.query(
            `UPDATE users
             SET name = COALESCE(?, name),
                 email = COALESCE(?, email),
                 address = COALESCE(?, address),
                 role = COALESCE(?, role)
             WHERE id = ?`,
            [name || null, email || null, address || null, role || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found or no changes made'
            });
        }

        res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            });
        }

        res.status(500).json({ success: false, message: error.message });
    }
};


// GET ALL STORES
export const getAllStores = async (req, res) => {
    try {
        const { name, email, address, sortBy, order } = req.query;

        let sql = `
            SELECT s.id, s.name, s.email, s.address, s.owner_id,
                   COALESCE(AVG(r.rating), 0) AS averageRating
            FROM stores s
            LEFT JOIN ratings r ON s.id = r.store_id
            WHERE 1=1
        `;

        const values = [];

        if (name) {
            sql += ' AND s.name LIKE ?';
            values.push(`%${name}%`);
        }

        if (email) {
            sql += ' AND s.email LIKE ?';
            values.push(`%${email}%`);
        }

        if (address) {
            sql += ' AND s.address LIKE ?';
            values.push(`%${address}%`);
        }

        const allowedSort = ['name', 'email', 'address'];
        const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'name';
        const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

        sql += ` GROUP BY s.id ORDER BY s.${sortColumn} ${sortOrder}`;

        const [stores] = await pool.query(sql, values);

        res.json({ success: true, stores });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// CREATE STORE
export const createStore = async (req, res) => {
    try {
        const { name, email, address, owner_id } = req.body;

        if (!name || !email || !address || !owner_id) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, address and owner_id are required'
            });
        }

        const [owners] = await pool.query(
            "SELECT id FROM users WHERE id = ? AND role = 'OWNER'",
            [owner_id]
        );

        if (owners.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid store owner not found'
            });
        }

        const [result] = await pool.query(
            `INSERT INTO stores (name, email, address, owner_id)
             VALUES (?, ?, ?, ?)`,
            [name, email, address, owner_id]
        );

        res.status(201).json({
            success: true,
            message: 'Store created successfully',
            storeId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// GET STORE DETAILS
export const getStoreById = async (req, res) => {
    try {
        const [stores] = await pool.query(
            `SELECT s.id, s.name, s.email, s.address, s.owner_id,
                    COALESCE(AVG(r.rating), 0) AS averageRating
             FROM stores s
             LEFT JOIN ratings r ON s.id = r.store_id
             WHERE s.id = ?
             GROUP BY s.id`,
            [req.params.id]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        res.json({ success: true, store: stores[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// UPDATE STORE
export const updateStore = async (req, res) => {
    try {
        const { name, email, address, owner_id } = req.body;

        if (owner_id) {
            const [owners] = await pool.query(
                "SELECT id FROM users WHERE id = ? AND role = 'OWNER'",
                [owner_id]
            );

            if (owners.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid store owner not found'
                });
            }
        }

        const [result] = await pool.query(
            `UPDATE stores
             SET name = COALESCE(?, name),
                 email = COALESCE(?, email),
                 address = COALESCE(?, address),
                 owner_id = COALESCE(?, owner_id)
             WHERE id = ?`,
            [name || null, email || null, address || null,
             owner_id || null, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found or no changes made'
            });
        }

        res.json({ success: true, message: 'Store updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// DELETE STORE
export const deleteStore = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query(
            'DELETE FROM ratings WHERE store_id = ?',
            [req.params.id]
        );

        const [result] = await connection.query(
            'DELETE FROM stores WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        await connection.commit();

        res.json({ success: true, message: 'Store deleted successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};
