const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/keys');
const { sendWelcomeEmail, sendResetPasswordEmail } = require('../utils/mailer');
const crypto = require('crypto');

class AuthService {
    static createToken(id, username, role, full_name, email) {
        return jwt.sign({ id, username, role, full_name, email }, JWT_SECRET, {
            expiresIn: '1d'
        });
    }

    static async authenticateUser(username, password) {
        const user = await User.login(username, password);
        if (!user) {
            throw new Error("Sai tài khoản hoặc mật khẩu!");
        }

        const role = user.role ? user.role.trim().toLowerCase() : 'user';
        const token = AuthService.createToken(user.id, user.username, role, user.full_name, user.email);

        // Remove password from returned user object
        const { password: userPassword, reset_token, reset_token_expiry, ...safeUser } = user;

        return {
            user: safeUser,
            token,
            role
        };
    }

    static async registerUser(userData) {
        const { username, email, full_name, password } = userData;

        const existingUser = await User.getUserByUsername(username);
        if (existingUser) {
            throw new Error("Tên đăng nhập đã tồn tại!");
        }

        const existingEmail = await User.getUserByEmail(email);
        if (existingEmail) {
            throw new Error("Email đã được sử dụng!");
        }

        await User.addUser(userData);

        // Send email asynchronously without blocking the registration
        sendWelcomeEmail(email, full_name || username).catch(err => console.error("Error sending welcome email:", err));

        return { message: "Đăng ký thành công." };
    }

    static async initiatePasswordReset(email) {
        const user = await User.getUserByEmail(email);
        if (!user) {
            throw new Error('Email không tồn tại trong hệ thống!');
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 3600000); // 1 hour

        await User.saveResetToken(user.email, token, expiry);

        await sendResetPasswordEmail(user.email, token);

        return user.email;
    }

    static async verifyResetToken(token) {
        const user = await User.getUserByResetToken(token);
        if (!user) {
            throw new Error('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
        }
        return user;
    }

    static async changePassword(token, newPassword) {
        const user = await AuthService.verifyResetToken(token);
        await User.resetPassword(user.id, newPassword);
        return true;
    }
}

module.exports = AuthService;


