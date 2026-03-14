const User = require('../models/User');
const { sendResetPasswordEmail } = require('../utils/mailer');
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

    // Hàm kiểm tra độ mạnh của mật khẩu
    static validatePassword(password) {
        const minLength = 6;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) return "Mật khẩu phải có ít nhất 6 ký tự.";
        if (!hasUpperCase) return "Mật khẩu phải chứa ít nhất một chữ cái viết hoa.";
        if (!hasLowerCase) return "Mật khẩu phải chứa ít nhất một chữ cái viết thường.";
        if (!hasNumber) return "Mật khẩu phải chứa ít nhất một chữ số.";
        if (!hasSpecialChar) return "Mật khẩu phải chứa ít nhất một ký tự đặc biệt.";

        return null;
    }

    static async login(req, res) {
        let { username, password, returnUrl } = req.body;
        if (username) username = username.trim();

        try {
            // 1. Tìm user theo username trước
            const user = await User.getUserByUsername(username);

            const genericError = encodeURIComponent("Sai tên đăng nhập hoặc mật khẩu!");

            if (!user) {
                // Trường hợp sai tài khoản
                const redirectUrl = returnUrl
                    ? `${returnUrl}?loginError=${genericError}&username=${encodeURIComponent(username)}`
                    : `/?loginError=${genericError}&username=${encodeURIComponent(username)}`;
                return res.redirect(redirectUrl);
            }

            // 2. Kiểm tra mật khẩu
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                // Trường hợp sai mật khẩu
                const redirectUrl = returnUrl
                    ? `${returnUrl}?loginError=${genericError}&username=${encodeURIComponent(username)}`
                    : `/?loginError=${genericError}&username=${encodeURIComponent(username)}`;
                return res.redirect(redirectUrl);
            }

            // 3. Đăng nhập thành công
            const role = user.role ? user.role.trim().toLowerCase() : 'user';
            const token = AuthController.createToken(user.id, user.username, role, user.full_name, user.email);
            res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

            if (role === 'admin') return res.redirect('/admin');
            return res.redirect(returnUrl || '/');

        } catch (err) {
            console.error(err);
            return res.redirect('/?loginError=' + encodeURIComponent("Lỗi hệ thống!"));
        }
    }

    static async register(req, res) {
        try {
            const { username, email, full_name, password } = req.body;
            let errors = [];

            if (username) {
                if (/\s/.test(username)) errors.push('Tên đăng nhập không được chứa khoảng trắng!');
                if (!/^[a-zA-Z0-9_]+$/.test(username)) errors.push('Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới (_)!');
                if (username.length > 50) errors.push('Username tối đa 50 ký tự.');
            } else {
                errors.push('Tên đăng nhập không được để trống!');
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) errors.push('Email không hợp lệ!');
            else if (email.length > 100) errors.push('Email không được vượt quá 100 ký tự!');

            if (full_name && full_name.length > 100) errors.push('Họ tên không được vượt quá 100 ký tự!');

            const passwordError = AuthController.validatePassword(password);
            if (passwordError) errors.push(passwordError);

            const [existingUser, existingEmail] = await Promise.all([
                User.getUserByUsername(username),
                User.getUserByEmail(email)
            ]);

            if (existingUser) errors.push('Tên đăng nhập đã tồn tại.');
            if (existingEmail) errors.push('Email đã được sử dụng.');

            if (errors.length > 0) {
                const errorMsg = encodeURIComponent(errors.join(' '));
                return res.redirect(`/?registerError=${errorMsg}`);
            }

            await User.addUser(req.body);
<<<<<<< HEAD
=======
            // Bỏ sendWelcomeEmail nếu không tồn tại hoặc lỗi
>>>>>>> 1993e744b25b56f5aa013f20d131041aef49dbef
            return res.redirect('/?registerSuccess=Đăng ký thành công! Vui lòng đăng nhập.');
        } catch (err) {
            console.error('Lỗi đăng ký:', err);
            return res.redirect('/?registerError=Lỗi khi đăng ký!');
        }
    }

    static logout(req, res) {
        res.cookie('jwt', '', { maxAge: 1 });
        res.cookie('cart', '', { maxAge: 1 }); // Clear cart cookie on logout
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

        const passwordError = AuthController.validatePassword(password);
        if (passwordError) {
            return res.render('auth/reset_password', { error: passwordError, token: token });
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

        const backURL = req.header('Referer') || '/profile';

        if (!emailRegex.test(email)) {
            return res.redirect(`${backURL}${backURL.includes('?') ? '&' : '?'}error=${encodeURIComponent('Email không hợp lệ!')}`);
        }

        try {
            const user = await User.getUserById(res.locals.user.id);
            if (!user) return res.redirect('/?loginError=Tài khoản không tồn tại!');

            await User.updateUser(user.id, { email, full_name, role: user.role });

            const role = user.role ? user.role.trim().toLowerCase() : 'user';
            const token = AuthController.createToken(user.id, user.username, role, user.full_name, email);
            res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

            res.redirect(`${backURL}${backURL.includes('?') ? '&' : '?'}success=${encodeURIComponent('Cập nhật thông tin thành công!')}`);
        } catch (err) {
            console.error(err);
            res.redirect(`${backURL}${backURL.includes('?') ? '&' : '?'}error=${encodeURIComponent('Lỗi khi cập nhật thông tin!')}`);
        }
    }

    static async processChangePassword(req, res) {
        if (!res.locals.user) return res.redirect('/?loginError=Vui lòng đăng nhập!');
        const { current_password, new_password, confirm_password } = req.body;

        const backURL = req.header('Referer') || '/profile';

        if (new_password !== confirm_password) {
            return res.redirect(`${backURL}${backURL.includes('?') ? '&' : '?'}error=${encodeURIComponent('Mật khẩu xác nhận không khớp!')}`);
        }

        const passwordError = AuthController.validatePassword(new_password);
        if (passwordError) {
            return res.redirect(`${backURL}${backURL.includes('?') ? '&' : '?'}error=${encodeURIComponent(passwordError)}`);
        }

        try {
            const user = await User.getUserById(res.locals.user.id);

            const match = await bcrypt.compare(current_password, user.password);
            if (!match) {
                return res.redirect(`${backURL}${backURL.includes('?') ? '&' : '?'}error=${encodeURIComponent('Mật khẩu hiện tại không đúng!')}`);
            }

            await User.resetPassword(user.id, new_password);

            res.redirect(`${backURL}${backURL.includes('?') ? '&' : '?'}success=${encodeURIComponent('Cập nhật mật khẩu thành công!')}`);
        } catch (err) {
            console.error(err);
            res.redirect(`${backURL}${backURL.includes('?') ? '&' : '?'}error=${encodeURIComponent('Lỗi hệ thống khi đổi mật khẩu!')}`);
        }
    }
}

module.exports = AuthController;
