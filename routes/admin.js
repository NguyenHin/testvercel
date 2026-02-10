const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const Order = require('../apps/models/order'); // Import Order Model

// Import các route con
const productRoutes = require('./admin/product');
const userRoutes = require('./admin/user');
const reviewRoutes = require('./admin/review');
const orderRoutes = require('./admin/order');
const inventoryRoutes = require('./admin/inventory');

// Route Dashboard chính
router.get('/admin', requireAdmin, (req, res) => {
    res.render('admin/index');
});

// Route Thống kê (Cập nhật dữ liệu thật)
router.get('/admin/stats', requireAdmin, async (req, res) => {
    try {
        const stats = await Order.getRevenueStats();

        // Chuẩn bị dữ liệu cho Chart.js
        const labels = stats.map(item => new Date(item.date).toLocaleDateString('vi-VN'));
        const data = stats.map(item => item.revenue);

        res.render('admin/stats', {
            labels: JSON.stringify(labels),
            data: JSON.stringify(data)
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi lấy dữ liệu thống kê");
    }
});

// Mount các route con
router.use('/admin/products', productRoutes);
router.use('/admin/user', userRoutes);
router.use('/admin/reviews', reviewRoutes);
router.use('/admin/orders', orderRoutes);
router.use('/admin/inventory', inventoryRoutes);

module.exports = router;