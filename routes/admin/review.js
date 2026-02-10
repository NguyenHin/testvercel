const express = require('express');
const router = express.Router();
const Product = require('../../apps/models/product');
const { requireAdmin } = require('../../middleware/auth');

// Base path: /admin/reviews

router.get('/', requireAdmin, async (req, res) => {
    try {
        const reviews = await Product.getAllReviewsForAdmin();
        res.render('admin/review_list', { reviews: reviews });
    } catch (err) {
        res.status(500).send("Lỗi lấy danh sách đánh giá");
    }
});

router.get('/approve/:id', requireAdmin, async (req, res) => {
    try {
        await Product.updateReviewStatus(req.params.id, 'APPROVED');
        res.redirect('/admin/reviews');
    } catch (err) {
        res.status(500).send("Lỗi duyệt đánh giá");
    }
});

router.post('/reply', requireAdmin, async (req, res) => {
    try {
        const { review_id, reply_content } = req.body;
        await Product.addAdminReply(review_id, reply_content);
        res.redirect('/admin/reviews');
    } catch (err) {
        res.status(500).send("Lỗi khi trả lời đánh giá");
    }
});

router.get('/reply/delete/:id', requireAdmin, async (req, res) => {
    try {
        await Product.addAdminReply(req.params.id, null);
        res.redirect('/admin/reviews');
    } catch (err) {
        res.status(500).send("Lỗi khi xóa trả lời");
    }
});

router.get('/delete/:id', requireAdmin, async (req, res) => {
    try {
        await Product.deleteReview(req.params.id);
        res.redirect('/admin/reviews');
    } catch (err) {
        res.status(500).send("Lỗi xóa đánh giá");
    }
});

module.exports = router;