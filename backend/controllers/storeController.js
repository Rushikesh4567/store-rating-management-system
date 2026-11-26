import pool from '../config/db.js';

// GET ALL STORES / SEARCH STORES
export const getStores = async (req, res) => {
    try {
        const { search, sortBy, order } = req.query;

        let sql = `
            SELECT s.id, s.name, s.email, s.address,
                   COALESCE(AVG(r.rating), 0) AS averageRating,
                   MAX(CASE WHEN r.user_id = ? THEN r.rating END) AS userRating
            FROM stores s
            LEFT JOIN ratings r ON s.id = r.store_id
        `;

        const values = [req.user.id];

        if (search) {
            sql += ' WHERE s.name LIKE ? OR s.address LIKE ?';
            values.push(`%${search}%`, `%${search}%`);
        }

        const allowedSort = ['name', 'address'];
        const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'name';
        const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

        sql += ` GROUP BY s.id ORDER BY s.${sortColumn} ${sortOrder}`;

        const [stores] = await pool.query(sql, values);

        res.json({ success: true, stores });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// GET SINGLE STORE
export const getStoreById = async (req, res) => {
    try {
        const [stores] = await pool.query(
            `SELECT s.id, s.name, s.email, s.address,
                    COALESCE(AVG(r.rating), 0) AS averageRating,
                    MAX(CASE WHEN r.user_id = ? THEN r.rating END) AS userRating
             FROM stores s
             LEFT JOIN ratings r ON s.id = r.store_id
             WHERE s.id = ?
             GROUP BY s.id`,
            [req.user.id, req.params.id]
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


// SUBMIT OR UPDATE RATING
export const submitRating = async (req, res) => {
    try {
        const { store_id, rating } = req.body;

        if (!store_id || rating === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Store ID and rating are required'
            });
        }

        if (!Number.isInteger(Number(rating)) ||
            Number(rating) < 1 ||
            Number(rating) > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be an integer between 1 and 5'
            });
        }

        const [stores] = await pool.query(
            'SELECT id FROM stores WHERE id = ?',
            [store_id]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        await pool.query(
            `INSERT INTO ratings (user_id, store_id, rating)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE
             rating = VALUES(rating),
             updated_at = CURRENT_TIMESTAMP`,
            [req.user.id, store_id, Number(rating)]
        );

        res.status(200).json({
            success: true,
            message: 'Rating submitted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// UPDATE RATING BY RATING ID
export const updateRating = async (req, res) => {
    try {
        const { rating } = req.body;

        if (
            rating === undefined ||
            !Number.isInteger(Number(rating)) ||
            Number(rating) < 1 ||
            Number(rating) > 5
        ) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be an integer between 1 and 5'
            });
        }

        const [result] = await pool.query(
            `UPDATE ratings
             SET rating = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND user_id = ?`,
            [Number(rating), req.params.id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found'
            });
        }

        res.json({
            success: true,
            message: 'Rating updated successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// GET MY RATINGS
export const getMyRatings = async (req, res) => {
    try {
        const [ratings] = await pool.query(
            `SELECT r.id, r.rating, r.created_at, r.updated_at,
                    s.id AS storeId, s.name AS storeName, s.address
             FROM ratings r
             JOIN stores s ON r.store_id = s.id
             WHERE r.user_id = ?
             ORDER BY r.updated_at DESC`,
            [req.user.id]
        );

        res.json({ success: true, ratings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
