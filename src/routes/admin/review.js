const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const Notification = require('../../models/Notification'); // Import Notification
const { requireAdmin } = require('../../middleware/auth');

// Base path: /admin/reviews

const AdminReviewController = require('../../controllers/admin/AdminReviewController');

router.get('/', requireAdmin, AdminReviewController.getList);
router.get('/approve/:id', requireAdmin, AdminReviewController.approve);
router.post('/reply', requireAdmin, AdminReviewController.processReply);
router.get('/reply/delete/:id', requireAdmin, AdminReviewController.deleteReply);
router.get('/delete/:id', requireAdmin, AdminReviewController.delete);

module.exports = router;


