const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Product = require('../apps/models/product');
const User = require('../apps/models/user');
const Order = require('../apps/models/order');
const Coupon = require('../apps/models/coupon');
const { JWT_SECRET } = require('../config/keys');

const adminRoutes = require('./admin');

const createToken = (id, username, role, full_name, email) => {
    return jwt.sign({ id, username, role, full_name, email }, JWT_SECRET, {
        expiresIn: '1d'
    });
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

// --- LOGIN ---
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.login(username, password);

        if (user) {
            const role = user.role ? user.role.trim().toLowerCase() : 'user';
            const token = createToken(user.id, user.username, role, user.full_name, user.email);
            res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

            if (role === 'admin') {
                return res.redirect('/admin');
            } else {
                return res.redirect('/');
            }
        } else {
            return res.redirect('/?loginError=Sai tài khoản hoặc mật khẩu!');
        }
    } catch (err) {
        console.error(err);
        return res.redirect('/?loginError=Lỗi hệ thống, vui lòng thử lại!');
    }
});

// --- REGISTER ---
router.post('/register', async (req, res) => {
    try {
        const existingUser = await User.getUserByUsername(req.body.username);
        if (existingUser) {
            return res.redirect('/?registerError=Tên đăng nhập đã tồn tại!');
        }
        await User.addUser(req.body);
        return res.redirect('/?registerSuccess=Đăng ký thành công! Vui lòng đăng nhập.');
    } catch (err) {
        console.error(err);
        return res.redirect('/?registerError=Lỗi khi đăng ký, vui lòng thử lại!');
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
        if (product.quantity < quantity) return res.json({ success: false, message: `Chỉ còn ${product.quantity} sản phẩm!` });

        let cart = req.cart || [];
        const existingItem = cart.find(item => item.id == productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                quantity: quantity
            });
        }

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

    if (!selectedIds || selectedIds.length === 0) {
        return res.redirect('/cart');
    }

    const checkoutItems = cart.filter(item => selectedIds.includes(item.id.toString()));
    const totalAmount = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const productDiscount = parseFloat(req.body.product_discount) || 0;
    const shippingFee = totalAmount > 500000 ? 0 : 30000;

    res.cookie('checkoutData', JSON.stringify({
        items: checkoutItems,
        totalAmount: totalAmount,
        productDiscount: productDiscount,
        shippingFee: shippingFee
    }), { maxAge: 10 * 60 * 1000 });

    res.render('checkout', {
        cart: checkoutItems,
        totalAmount: totalAmount,
        productDiscount: productDiscount,
        shippingFee: shippingFee
    });
});

// --- ORDER ---
router.post('/order', async (req, res) => {
    let checkoutData = {};
    if (req.cookies.checkoutData) {
        try { checkoutData = JSON.parse(req.cookies.checkoutData); } catch(e) {}
    }

    if (!checkoutData.items || checkoutData.items.length === 0) {
        return res.redirect('/cart');
    }

    const { full_name, phone, email, address, note, payment_method, shipping_discount_code } = req.body;
    const userId = res.locals.user ? res.locals.user.id : null;

    const totalAmount = checkoutData.totalAmount;
    const shippingFee = checkoutData.shippingFee;
    const productDiscount = checkoutData.productDiscount;
    let shippingDiscount = 0;

    try {
        if (shipping_discount_code) {
            const coupon = await Coupon.getCouponByCode(shipping_discount_code);
            if (coupon && coupon.type === 'shipping' && totalAmount >= coupon.min_order_value) {
                shippingDiscount = coupon.discount_value;
                if (shippingDiscount > shippingFee) shippingDiscount = shippingFee;
            }
        }

        const finalTotal = totalAmount + shippingFee - productDiscount - shippingDiscount;

        const orderId = await Order.createOrder({
            user_id: userId,
            total_money: totalAmount,
            shipping_fee: shippingFee,
            discount_amount: productDiscount + shippingDiscount,
            final_total: finalTotal,
            shipping_address: `${full_name}, ${phone}, ${address} (${note})`,
            status: 'PENDING'
        });

        for (const item of checkoutData.items) {
            await Order.addOrderDetail(orderId, item.id, item.price, item.quantity, item.price * item.quantity);
            await Product.updateStock(item.id, item.quantity);
        }

        let cart = req.cart || [];
        const boughtIds = checkoutData.items.map(item => item.id);
        cart = cart.filter(item => !boughtIds.includes(item.id));

        res.cookie('cart', JSON.stringify(cart), { maxAge: 24 * 60 * 60 * 1000 });
        res.clearCookie('checkoutData');

        res.send(`
            <div style="text-align:center; padding: 50px;">
                <h2 style="color: green;">Đặt hàng thành công!</h2>
                <p>Mã đơn hàng: #${orderId}</p>
                <p>Tổng thanh toán: ${finalTotal.toLocaleString('vi-VN')} đ</p>
                <a href="/">Về trang chủ</a>
            </div>
        `);

    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi khi đặt hàng");
    }
});

// --- CÁC ROUTE KHÁC ---
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

router.get('/product/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.getProductById(productId);
        if (!product) return res.status(404).send("Sản phẩm không tồn tại");

        const relatedProducts = await Product.getAllProducts();
        const reviews = await Product.getReviews(productId);

        // Logic mới: Chỉ cần đăng nhập là được đánh giá
        let canReview = false;
        let reviewMessage = "Vui lòng đăng nhập để đánh giá.";

        if (res.locals.user) {
            canReview = true; // Luôn cho phép nếu đã login
            reviewMessage = "";
        }

        res.render('product_detail', {
            product: product,
            relatedProducts: relatedProducts,
            reviews: reviews,
            canReview: canReview,
            reviewMessage: reviewMessage
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
});

router.post('/product/:id/review', async (req, res) => {
    if (!res.locals.user) return res.redirect('/auth/login');
    try {
        const { rating, comment } = req.body;
        const productId = req.params.id;
        const userId = res.locals.user.id;

        // Không cần check hasPurchased nữa
        await Product.addReview(userId, productId, rating, comment);

        // Thông báo chờ duyệt (có thể làm trang riêng, ở đây redirect tạm)
        res.send(`
            <script>
                alert('Đánh giá của bạn đã được gửi và đang chờ duyệt!');
                window.location.href = '/product/${productId}';
            </script>
        `);
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi khi gửi đánh giá");
    }
});

router.use(adminRoutes);

module.exports = router;