const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/admin/adminController');

// Import cÃ¡c router con
const productRoutes = require('./admin/product');
const orderRoutes = require('./admin/order');
const userRoutes = require('./admin/user');
const inventoryRoutes = require('./admin/inventory');
const reviewRoutes = require('./admin/review');

// Trang Dashboard chÃ­nh
router.get('/admin', requireAdmin, adminController.dashboard);

// Sá»­ dá»¥ng cÃ¡c router con
router.use('/admin/products', productRoutes);
router.use('/admin/orders', orderRoutes);
router.use('/admin/user', userRoutes);
router.use('/admin/inventory', inventoryRoutes);
router.use('/admin/reviews', reviewRoutes);

// Route cho trang thá»‘ng kÃª (náº¿u cÃ³)
// router.get('/admin/stats', requireAdmin, (req, res) => {
//     res.render('admin/stats');
// });

module.exports = router;
