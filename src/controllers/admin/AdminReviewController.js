const Product = require('../../models/Product');
const Notification = require('../../models/Notification');

class AdminReviewController {
    static async getList(req, res) {
        try {
            const reviews = await Product.getAllReviewsForAdmin();
            res.render('admin/review_list', { reviews: reviews });
        } catch (err) {
            res.status(500).send("Lá»—i láº¥y danh sÃ¡ch Ä‘Ã¡nh giÃ¡");
        }
    }

    static async approve(req, res) {
        try {
            await Product.updateReviewStatus(req.params.id, 'APPROVED');
            res.redirect('/admin/reviews');
        } catch (err) {
            res.status(500).send("Lá»—i duyá»‡t Ä‘Ã¡nh giÃ¡");
        }
    }

    static async processReply(req, res) {
        try {
            const { review_id, reply_content } = req.body;
            await Product.addAdminReply(review_id, reply_content);
            res.redirect('/admin/reviews');
        } catch (err) {
            res.status(500).send("Lá»—i khi tráº£ lá»i Ä‘Ã¡nh giÃ¡");
        }
    }

    static async deleteReply(req, res) {
        try {
            await Product.addAdminReply(req.params.id, null);
            res.redirect('/admin/reviews');
        } catch (err) {
            res.status(500).send("Lá»—i khi xÃ³a tráº£ lá»i");
        }
    }

    static async delete(req, res) {
        try {
            await Product.deleteReview(req.params.id);
            res.redirect('/admin/reviews');
        } catch (err) {
            res.status(500).send("Lá»—i xÃ³a Ä‘Ã¡nh giÃ¡");
        }
    }
}

module.exports = AdminReviewController;


