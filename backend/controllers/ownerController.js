import pool from '../config/db.js';

// GET OWNER DASHBOARD
export const getOwnerDashboard = async (req, res) => {
    try {
        const [stores] = await pool.query(
            `SELECT s.id, s.name, s.email, s.address,
                    COALESCE(AVG(r.rating), 0) AS averageRating,
                    COUNT(r.id) AS totalRatings
             FROM stores s
             LEFT JOIN ratings r ON s.id = r.store_id
             WHERE s.owner_id = ?
             GROUP BY s.id`,
            [req.user.id]
        );

        res.json({
            success: true,
            stores
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// GET OWNER'S STORE DETAILS
export const getOwnerStore = async (req, res) => {
    try {
        const [stores] = await pool.query(
            `SELECT s.id, s.name, s.email, s.address,
                    COALESCE(AVG(r.rating), 0) AS averageRating,
                    COUNT(r.id) AS totalRatings
             FROM stores s
             LEFT JOIN ratings r ON s.id = r.store_id
             WHERE s.owner_id = ?
             GROUP BY s.id`,
            [req.user.id]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No store assigned to this owner'
            });
        }

        res.json({ success: true, stores });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// GET USERS WHO RATED OWNER'S STORE
export const getOwnerRatings = async (req, res) => {
    try {
        const [ratings] = await pool.query(
            `SELECT u.id AS userId, u.name AS userName,
                    u.email AS userEmail, r.rating,
                    r.created_at, r.updated_at,
                    s.id AS storeId, s.name AS storeName
             FROM ratings r
             JOIN stores s ON r.store_id = s.id
             JOIN users u ON r.user_id = u.id
             WHERE s.owner_id = ?
             ORDER BY r.updated_at DESC`,
            [req.user.id]
        );

        res.json({ success: true, ratings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
