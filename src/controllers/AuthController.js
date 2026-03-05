const User = require('../models/User');
const { sendWelcomeEmail, sendResetPasswordEmail } = require('../utils/mailer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
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
            let errors = [];

            // 1. Kiểm tra username không được chứa khoảng trắng
            if (/\s/.test(username)) {
                errors.push('Tên đăng nhập không được chứa khoảng trắng!');
            }

            // 2. Kiểm tra độ dài username (tối đa 50 ký tự)
            if (username && username.length > 50) {
                errors.push('Username tối đa 50 ký tự.');
            }

            // 3. Kiểm tra định dạng và độ dài email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errors.push('Email không hợp lệ!');
            } else if (email.length > 100) {
                errors.push('Email không được vượt quá 100 ký tự!');
            }

            // 4. Kiểm tra độ dài full_name (giới hạn 100 ký tự)
            if (full_name && full_name.length > 100) {
                errors.push('Họ tên không được vượt quá 100 ký tự!');
            }

            // 5. Kiểm tra trùng lặp username và email đồng thời
            const [existingUser, existingEmail] = await Promise.all([
                User.getUserByUsername(username),
                User.getUserByEmail(email)
            ]);

            if (existingUser) {
                errors.push('Tên đăng nhập đã tồn tại.');
            }
            if (existingEmail) {
                errors.push('Email đã được sử dụng.');
            }

            // Nếu có bất kỳ lỗi nào, trả về tất cả thông báo lỗi
            if (errors.length > 0) {
                const errorMsg = encodeURIComponent(errors.join(' '));
                return res.redirect(`/?registerError=${errorMsg}`);
            }

            await User.addUser(req.body);
            sendWelcomeEmail(email, full_name || username);
            return res.redirect('/?registerSuccess=Đăng ký thành công! Vui lòng kiểm tra email.');
        } catch (err) {
            console.error(err);
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

    static async getProfile(req, res) {
        if (!res.locals.user) return res.redirect('/?loginError=Vui lòng đăng nhập!');
        try {
            const userInfo = await User.getUserById(res.locals.user.id);
            if (userInfo.role && userInfo.role.trim().toLowerCase() === 'admin') {
                return res.redirect('/admin/profile');
            }
            res.render('profile', { userInfo, error: req.query.error, success: req.query.success });
        } catch (err) {
            console.error(err);
            res.redirect('/?loginError=Lỗi lấy thông tin!');
        }
    }

    static async getAdminProfile(req, res) {
        if (!res.locals.user) return res.redirect('/?loginError=Vui lòng đăng nhập!');
        try {
            const userInfo = await User.getUserById(res.locals.user.id);
            res.render('admin/profile', { userInfo, error: req.query.error, success: req.query.success });
        } catch (err) {
            console.error(err);
            res.redirect('/admin?error=Lỗi lấy thông tin!');
        }
    }

    static async updateProfile(req, res) {
        if (!res.locals.user) return res.redirect('/?loginError=Vui lòng đăng nhập!');

        const { full_name, email } = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            const base = res.locals.user.role && res.locals.user.role.trim().toLowerCase() === 'admin'
                ? '/admin/profile'
                : '/profile';
            return res.redirect(`${base}?error=Email không hợp lệ!`);
        }

        try {
            const user = await User.getUserById(res.locals.user.id);
            if (!user) {
                return res.redirect('/?loginError=Tài khoản không tồn tại!');
            }

            await User.updateUser(user.id, {
                email,
                full_name,
                role: user.role
            });

            const role = user.role ? user.role.trim().toLowerCase() : 'user';
            const token = AuthController.createToken(user.id, user.username, role, full_name, email);
            res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

            const base = role === 'admin' ? '/admin/profile' : '/profile';
            res.redirect(`${base}?success=Cập nhật thông tin thành công!`);
        } catch (err) {
            console.error(err);
            const base = res.locals.user.role && res.locals.user.role.trim().toLowerCase() === 'admin'
                ? '/admin/profile'
                : '/profile';
            res.redirect(`${base}?error=Lỗi khi cập nhật thông tin!`);
        }
    }

    static async processChangePassword(req, res) {
        if (!res.locals.user) return res.redirect('/?loginError=Vui lòng đăng nhập!');
        const { current_password, new_password, confirm_password } = req.body;

        const role = res.locals.user.role ? res.locals.user.role.trim().toLowerCase() : 'user';
        const base = role === 'admin' ? '/admin/change-password' : '/profile';

        if (new_password !== confirm_password) {
            return res.redirect(`${base}?error=Mật khẩu xác nhận không khớp!`);
        }

        try {
            const user = await User.getUserById(res.locals.user.id);
            const match = await bcrypt.compare(current_password, user.password);

            if (!match) {
                return res.redirect(`${base}?error=Mật khẩu hiện tại không đúng!`);
            }

            await User.resetPassword(user.id, new_password);
            res.redirect(`${base}?success=Đổi mật khẩu thành công!`);
        } catch (err) {
            console.error(err);
            res.redirect(`${base}?error=Lỗi hệ thống!`);
        }
    }
}

module.exports = AuthController;
