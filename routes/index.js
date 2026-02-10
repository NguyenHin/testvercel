const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Product = require('../apps/models/product');
const User = require('../apps/models/user');
const Order = require('../apps/models/order');
const Coupon = require('../apps/models/coupon');
const { JWT_SECRET } = require('../config/keys');
const { sendWelcomeEmail } = require('../utils/mailer'); // Import mailer

const adminRoutes = require('./admin');

const createToken = (id, username, role, full_name, email) => {
    return jwt.sign({ id, username, role, full_name, email }, JWT_SECRET, {
        expiresIn: '1d'
    });
};

// --- NỘI DUNG CÁC TRANG TĨNH ---
const staticPages = {
    'terms': {
        title: 'Điều khoản sử dụng',
        content: `<p>Chào mừng bạn đến với BookTotal...</p>`
    },
    'privacy': {
        title: 'Chính sách bảo mật',
        content: `<p>BookTotal cam kết bảo mật thông tin...</p>`
    },
    'about': {
        title: 'Giới thiệu BookTotal',
        content: `<p>BookTotal được thành lập với sứ mệnh...</p>`
    },
    'return-policy': {
        title: 'Chính sách đổi trả',
        content: `<p>BookTotal hỗ trợ đổi trả sản phẩm...</p>`
    },
    'shipping-policy': {
        title: 'Chính sách vận chuyển',
        content: `<p>BookTotal cung cấp dịch vụ giao hàng...</p>`
    },
    'wholesale-policy': {
        title: 'Chính sách khách sỉ',
        content: `<p>Chính sách chiết khấu hấp dẫn...</p>`
    },
    'payment-methods': {
        title: 'Phương thức thanh toán',
        content: `<p>Hỗ trợ đa dạng phương thức thanh toán...</p>`
    },
    'store-system': {
        title: 'Hệ thống nhà sách',
        content: `<p>Danh sách cửa hàng tại TP.HCM và Hà Nội...</p>`
    }
};

// Route trang chủ
router.get('/', async (req, res) => {
    try {
        const products = await Product.getAllProducts();
        res.render('home', { products: products });
    } catch (err) {
        console.error(err);
        res.render('home', { products: [] });
    }
});

// Route trang tĩnh
router.get('/page/:slug', (req, res) => {
    const slug = req.params.slug;
    const pageData = staticPages[slug];
    if (pageData) {
        res.render('page', { title: pageData.title, content: pageData.content });
    } else {
        res.status(404).render('page', { title: 'Không tìm thấy trang', content: '<p>Nội dung không tồn tại.</p>' });
    }
});

// --- LOGIN ---
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
        console.error(err);
        return res.redirect('/?loginError=Lỗi hệ thống!');
    }
});

// --- REGISTER ---
router.post('/register', async (req, res) => {
    try {
        const { username, email, full_name, password } = req.body;

        // 1. Validate Email (Regex)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.redirect('/?registerError=Email không hợp lệ!');
        }

        // 2. Kiểm tra trùng Username
        const existingUser = await User.getUserByUsername(username);
        if (existingUser) return res.redirect('/?registerError=Tên đăng nhập đã tồn tại!');

        // 3. Thêm User
        await User.addUser(req.body);

        // 4. Gửi Email Chào mừng (Không await để tránh user phải chờ lâu)
        sendWelcomeEmail(email, full_name || username);

        return res.redirect('/?registerSuccess=Đăng ký thành công! Vui lòng kiểm tra email.');
    } catch (err) {
        console.error(err);
        // Bắt lỗi duplicate email từ DB nếu có
        if (err.code === 'ER_DUP_ENTRY' && err.message.includes('email')) {
            return res.redirect('/?registerError=Email đã được sử dụng!');
        }
        return res.redirect('/?registerError=Lỗi khi đăng ký!');
    }
});

// --- LOGOUT ---
router.get('/auth/logout', (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
});

// --- GIỎ HÀNG ---
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
        console.error(err);
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

// --- CHECKOUT ---
router.post('/checkout', (req, res) => {
    const selectedIds = req.body.selected_items;
    let cart = req.cart || [];
    if (!selectedIds || selectedIds.length === 0) return res.redirect('/cart');

    const checkoutItems = cart.filter(item => selectedIds.includes(item.id.toString()));
    const totalAmount = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const productDiscount = parseFloat(req.body.product_discount) || 0;
    const shippingFee = totalAmount > 500000 ? 0 : 30000;

    res.cookie('checkoutData', JSON.stringify({ items: checkoutItems, totalAmount, productDiscount, shippingFee }), { maxAge: 10 * 60 * 1000 });
    res.render('checkout', { cart: checkoutItems, totalAmount, productDiscount, shippingFee });
});

// --- ORDER ---
router.post('/order', async (req, res) => {
    if (res.locals.user && res.locals.user.role === 'admin') {
        return res.status(403).send("Admin không thể đặt hàng!");
    }

    let checkoutData = {};
    if (req.cookies.checkoutData) {
        try { checkoutData = JSON.parse(req.cookies.checkoutData); } catch(e) {}
    }
    if (!checkoutData.items || checkoutData.items.length === 0) return res.redirect('/cart');

    const { full_name, phone, email, address, note } = req.body;
    const userId = res.locals.user ? res.locals.user.id : null;
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
            status: 'PENDING'
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

        res.send(`<div style="text-align:center; padding: 50px;"><h2 style="color: green;">Đặt hàng thành công!</h2><p>Mã đơn hàng: #${orderId}</p><a href="/">Về trang chủ</a></div>`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi khi đặt hàng");
    }
});

// --- PRODUCT DETAIL ---
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

        res.render('product_detail', {
            product, relatedProducts, reviews, canReview, reviewMessage
        });
    } catch (err) {
        console.error(err);
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
        console.error(err);
        res.status(500).send("Lỗi khi gửi đánh giá");
    }
});

router.use(adminRoutes);

module.exports = router;