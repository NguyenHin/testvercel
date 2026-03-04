const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/admin/adminController');

// Import các router con
const productRoutes = require('./admin/product');
const orderRoutes = require('./admin/order');
const userRoutes = require('./admin/user');
const inventoryRoutes = require('./admin/inventory');
const reviewRoutes = require('./admin/review');
const categoryRoutes = require('./admin/category');

// Trang Dashboard chính
router.get('/admin', requireAdmin, adminController.dashboard);

// Sử dụng các router con
router.use('/admin/products', productRoutes);
router.use('/admin/orders', orderRoutes);
router.use('/admin/user', userRoutes);
router.use('/admin/inventory', inventoryRoutes);
router.use('/admin/reviews', reviewRoutes);
router.use('/admin/categories', categoryRoutes);

// Route cho trang thống kê (nếu có)
// router.get('/admin/stats', requireAdmin, (req, res) => {
//     res.render('admin/stats');
// });

module.exports = router;
