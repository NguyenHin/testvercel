const express = require('express');
const router = express.Router();
const Order = require('../../apps/models/order');
const Notification = require('../../apps/models/notification');
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
        const orderId = req.params.id;
        const status = req.params.status;

        await Order.updateOrderStatus(orderId, status);
        const order = await Order.getOrderById(orderId);

        if (order && order.user_id) {
            let title = 'Cập nhật đơn hàng';
            let message = `Đơn hàng #${orderId} đã thay đổi trạng thái.`;
            let type = 'info';

            switch (status) {
                case 'CONFIRMED':
                    title = 'Đơn hàng đã được xác nhận';
                    message = `Đơn hàng #${orderId} của bạn đã được xác nhận và đang chờ xử lý.`;
                    type = 'info';
                    break;
                case 'PROCESSING':
                    title = 'Đang xử lý đơn hàng';
                    message = `Đơn hàng #${orderId} đang được đóng gói.`;
                    type = 'info';
                    break;
                case 'SHIPPED':
                    title = 'Đã giao cho vận chuyển';
                    message = `Đơn hàng #${orderId} đã được bàn giao cho đơn vị vận chuyển.`;
                    type = 'info';
                    break;
                case 'DELIVERING':
                    title = 'Đang giao hàng';
                    message = `Shipper đang trên đường giao đơn hàng #${orderId} đến bạn. Vui lòng chú ý điện thoại.`;
                    type = 'warning';
                    break;
                case 'COMPLETED':
                    title = 'Giao hàng thành công';
                    message = `Đơn hàng #${orderId} đã hoàn tất. Cảm ơn bạn đã mua sắm tại BookTotal!`;
                    type = 'success';
                    break;
                case 'CANCELLED':
                    title = 'Đơn hàng bị hủy';
                    message = `Đơn hàng #${orderId} đã bị hủy.`;
                    type = 'danger';
                    break;
            }

            await Notification.createNotification(order.user_id, title, message, type);
        }

        res.redirect('/admin/orders');
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi cập nhật trạng thái đơn hàng");
    }
});

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