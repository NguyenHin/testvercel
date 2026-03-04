const User = require('../models/User');
const { sendWelcomeEmail, sendResetPasswordEmail } = require('../utils/mailer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { JWT_SECRET } = require('../config/keys');

class AuthController {
    static createToken(id, username, role, full_name, email) {
        return jwt.sign({ id, username, role, full_name, email }, JWT_SECRET, {
            expiresIn: '1d'
        });
    }

    static async login(req, res) {
        const { username, password, returnUrl } = req.body;
        try {
            const user = await User.login(username, password);
            if (user) {
                const role = user.role ? user.role.trim().toLowerCase() : 'user';
                const token = AuthController.createToken(user.id, user.username, role, user.full_name, user.email);
                res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
                if (role === 'admin') return res.redirect('/admin');
                return res.redirect(returnUrl || '/');
            } else {
                const redirectUrl = returnUrl ? returnUrl + '?loginError=Sai tài khoản hoặc mật khẩu!' : '/?loginError=Sai tài khoản hoặc mật khẩu!';
                return res.redirect(redirectUrl);
            }
        } catch (err) {
            console.error(err);
            return res.redirect('/?loginError=Lỗi hệ thống!');
        }
    }

    static async register(req, res) {
        try {
            const { username, email, full_name, password } = req.body;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) return res.redirect('/?registerError=Email không hợp lệ!');
            
            const existingUser = await User.getUserByUsername(username);
            if (existingUser) return res.redirect('/?registerError=Tên đăng nhập đã tồn tại!');
            
            await User.addUser(req.body);
            sendWelcomeEmail(email, full_name || username);
            return res.redirect('/?registerSuccess=Đăng ký thành công! Vui lòng kiểm tra email.');
        } catch (err) {
            console.error(err);
            if (err.code === 'ER_DUP_ENTRY' && err.message.includes('email')) {
                return res.redirect('/?registerError=Email đã được sử dụng!');
            }
            return res.redirect('/?registerError=Lỗi khi đăng ký!');
        }
    }

    static logout(req, res) {
        res.cookie('jwt', '', { maxAge: 1 });
        res.redirect('/');
    }

    static showForgotPassword(req, res) {
        res.render('auth/forgot_password');
    }

    static async processForgotPassword(req, res) {
        const { email } = req.body;
        try {
            const user = await User.getUserByEmail(email);
            if (!user) {
                return res.render('auth/forgot_password', { error: 'Email không tồn tại trong hệ thống!' });
            }
            const token = crypto.randomBytes(32).toString('hex');
            const expiry = new Date(Date.now() + 3600000);
            
            await User.saveResetToken(user.email, token, expiry);
            await sendResetPasswordEmail(user.email, token);
            
            res.render('auth/forgot_password', { success: `Đã gửi email hướng dẫn đến ${user.email}. Vui lòng kiểm tra hộp thư.` });
        } catch (err) {
            console.error(err);
            res.render('auth/forgot_password', { error: 'Lỗi hệ thống, vui lòng thử lại sau.' });
        }
    }

    static async showResetPassword(req, res) {
        const { token } = req.params;
        try {
            const user = await User.getUserByResetToken(token);
            if (!user) {
                return res.render('auth/reset_password', { error: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.', token: null });
            }
            res.render('auth/reset_password', { token: token });
        } catch (err) {
            res.render('auth/reset_password', { error: 'Lỗi hệ thống.', token: null });
        }
    }

    static async processResetPassword(req, res) {
        const { token } = req.params;
        const { password, confirm_password } = req.body;
        
        if (password !== confirm_password) {
            return res.render('auth/reset_password', { error: 'Mật khẩu xác nhận không khớp.', token: token });
        }
        
        try {
            const user = await User.getUserByResetToken(token);
            if (!user) {
                return res.render('auth/reset_password', { error: 'Link không hợp lệ.', token: null });
            }
            await User.resetPassword(user.id, password);
            res.redirect('/?loginError=Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.');
        } catch (err) {
            console.error(err);
            res.render('auth/reset_password', { error: 'Lỗi khi đặt lại mật khẩu.', token: token });
        }
    }
}

module.exports = AuthController;


