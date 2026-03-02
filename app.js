const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require('express-session');
const flash = require('connect-flash');
// const expressLayouts = require('express-ejs-layouts'); // ĐÃ XÓA

const db = require("./db");
const Product = require("./apps/models/product");
const Notification = require("./apps/models/notification");
const { checkUser } = require("./middleware/auth");
const startOrderAutomation = require('./utils/order_automation');

const app = express();

// 1. Cấu hình View Engine (ĐÃ XÓA LAYOUT)
// app.use(expressLayouts);
// app.set('layout', 'layout');
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "apps", "views"));

// 2. Middleware
app.use(express.static(path.join(__dirname, "public")));
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

app.use(async (req, res, next) => {
    // Giỏ hàng
    let cart = [];
    if (req.cookies.cart) {
        try { cart = JSON.parse(req.cookies.cart); } catch(e) { cart = []; }
    }
    req.cart = cart;
    res.locals.cart = cart;

    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    res.locals.cartCount = totalQty;

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

// 4. NẠP ROUTER
const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);

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
    console.error(err.stack);
    res.status(500).render('page', {
        title: '500 - Lỗi Server',
        content: '<div class="text-center py-5"><h3>Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.</h3></div>'
    });
});

// SỬA LẠI CỔNG CHẠY SERVER
const PORT = 3003; // Đổi từ 3002 sang 3003

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    startOrderAutomation();
});