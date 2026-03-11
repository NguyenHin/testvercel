const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/admin/adminController');
const AuthController = require('../controllers/AuthController');

// Kiểm tra xem controller có được load đúng không
if (!adminController || !adminController.dashboard) {
    console.error('LỖI: adminController hoặc hàm dashboard không tồn tại!');
}

// Import các router con
const productRoutes = require('./admin/product');
const orderRoutes = require('./admin/order');
const userRoutes = require('./admin/user');
const inventoryRoutes = require('./admin/inventory');
const reviewRoutes = require('./admin/review');
const categoryRoutes = require('./admin/category');

// Trang Dashboard chính
router.get('/admin', requireAdmin, adminController.dashboard);

// Tài khoản admin
router.get('/admin/profile', requireAdmin, AuthController.getAdminProfile);
router.post('/admin/profile', requireAdmin, AuthController.updateProfile);
router.get('/admin/change-password', requireAdmin, (req, res) => {
    res.render('admin/change_password', {
        error: req.query.error,
        success: req.query.success
    });
});
router.post('/admin/change-password', requireAdmin, AuthController.processChangePassword);

// Sử dụng các router con
router.use('/admin/products', productRoutes);
router.use('/admin/orders', orderRoutes);
router.use('/admin/user', userRoutes);
router.use('/admin/inventory', inventoryRoutes);
router.use('/admin/reviews', reviewRoutes);
router.use('/admin/categories', categoryRoutes);

// Route cho trang thống kê
router.get('/admin/stats', requireAdmin, adminController.getStats);

module.exports = router;
