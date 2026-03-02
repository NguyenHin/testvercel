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
                const redirectUrl = returnUrl ? returnUrl + '?loginError=Sai tÃ i khoáº£n hoáº·c máº­t kháº©u!' : '/?loginError=Sai tÃ i khoáº£n hoáº·c máº­t kháº©u!';
                return res.redirect(redirectUrl);
            }
        } catch (err) {
            console.error(err);
            return res.redirect('/?loginError=Lá»—i há»‡ thá»‘ng!');
        }
    }

    static async register(req, res) {
        try {
            const { username, email, full_name, password } = req.body;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) return res.redirect('/?registerError=Email khÃ´ng há»£p lá»‡!');
            
            const existingUser = await User.getUserByUsername(username);
            if (existingUser) return res.redirect('/?registerError=TÃªn Ä‘Äƒng nháº­p Ä‘Ã£ tá»“n táº¡i!');
            
            await User.addUser(req.body);
            sendWelcomeEmail(email, full_name || username);
            return res.redirect('/?registerSuccess=ÄÄƒng kÃ½ thÃ nh cÃ´ng! Vui lÃ²ng kiá»ƒm tra email.');
        } catch (err) {
            console.error(err);
            if (err.code === 'ER_DUP_ENTRY' && err.message.includes('email')) {
                return res.redirect('/?registerError=Email Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng!');
            }
            return res.redirect('/?registerError=Lá»—i khi Ä‘Äƒng kÃ½!');
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
                return res.render('auth/forgot_password', { error: 'Email khÃ´ng tá»“n táº¡i trong há»‡ thá»‘ng!' });
            }
            const token = crypto.randomBytes(32).toString('hex');
            const expiry = new Date(Date.now() + 3600000);
            
            await User.saveResetToken(user.email, token, expiry);
            await sendResetPasswordEmail(user.email, token);
            
            res.render('auth/forgot_password', { success: `ÄÃ£ gá»­i email hÆ°á»›ng dáº«n Ä‘áº¿n ${user.email}. Vui lÃ²ng kiá»ƒm tra há»™p thÆ°.` });
        } catch (err) {
            console.error(err);
            res.render('auth/forgot_password', { error: 'Lá»—i há»‡ thá»‘ng, vui lÃ²ng thá»­ láº¡i sau.' });
        }
    }

    static async showResetPassword(req, res) {
        const { token } = req.params;
        try {
            const user = await User.getUserByResetToken(token);
            if (!user) {
                return res.render('auth/reset_password', { error: 'Link Ä‘áº·t láº¡i máº­t kháº©u khÃ´ng há»£p lá»‡ hoáº·c Ä‘Ã£ háº¿t háº¡n.', token: null });
            }
            res.render('auth/reset_password', { token: token });
        } catch (err) {
            res.render('auth/reset_password', { error: 'Lá»—i há»‡ thá»‘ng.', token: null });
        }
    }

    static async processResetPassword(req, res) {
        const { token } = req.params;
        const { password, confirm_password } = req.body;
        
        if (password !== confirm_password) {
            return res.render('auth/reset_password', { error: 'Máº­t kháº©u xÃ¡c nháº­n khÃ´ng khá»›p.', token: token });
        }
        
        try {
            const user = await User.getUserByResetToken(token);
            if (!user) {
                return res.render('auth/reset_password', { error: 'Link khÃ´ng há»£p lá»‡.', token: null });
            }
            await User.resetPassword(user.id, password);
            res.redirect('/?loginError=Äáº·t láº¡i máº­t kháº©u thÃ nh cÃ´ng! Vui lÃ²ng Ä‘Äƒng nháº­p báº±ng máº­t kháº©u má»›i.');
        } catch (err) {
            console.error(err);
            res.render('auth/reset_password', { error: 'Lá»—i khi Ä‘áº·t láº¡i máº­t kháº©u.', token: token });
        }
    }
}

module.exports = AuthController;


