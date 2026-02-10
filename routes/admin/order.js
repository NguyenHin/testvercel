const express = require('express');
const router = express.Router();
const Order = require('../../apps/models/order');
const { requireAdmin } = require('../../middleware/auth');

// Base path: /admin/orders

router.get('/', requireAdmin, async (req, res) => {
    try {
        const orders = await Order.getAllOrders();
        res.render('admin/order_list', { orders: orders });
    } catch (err) {
        res.status(500).send("Lỗi lấy danh sách đơn hàng");
    }
});

router.get('/update/:id/:status', requireAdmin, async (req, res) => {
    try {
        await Order.updateOrderStatus(req.params.id, req.params.status);
        res.redirect('/admin/orders');
    } catch (err) {
        res.status(500).send("Lỗi cập nhật trạng thái đơn hàng");
    }
});

// Route Xóa đơn hàng
router.get('/delete/:id', requireAdmin, async (req, res) => {
    try {
        await Order.deleteOrder(req.params.id);
        res.redirect('/admin/orders');
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi khi xóa đơn hàng");
    }
});

module.exports = router;