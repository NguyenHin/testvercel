const db = require('../db');

class Notification {
    static async createNotification(userId, title, message, type = 'info') {
        const query = `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`;
        await db.query(query, [userId, title, message, type]);
    }

    static async getUserNotifications(userId) {
        const query = `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`;
        const [rows] = await db.query(query, [userId]);
        return rows;
    }

    static async getUnreadCount(userId) {
        const query = `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`;
        const [rows] = await db.query(query, [userId]);
        return rows[0].count;
    }

    static async markAsRead(id, userId) {
        const query = `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`;
        await db.query(query, [id, userId]);
    }

    static async markAllAsRead(userId) {
        const query = `UPDATE notifications SET is_read = 1 WHERE user_id = ?`;
        await db.query(query, [userId]);
    }
}

module.exports = Notification;
