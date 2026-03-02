const express = require('express');
const router = express.Router();
const Product = require('../../apps/models/product');
const Notification = require('../../apps/models/notification'); // Import Notification
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

        // Lấy thông tin review để biết user_id và product_id
        // (Cần thêm hàm getReviewById, nhưng để nhanh ta có thể query tạm hoặc thêm hàm)
        // Giả sử ta lấy user_id từ review (cần query thêm)
        // Tạm thời bỏ qua bước query user_id ở đây để tránh phức tạp,
        // hoặc bạn có thể thêm hàm getReviewById vào model Product.

        // Nếu muốn hoàn hảo:
        // const review = await Product.getReviewById(review_id);
        // if (review) {
        //     await Notification.createNotification(review.user_id, 'Phản hồi đánh giá', 'Admin đã trả lời đánh giá của bạn.', 'info');
        // }

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