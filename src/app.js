require('dotenv').config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require('express-session');
const flash = require('connect-flash');
// const expressLayouts = require('express-ejs-layouts'); // ĐÃ XÓA

const db = require("./db");
const Product = require("./models/Product");
const Notification = require("./models/Notification");
const { checkUser } = require("./middleware/auth");
// const startOrderAutomation = require('./utils/order_automation'); // ĐÃ TẮT TỰ ĐỘNG

const app = express();

// 1. Cấu hình View Engine (ĐÃ XÓA LAYOUT)
// app.use(expressLayouts);
// app.set('layout', 'layout');
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 2. Middleware
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Cấu hình Session và Flash
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());

// Middleware để truyền flash messages tới mọi view
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// 3. Global Middleware
app.use(checkUser);

// 4. NẠP ROUTER API (API không cần view, cart cookie, v.v.)
const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);

// 5. NẠP ROUTER WEB VÀ MIDDLEWARE CHO WEB
app.use(async (req, res, next) => {
    // Giỏ hàng
    let cart = [];
    const cartCookieName = res.locals.user ? `cart_${res.locals.user.id}` : 'cart_guest';

    if (req.cookies[cartCookieName]) {
        try {
            cart = JSON.parse(req.cookies[cartCookieName]);
        } catch (e) {
            cart = [];
        }
    }
    req.cart = cart;
    res.locals.cart = cart;

    // SỬA: Đếm số lượng loại sản phẩm thay vì tổng số lượng
    res.locals.cartCount = cart.length;

    // Danh mục
    try {
        const categories = await Product.getCategories();
        res.locals.globalCategories = categories;
    } catch (err) {
        res.locals.globalCategories = [];
    }

    // THÔNG BÁO
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

// 5. Xử lý lỗi 404
app.use((req, res, next) => {
    res.status(404).render('page', {
        title: '404 - Không tìm thấy trang',
        content: '<div class="text-center py-5"><h3>Rất tiếc, trang bạn tìm kiếm không tồn tại.</h3><a href="/" class="btn btn-primary mt-3">Về trang chủ</a></div>'
    });
});

// 6. Xử lý lỗi 500
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(500).send(`
        <div style="text-align: center; padding: 50px; font-family: sans-serif;">
            <h1 style="color: #C92127;">500 - Lỗi Server</h1>
            <p>Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.</p>
            <pre style="text-align: left; background: #f4f4f4; padding: 15px; display: inline-block; border-radius: 5px;">${err.message}</pre>
            <br><br>
            <a href="/" style="color: #1a1a2e; font-weight: bold;">Quay lại trang chủ</a>
        </div>
    `);
});

// SỬA LẠI CỔNG CHẠY SERVER
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    // startOrderAutomation(); // ĐÃ TẮT TỰ ĐỘNG
});