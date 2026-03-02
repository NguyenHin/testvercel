const db = require('../../db');

module.exports = {
    // Tạo thông báo mới
    createNotification: async (userId, title, message, type = 'info') => {
        const query = `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`;
        await db.query(query, [userId, title, message, type]);
    },

    // Lấy tất cả thông báo của user
    getUserNotifications: async (userId) => {
        const query = `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`;
        const [rows] = await db.query(query, [userId]);
        return rows;
    },

    // Đếm số thông báo chưa đọc
    getUnreadCount: async (userId) => {
        const query = `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`;
        const [rows] = await db.query(query, [userId]);
        return rows[0].count;
    },

    // Đánh dấu đã đọc
    markAsRead: async (id, userId) => {
        const query = `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`;
        await db.query(query, [id, userId]);
    },

    // Đánh dấu tất cả là đã đọc
    markAllAsRead: async (userId) => {
        const query = `UPDATE notifications SET is_read = 1 WHERE user_id = ?`;
        await db.query(query, [userId]);
    }
};