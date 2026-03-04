const db = require('../db');
const bcrypt = require('bcrypt');

class User {
    static async getAllUsers() {
        const [rows] = await db.query('SELECT * FROM users');
        return rows;
    }

    static async getUserByUsername(username) {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    }

    static async getUserById(id) {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    static async updateUser(id, userData) {
        let query = 'UPDATE users SET email = ?, full_name = ?, role = ? WHERE id = ?';
        let params = [userData.email, userData.full_name, userData.role, id];

        if (userData.password && userData.password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            query = 'UPDATE users SET email = ?, full_name = ?, role = ?, password = ? WHERE id = ?';
            params = [userData.email, userData.full_name, userData.role, hashedPassword, id];
        }

        await db.query(query, params);
    }

    static async getUserByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async addUser(user) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const role = user.role || 'user';
        const query = `INSERT INTO users (username, password, email, full_name, role) VALUES (?, ?, ?, ?, ?)`;
        await db.query(query, [user.username, hashedPassword, user.email, user.full_name, role]);
    }

    static async login(username, password) {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];
        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (match) return user;
        }
        return null;
    }

    static async deleteUser(id) {
        await db.query('DELETE FROM users WHERE id = ?', [id]);
    }

    // --- CÁC HÀM MỚI CHO QUÊN MẬT KHẨU ---

    // Lưu token reset vào DB
    static async saveResetToken(email, token, expiry) {
        await db.query('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?', [token, expiry, email]);
    }

    // Tìm user bằng token còn hạn
    static async getUserByResetToken(token) {
        const [rows] = await db.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()', [token]);
        return rows[0];
    }

    // Cập nhật mật khẩu mới và xóa token
    static async resetPassword(userId, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?', [hashedPassword, userId]);
    }
}

module.exports = User;
