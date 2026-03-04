const Product = require('../../models/Product');
const Notification = require('../../models/Notification');

class AdminReviewController {
    static async getList(req, res) {
        try {
            const reviews = await Product.getAllReviewsForAdmin();
            res.render('admin/review_list', { reviews: reviews });
        } catch (err) {
            res.status(500).send("Lỗi lấy danh sách đánh giá");
        }
    }

    static async approve(req, res) {
        try {
            await Product.updateReviewStatus(req.params.id, 'APPROVED');
            res.redirect('/admin/reviews');
        } catch (err) {
            res.status(500).send("Lỗi duyệt đánh giá");
        }
    }

    static async processReply(req, res) {
        try {
            const { review_id, reply_content } = req.body;
            await Product.addAdminReply(review_id, reply_content);
            res.redirect('/admin/reviews');
        } catch (err) {
            res.status(500).send("Lỗi khi trả lời đánh giá");
        }
    }

    static async deleteReply(req, res) {
        try {
            await Product.addAdminReply(req.params.id, null);
            res.redirect('/admin/reviews');
        } catch (err) {
            res.status(500).send("Lỗi khi xóa trả lời");
        }
    }

    static async delete(req, res) {
        try {
            await Product.deleteReview(req.params.id);
            res.redirect('/admin/reviews');
        } catch (err) {
            res.status(500).send("Lỗi xóa đánh giá");
        }
    }
}

module.exports = AdminReviewController;


