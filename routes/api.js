const express = require('express');
const router = express.Router();
const Product = require('../apps/models/product');
const User = require('../apps/models/user');
const Coupon = require('../apps/models/coupon');
const Order = require('../apps/models/order');
const db = require('../db'); // Import DB để query địa chỉ

// ... (Giữ nguyên các API cũ: products, users, coupons...) ...
// API: Lấy danh sách sản phẩm
router.get('/products', async (req, res) => {
    try {
        const products = await Product.getAllProducts();
        res.status(200).json({ success: true, data: products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.getProductById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });
        res.status(200).json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/users', async (req, res) => {
    try {
        const users = await User.getAllUsers();
        const safeUsers = users.map(u => { const { password, ...rest } = u; return rest; });
        res.status(200).json({ success: true, data: safeUsers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/coupons', async (req, res) => {
    try {
        const coupons = await Coupon.getAllActiveCoupons();
        const productCoupons = coupons.filter(c => c.type && c.type.toLowerCase() === 'product');
        const shippingCoupons = coupons.filter(c => c.type && c.type.toLowerCase() === 'shipping');
        res.json({ success: true, data: { product: productCoupons, shipping: shippingCoupons } });
    } catch (err) {
        res.status(500).json({ success: false, message: "Lỗi lấy mã giảm giá" });
    }
});

router.post('/coupon/check', async (req, res) => {
    const { code, totalAmount, shippingFee = 30000 } = req.body;
    try {
        const coupon = await Coupon.getCouponByCode(code);
        if (!coupon) return res.json({ success: false, message: "Mã không hợp lệ hoặc đã hết hạn!" });
        if (totalAmount < coupon.min_order_value) return res.json({ success: false, message: `Đơn hàng phải từ ${Number(coupon.min_order_value).toLocaleString('vi-VN')}đ mới được áp dụng!` });

        let discount = 0;
        let message = "";
        if (coupon.type === 'product') {
            if (coupon.discount_type === 'percent') {
                discount = (totalAmount * coupon.discount_value) / 100;
                if (coupon.max_discount_amount > 0 && discount > coupon.max_discount_amount) discount = coupon.max_discount_amount;
            } else {
                discount = coupon.discount_value;
            }
            if (discount > totalAmount) discount = totalAmount;
            message = "Áp dụng mã giảm giá sản phẩm thành công!";
        } else if (coupon.type === 'shipping') {
            discount = coupon.discount_value;
            if (discount > shippingFee) discount = shippingFee;
            message = "Áp dụng mã Freeship thành công!";
        }
        res.json({ success: true, message: message, discount: discount, type: coupon.type, code: coupon.code });
    } catch (err) {
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
});

router.get('/orders/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.getOrderById(orderId);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        const items = await Order.getOrderItems(orderId);
        order.items = items;
        res.json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
});

// --- API ĐỊA CHÍNH (MỚI) ---
router.get('/location/provinces', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM provinces ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi lấy tỉnh thành' });
    }
});

router.get('/location/districts/:provinceCode', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM districts WHERE province_code = ? ORDER BY name', [req.params.provinceCode]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi lấy quận huyện' });
    }
});

router.get('/location/wards/:districtCode', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM wards WHERE district_code = ? ORDER BY name', [req.params.districtCode]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi lấy phường xã' });
    }
});

module.exports = router;