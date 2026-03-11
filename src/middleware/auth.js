const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/keys');

module.exports = {
    // Middleware kiểm tra user cho mọi request (gán vào res.locals)
    checkUser: (req, res, next) => {
        const token = req.cookies.jwt;
        if (token) {
            jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
                if (err) {
                    res.locals.user = null;
                    next();
                } else {
                    res.locals.user = decodedToken;
                    next();
                }
            });
        } else {
            res.locals.user = null;
            next();
        }
    },

    // Middleware bắt buộc đăng nhập
    requireLogin: (req, res, next) => {
        const token = req.cookies.jwt;
        if (token) {
            jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
                if (err) {
                    res.redirect('/?loginError=Phiên đăng nhập hết hạn');
                } else {
                    next();
                }
            });
        } else {
            res.redirect('/?loginError=Vui lòng đăng nhập');
        }
    },

    // Middleware kiểm tra quyền Admin
    requireAdmin: (req, res, next) => {
        const token = req.cookies.jwt;
        if (token) {
            jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
                if (err) {
                    res.redirect('/');
                } else {
                    // Check role (chấp nhận cả hoa thường)
                    if (decodedToken.role && decodedToken.role.toLowerCase() === 'admin') {
                        next();
                    } else {
                        res.status(403).send("Bạn không có quyền truy cập trang này!");
                    }
                }
            });
        } else {
            res.redirect('/');
        }
    }
};