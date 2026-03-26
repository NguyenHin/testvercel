require('dotenv').config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require('express-session');
const flash = require('connect-flash');

const db = require("./db");
const Product = require("./models/Product");
const Notification = require("./models/Notification");
const { checkUser } = require("./middleware/auth");

const app = express();

// 1. Cấu hình View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 2. Middleware
// Sử dụng process.cwd() để trỏ về thư mục gốc của project
app.use(express.static(path.join(process.cwd(), "public"))); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || 'bookstore_secret_shhh',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

app.use(checkUser);

// 4. Router API
const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);

// 5. Router Web & Middleware
app.use(async (req, res, next) => {
    let cart = [];
    const cartCookieName = res.locals.user ? `cart_${res.locals.user.id}` : 'cart_guest';

    if (req.cookies[cartCookieName]) {
        try { cart = JSON.parse(req.cookies[cartCookieName]); } catch (e) { cart = []; }
    }
    req.cart = cart;
    res.locals.cart = cart;
    res.locals.cartCount = cart.length;

    try {
        res.locals.globalCategories = await Product.getCategories() || [];
    } catch (err) {
        res.locals.globalCategories = [];
    }

    if (res.locals.user) {
        try {
            const unreadCount = await Notification.getUnreadCount(res.locals.user.id);
            const allNotifs = await Notification.getUserNotifications(res.locals.user.id);
            res.locals.unreadNotifications = unreadCount;
            res.locals.recentNotifications = allNotifs.slice(0, 5);
        } catch (err) {
            res.locals.unreadNotifications = 0;
            res.locals.recentNotifications = [];
        }
    } else {
        res.locals.unreadNotifications = 0;
        res.locals.recentNotifications = [];
    }
    next();
});

const routes = require("./routes");
app.use(routes);

// Xử lý lỗi
app.use((req, res) => {
    res.status(404).render('page', {
        title: '404 - Không tìm thấy trang',
        content: '<div class="text-center py-5"><h3>Trang không tồn tại.</h3><a href="/" class="btn btn-primary mt-3">Về trang chủ</a></div>'
    });
});

app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(500).send(`
        <div style="text-align: center; padding: 50px;">
            <h1 style="color: #C92127;">500 - Lỗi Server</h1>
            <p>Hệ thống đang bảo trì hoặc gặp sự cố kết nối Database.</p>
            <a href="/">Quay lại trang chủ</a>
        </div>
    `);
});

// KHỞI CHẠY & EXPORT
const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;