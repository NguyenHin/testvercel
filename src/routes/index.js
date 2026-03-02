const express = require('express');
const router = express.Router();

const PageController = require('../controllers/PageController');
const AuthController = require('../controllers/AuthController');
const ProductController = require('../controllers/ProductController');
const CartController = require('../controllers/CartController');
const OrderController = require('../controllers/OrderController');

const adminRoutes = require('./admin');

// --- CÃC TRANG TÄ¨NH & HOME ---
router.get('/', PageController.home);
router.get('/page/:slug', PageController.showStaticPage);

// --- TÃŒM KIáº¾M ---
router.get('/search', ProductController.search);

// --- ÄÄ‚NG NHáº¬P / ÄÄ‚NG KÃ / ÄÄ‚NG XUáº¤T ---
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.get('/auth/logout', AuthController.logout);

// --- QUÃŠN Máº¬T KHáº¨U ---
router.get('/forgot-password', AuthController.showForgotPassword);
router.post('/forgot-password', AuthController.processForgotPassword);
router.get('/reset-password/:token', AuthController.showResetPassword);
router.post('/reset-password/:token', AuthController.processResetPassword);

// --- GIá»Ž HÃ€NG ---
router.get('/cart', CartController.viewCart);
router.post('/cart/add/:id', CartController.addToCart);
router.get('/cart/update/:id', CartController.updateCart);
router.get('/cart/remove/:id', CartController.removeFromCart);

// --- THANH TOÃN (CHECKOUT) ---
router.post('/checkout', OrderController.processCheckout);
router.get('/checkout', OrderController.showCheckout);

// --- ÄÆ N HÃ€NG ---
router.post('/order', OrderController.createOrder);
router.get('/order/success/:id', OrderController.showOrderSuccess);
router.get('/orders', OrderController.getOrderHistory);
router.post('/payment/confirm', OrderController.processPayment);

// --- Sáº¢N PHáº¨M & ÄÃNH GIÃ ---
router.get('/product/:id', ProductController.getProductDetail);
router.post('/product/:id/review', ProductController.addReview);

// --- DANH Má»¤C & Lá»ŒC ---
router.get('/category/:id', ProductController.getByCategory);
router.get('/best-sellers', ProductController.getBestSellers);
router.get('/new-arrivals', ProductController.getNewArrivals);
router.get('/on-sale', ProductController.getOnSale);

// --- THÃ”NG BÃO ---
const Notification = require('../models/Notification');
router.get('/notifications', async (req, res) => {
    if (!res.locals.user) return res.redirect('/auth/login');
    try {
        const notifications = await Notification.getUserNotifications(res.locals.user.id);
        await Notification.markAllAsRead(res.locals.user.id);
        res.render('notifications', { notifications: notifications });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lá»—i láº¥y thÃ´ng bÃ¡o");
    }
});

router.use(adminRoutes);

module.exports = router;
