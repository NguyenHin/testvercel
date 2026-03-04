const Order = require('../../models/Order');
const Notification = require('../../models/Notification');

class AdminOrderController {
    static async getList(req, res) {
        try {
            const orders = await Order.getAllOrders();
            res.render('admin/order_list', { orders: orders });
        } catch (err) {
            res.status(500).send("Lỗi lấy danh sách đơn hàng");
        }
    }

    static isValidTransition(currentStatus, newStatus) {
        if (currentStatus === newStatus) return false;
        if (currentStatus === 'COMPLETED') return false;
        if (currentStatus === 'CANCELLED') return false;

        const rules = {
            'PENDING': ['CONFIRMED', 'CANCELLED'],
            'CONFIRMED': ['PROCESSING', 'CANCELLED'],
            'PROCESSING': ['SHIPPED', 'CANCELLED'],
            'SHIPPED': ['DELIVERING', 'COMPLETED', 'CANCELLED'],
            'DELIVERING': ['COMPLETED', 'CANCELLED']
        };

        return rules[currentStatus] && rules[currentStatus].includes(newStatus);
    }

    static async updateStatus(req, res) {
        try {
            const orderId = req.params.id;
            const newStatus = req.params.status;

            const order = await Order.getOrderById(orderId);

            if (!order) {
                return res.status(404).send("Đơn hàng không tồn tại");
            }

            if (!AdminOrderController.isValidTransition(order.status, newStatus)) {
                return res.redirect('/admin/orders?error=invalid_transition');
            }

            await Order.updateOrderStatus(orderId, newStatus);

            if (order.user_id) {
                let title = 'Cập nhật đơn hàng';
                let message = `Đơn hàng #${orderId} đã thay đổi trạng thái.`;
                let type = 'info';

                switch (newStatus) {
                    case 'CONFIRMED':
                        title = 'Đơn hàng đã được xác nhận';
                        message = `Đơn hàng #${orderId} của bạn đã được xác nhận và đang chờ xử lý.`;
                        break;
                    case 'PROCESSING':
                        title = 'Đang xử lý đơn hàng';
                        message = `Đơn hàng #${orderId} đang được đóng gói.`;
                        break;
                    case 'SHIPPED':
                        title = 'Đã giao cho vận chuyển';
                        message = `Đơn hàng #${orderId} đã được bàn giao cho đơn vị vận chuyển.`;
                        break;
                    case 'DELIVERING':
                        title = 'Đang giao hàng';
                        message = `Shipper đang giao đơn hàng #${orderId} đến bạn.`;
                        type = 'warning';
                        break;
                    case 'COMPLETED':
                        title = 'Giao hàng thành công';
                        message = `Đơn hàng #${orderId} đã hoàn tất. Cảm ơn bạn đã mua sắm!`;
                        type = 'success';
                        break;
                    case 'CANCELLED':
                        title = 'Đơn hàng bị hủy';
                        message = `Đơn hàng #${orderId} đã bị hủy (hoặc giao thất bại).`;
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
    }

    static async delete(req, res) {
        try {
            const order = await Order.getOrderById(req.params.id);
            if (order && (order.status === 'CANCELLED' || order.status === 'COMPLETED')) {
                await Order.deleteOrder(req.params.id);
            }
            res.redirect('/admin/orders');
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi khi xóa đơn hàng");
        }
    }
}

module.exports = AdminOrderController;


