const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Product = require('../apps/models/product');
const User = require('../apps/models/user');
const Order = require('../apps/models/order');
const Coupon = require('../apps/models/coupon');
const Notification = require('../apps/models/notification');
const { JWT_SECRET } = require('../config/keys');
const { sendWelcomeEmail, sendResetPasswordEmail } = require('../utils/mailer');

const adminRoutes = require('./admin');

const createToken = (id, username, role, full_name, email) => {
    return jwt.sign({ id, username, role, full_name, email }, JWT_SECRET, {
        expiresIn: '1d'
    });
};

// ... (Giữ nguyên các route tĩnh và trang chủ, search, page) ...
const staticPages = {
    'terms': { title: 'Điều khoản sử dụng', content: `<p>Chào mừng bạn đến với BookTotal...</p>` },
    'privacy': { title: 'Chính sách bảo mật', content: `<p>BookTotal cam kết bảo mật thông tin...</p>` },
    'payment-privacy': { title: 'Chính sách bảo mật thanh toán', content: `<p>Hệ thống thanh toán an toàn...</p>` },
    'about': { title: 'Giới thiệu BookTotal', content: `<p>BookTotal được thành lập với sứ mệnh...</p>` },
    'store-system': { title: 'Hệ thống trung tâm - nhà sách', content: `<p>Danh sách cửa hàng...</p>` },
    'return-policy': { title: 'Chính sách đổi trả', content: `<p>BookTotal hỗ trợ đổi trả sản phẩm...</p>` },
    'warranty-policy': { title: 'Chính sách bảo hành', content: `<p>Bảo hành sản phẩm...</p>` },
    'shipping-policy': { title: 'Chính sách vận chuyển', content: `<p>Giao hàng toàn quốc...</p>` },
    'wholesale-policy': { title: 'Chính sách khách sỉ', content: `<p>Chiết khấu hấp dẫn...</p>` },
    'payment-methods': { title: 'Phương thức thanh toán', content: `<p>Đa dạng phương thức...</p>` }
};

router.get('/', async (req, res) => {
    try {
        const products = await Product.getAllProducts();
        res.render('home', { products: products });
    } catch (err) {
        console.error(err);
        res.render('home', { products: [] });
    }
});

router.get('/search', async (req, res) => {
    try {
        const keyword = req.query.q;
        if (!keyword || keyword.trim() === "") {
            const products = await Product.getAllProducts();
            return res.render('home', { products: products, searchError: "Vui lòng nhập từ khóa để tìm kiếm!" });
        }
        const products = await Product.searchProducts(keyword);
        res.render('home', { products: products, keyword: keyword });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi tìm kiếm");
    }
});

router.get('/page/:slug', (req, res) => {
    const slug = req.params.slug;
    const pageData = staticPages[slug];
    if (pageData) {
        res.render('page', { title: pageData.title, content: pageData.content });
    } else {
        res.status(404).render('page', { title: 'Không tìm thấy trang', content: '<p>Nội dung không tồn tại.</p>' });
    }
});

// --- LOGIN/REGISTER/LOGOUT ---
router.post('/login', async (req, res) => {
    const { username, password, returnUrl } = req.body;
    try {
        const user = await User.login(username, password);
        if (user) {
            const role = user.role ? user.role.trim().toLowerCase() : 'user';
            const token = createToken(user.id, user.username, role, user.full_name, user.email);
            res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
            if (role === 'admin') return res.redirect('/admin');
            return res.redirect(returnUrl || '/');
        } else {
            const redirectUrl = returnUrl ? returnUrl + '?loginError=Sai tài khoản hoặc mật khẩu!' : '/?loginError=Sai tài khoản hoặc mật khẩu!';
            return res.redirect(redirectUrl);
        }
    } catch (err) {
        return res.redirect('/?loginError=Lỗi hệ thống!');
    }
});

router.post('/register', async (req, res) => {
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
        if (err.code === 'ER_DUP_ENTRY' && err.message.includes('email')) return res.redirect('/?registerError=Email đã được sử dụng!');
        return res.redirect('/?registerError=Lỗi khi đăng ký!');
    }
});

router.get('/auth/logout', (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
});

// --- QUÊN MẬT KHẨU ---
router.get('/forgot-password', (req, res) => {
    res.render('auth/forgot_password');
});

router.post('/forgot-password', async (req, res) => {
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
});

router.get('/reset-password/:token', async (req, res) => {
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
});

router.post('/reset-password/:token', async (req, res) => {
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
        res.render('auth/reset_password', { error: 'Lỗi khi đặt lại mật khẩu.', token: token });
    }
});

// ... (Giữ nguyên các route Cart, Product Detail...) ...
router.get('/cart', (req, res) => {
    const cart = req.cart || [];
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.render('cart', { cart: cart, totalAmount: totalAmount });
});

router.post('/cart/add/:id', async (req, res) => {
    const productId = req.params.id;
    const quantity = parseInt(req.body.quantity) || 1;
    try {
        const product = await Product.getProductById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });
        let cart = req.cart || [];
        const existingItem = cart.find(item => item.id == productId);
        if (existingItem) existingItem.quantity += quantity;
        else cart.push({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, quantity: quantity });
        res.cookie('cart', JSON.stringify(cart), { maxAge: 24 * 60 * 60 * 1000 });
        const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
        res.json({ success: true, message: "Thêm vào giỏ hàng thành công!", totalQty: totalQty });
    } catch (err) {
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
});

router.get('/cart/update/:id', (req, res) => {
    const productId = req.params.id;
    const action = req.query.action;
    let cart = req.cart || [];
    const item = cart.find(item => item.id == productId);
    if (item) {
        if (action === 'increase') item.quantity++;
        else if (action === 'decrease') {
            item.quantity--;
            if (item.quantity <= 0) cart = cart.filter(i => i.id != productId);
        }
    }
    res.cookie('cart', JSON.stringify(cart), { maxAge: 24 * 60 * 60 * 1000 });
    res.redirect('/cart');
});

router.get('/cart/remove/:id', (req, res) => {
    const productId = req.params.id;
    let cart = req.cart || [];
    cart = cart.filter(item => item.id != productId);
    res.cookie('cart', JSON.stringify(cart), { maxAge: 24 * 60 * 60 * 1000 });
    res.redirect('/cart');
});

// --- CHECKOUT (SỬA LẠI: TÁCH POST VÀ GET) ---
// 1. POST: Xử lý logic, lưu cookie, redirect
router.post('/checkout', (req, res) => {
    if (!res.locals.user) return res.redirect('/auth/login?returnUrl=/cart');

    const selectedIds = req.body.selected_items;
    let cart = req.cart || [];

    if (!selectedIds || selectedIds.length === 0) return res.redirect('/cart');

    const checkoutItems = cart.filter(item => selectedIds.includes(item.id.toString()));
    const totalAmount = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const productDiscount = parseFloat(req.body.product_discount) || 0;
    const shippingFee = totalAmount > 500000 ? 0 : 30000;

    // Lưu dữ liệu checkout vào cookie
    res.cookie('checkoutData', JSON.stringify({ items: checkoutItems, totalAmount, productDiscount, shippingFee }), { maxAge: 10 * 60 * 1000 });

    // Redirect sang trang GET để tránh lỗi resubmission
    res.redirect('/checkout');
});

// 2. GET: Hiển thị trang checkout
router.get('/checkout', (req, res) => {
    if (!res.locals.user) return res.redirect('/auth/login?returnUrl=/cart');

    let checkoutData = {};
    if (req.cookies.checkoutData) {
        try { checkoutData = JSON.parse(req.cookies.checkoutData); } catch(e) {}
    }

    if (!checkoutData.items || checkoutData.items.length === 0) {
        return res.redirect('/cart');
    }

    res.render('checkout', {
        cart: checkoutData.items,
        totalAmount: checkoutData.totalAmount,
        productDiscount: checkoutData.productDiscount,
        shippingFee: checkoutData.shippingFee
    });
});

// --- ORDER (SỬA LẠI: REDIRECT SAU KHI TẠO ĐƠN) ---
router.post('/order', async (req, res) => {
    if (!res.locals.user) return res.redirect('/auth/login');
    if (res.locals.user.role === 'admin') return res.status(403).send("Admin không thể đặt hàng!");

    let checkoutData = {};
    if (req.cookies.checkoutData) {
        try { checkoutData = JSON.parse(req.cookies.checkoutData); } catch(e) {}
    }
    if (!checkoutData.items || checkoutData.items.length === 0) return res.redirect('/cart');

    const { full_name, phone, email, address, note, payment_method } = req.body;
    const userId = res.locals.user.id;
    const { totalAmount, shippingFee, productDiscount } = checkoutData;
    const finalTotal = totalAmount + shippingFee - productDiscount;

    try {
        const orderId = await Order.createOrder({
            user_id: userId,
            total_money: totalAmount,
            shipping_fee: shippingFee,
            discount_amount: productDiscount,
            final_total: finalTotal,
            shipping_address: `${full_name}, ${phone}, ${address} (${note})`,
            status: 'PENDING',
            payment_method: payment_method
        });

        for (const item of checkoutData.items) {
            await Order.addOrderDetail(orderId, item.id, item.price, item.quantity);
            await Product.updateStock(item.id, item.quantity);
        }

        let cart = req.cart || [];
        const boughtIds = checkoutData.items.map(item => item.id);
        cart = cart.filter(item => !boughtIds.includes(item.id));
        res.cookie('cart', JSON.stringify(cart), { maxAge: 24 * 60 * 60 * 1000 });
        res.clearCookie('checkoutData');

        if (payment_method === 'MOMO' || payment_method === 'VNPAY') {
            return res.render('payment_gateway', { orderId: orderId, amount: finalTotal, method: payment_method });
        } else {
            await Notification.createNotification(userId, 'Đặt hàng thành công', `Đơn hàng #${orderId} của bạn đã được ghi nhận.`, 'success');
            // Redirect sang trang thành công
            res.redirect(`/order/success/${orderId}`);
        }

    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi khi đặt hàng");
    }
});

// ROUTE THÔNG BÁO ĐẶT HÀNG THÀNH CÔNG (MỚI)
router.get('/order/success/:id', async (req, res) => {
    if (!res.locals.user) return res.redirect('/');
    res.render('order_success', { orderId: req.params.id });
});

// ... (Các route khác giữ nguyên) ...
router.get('/orders', async (req, res) => {
    if (!res.locals.user) return res.redirect('/auth/login');
    try {
        const orders = await Order.getOrdersByUserId(res.locals.user.id);
        res.render('order_history', { orders: orders });
    } catch (err) {
        res.status(500).send("Lỗi lấy lịch sử đơn hàng");
    }
});

router.get('/product/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.getProductById(productId);
        if (!product) return res.status(404).send("Sản phẩm không tồn tại");
        const relatedProducts = await Product.getAllProducts();
        const reviews = await Product.getReviews(productId);
        let canReview = false;
        let reviewMessage = "Vui lòng đăng nhập để đánh giá.";
        if (res.locals.user) {
            canReview = true;
            reviewMessage = "";
        }
        res.render('product_detail', { product, relatedProducts, reviews, canReview, reviewMessage });
    } catch (err) {
        res.status(500).send("Lỗi server");
    }
});

router.post('/product/:id/review', async (req, res) => {
    if (!res.locals.user) return res.redirect('/auth/login');
    if (res.locals.user.role === 'admin') return res.status(403).send("Admin không thể đánh giá!");
    try {
        const { rating, comment } = req.body;
        await Product.addReview(res.locals.user.id, req.params.id, rating, comment);
        res.send(`<script>alert('Đánh giá đã gửi và đang chờ duyệt!'); window.location.href = '/product/${req.params.id}';</script>`);
    } catch (err) {
        res.status(500).send("Lỗi khi gửi đánh giá");
    }
});

router.get('/notifications', async (req, res) => {
    if (!res.locals.user) return res.redirect('/auth/login');
    try {
        const notifications = await Notification.getUserNotifications(res.locals.user.id);
        await Notification.markAllAsRead(res.locals.user.id);
        res.render('notifications', { notifications: notifications });
    } catch (err) {
        res.status(500).send("Lỗi lấy thông báo");
    }
});

// ROUTE LỌC DANH MỤC
router.get('/category/:id', async (req, res) => {
    try {
        const categoryId = req.params.id;
        const products = await Product.getProductsByCategory(categoryId);
        const categoryName = await Product.getCategoryName(categoryId);
        res.render('home', { products: products, categoryName: categoryName });
    } catch (err) {
        res.status(500).send("Lỗi lọc danh mục");
    }
});

// ROUTE SÁCH BÁN CHẠY
router.get('/best-sellers', async (req, res) => {
    try {
        const products = await Product.getBestSellers();
        res.render('home', { products: products, categoryName: 'Sách Bán Chạy' });
    } catch (err) {
        res.status(500).send("Lỗi lấy sách bán chạy");
    }
});

// ROUTE SÁCH MỚI
router.get('/new-arrivals', async (req, res) => {
    try {
        const products = await Product.getNewArrivals();
        res.render('home', { products: products, categoryName: 'Sách Mới Phát Hành' });
    } catch (err) {
        res.status(500).send("Lỗi lấy sách mới");
    }
});

// ROUTE KHUYẾN MÃI
router.get('/on-sale', async (req, res) => {
    try {
        const products = await Product.getOnSaleProducts();
        res.render('home', { products: products, categoryName: 'Sách Đang Khuyến Mãi' });
    } catch (err) {
        res.status(500).send("Lỗi lấy sách khuyến mãi");
    }
});

// ROUTE XỬ LÝ KẾT QUẢ THANH TOÁN
router.post('/payment/confirm', async (req, res) => {
    const { orderId, status } = req.body;
    const userId = res.locals.user ? res.locals.user.id : null;

    try {
        if (status === 'SUCCESS') {
            await Order.updateOrderStatus(orderId, 'CONFIRMED');
            if (userId) await Notification.createNotification(userId, 'Thanh toán thành công', `Đơn hàng #${orderId} đã được thanh toán thành công.`, 'success');
            res.redirect(`/order/success/${orderId}`); // Redirect thay vì send
        } else {
            await Order.updateOrderStatus(orderId, 'CANCELLED');
            if (userId) await Notification.createNotification(userId, 'Thanh toán thất bại', `Đơn hàng #${orderId} đã bị hủy do thanh toán thất bại.`, 'danger');
            res.send(`<div style="text-align:center; padding: 50px;"><h2 style="color: red;">Thanh toán thất bại!</h2><p>Đơn hàng #${orderId} đã bị hủy.</p><a href="/">Về trang chủ</a></div>`);
        }
    } catch (err) {
        res.status(500).send("Lỗi xử lý thanh toán");
    }
});

router.use(adminRoutes);

module.exports = router;