const express = require('express');
const router = express.Router();

// Nạp các file route con
const adminRoutes = require('./admin');
// const userRoutes = require('./user.routes'); // Bỏ comment nếu file này có nội dung

// Sử dụng route
router.use(adminRoutes);
// router.use(userRoutes);

module.exports = router;