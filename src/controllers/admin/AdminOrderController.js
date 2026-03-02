const Order = require('../../models/Order');
const Notification = require('../../models/Notification');

class AdminOrderController {
    static async getList(req, res) {
        try {
            const orders = await Order.getAllOrders();
            res.render('admin/order_list', { orders: orders });
        } catch (err) {
            res.status(500).send("Lá»—i láº¥y danh sÃ¡ch Ä‘Æ¡n hÃ ng");
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
                return res.status(404).send("ÄÆ¡n hÃ ng khÃ´ng tá»“n táº¡i");
            }

            if (!AdminOrderController.isValidTransition(order.status, newStatus)) {
                return res.redirect('/admin/orders?error=invalid_transition');
            }

            await Order.updateOrderStatus(orderId, newStatus);

            if (order.user_id) {
                let title = 'Cáº­p nháº­t Ä‘Æ¡n hÃ ng';
                let message = `ÄÆ¡n hÃ ng #${orderId} Ä‘Ã£ thay Ä‘á»•i tráº¡ng thÃ¡i.`;
                let type = 'info';

                switch (newStatus) {
                    case 'CONFIRMED':
                        title = 'ÄÆ¡n hÃ ng Ä‘Ã£ Ä‘Æ°á»£c xÃ¡c nháº­n';
                        message = `ÄÆ¡n hÃ ng #${orderId} cá»§a báº¡n Ä‘Ã£ Ä‘Æ°á»£c xÃ¡c nháº­n vÃ  Ä‘ang chá» xá»­ lÃ½.`;
                        break;
                    case 'PROCESSING':
                        title = 'Äang xá»­ lÃ½ Ä‘Æ¡n hÃ ng';
                        message = `ÄÆ¡n hÃ ng #${orderId} Ä‘ang Ä‘Æ°á»£c Ä‘Ã³ng gÃ³i.`;
                        break;
                    case 'SHIPPED':
                        title = 'ÄÃ£ giao cho váº­n chuyá»ƒn';
                        message = `ÄÆ¡n hÃ ng #${orderId} Ä‘Ã£ Ä‘Æ°á»£c bÃ n giao cho Ä‘Æ¡n vá»‹ váº­n chuyá»ƒn.`;
                        break;
                    case 'DELIVERING':
                        title = 'Äang giao hÃ ng';
                        message = `Shipper Ä‘ang giao Ä‘Æ¡n hÃ ng #${orderId} Ä‘áº¿n báº¡n.`;
                        type = 'warning';
                        break;
                    case 'COMPLETED':
                        title = 'Giao hÃ ng thÃ nh cÃ´ng';
                        message = `ÄÆ¡n hÃ ng #${orderId} Ä‘Ã£ hoÃ n táº¥t. Cáº£m Æ¡n báº¡n Ä‘Ã£ mua sáº¯m!`;
                        type = 'success';
                        break;
                    case 'CANCELLED':
                        title = 'ÄÆ¡n hÃ ng bá»‹ há»§y';
                        message = `ÄÆ¡n hÃ ng #${orderId} Ä‘Ã£ bá»‹ há»§y (hoáº·c giao tháº¥t báº¡i).`;
                        type = 'danger';
                        break;
                }
                await Notification.createNotification(order.user_id, title, message, type);
            }

            res.redirect('/admin/orders');
        } catch (err) {
            console.error(err);
            res.status(500).send("Lá»—i cáº­p nháº­t tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng");
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
            res.status(500).send("Lá»—i khi xÃ³a Ä‘Æ¡n hÃ ng");
        }
    }
}

module.exports = AdminOrderController;


