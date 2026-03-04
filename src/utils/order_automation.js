const cron = require('node-cron');
const db = require('../db');
const Notification = require('../models/notification');
const shipmentAPI = require('./shipment_api');

const updateStatusAndNotify = async (orderId, userId, newStatus, title, message, type, trackingCode = null) => {
    try {
        let query = 'UPDATE orders SET status = ? WHERE id = ?';
        let params = [newStatus, orderId];

        if (trackingCode) {
            query = 'UPDATE orders SET status = ?, tracking_code = ? WHERE id = ?';
            params = [newStatus, trackingCode, orderId];
        }

        await db.query(query, params);

        if (userId) {
            await Notification.createNotification(userId, title, message, type);
        }
        // console.log(`[AUTO] Order #${orderId} updated to ${newStatus}`); // Tắt log đỡ rối
    } catch (err) {
        console.error(`[AUTO] Error updating order #${orderId}:`, err.message);
    }
};

const startOrderAutomation = () => {
    console.log('--- Order Automation Started ---');

    // Chạy mỗi phút (*/1 * * * *)
    // Thêm scheduled: true để đảm bảo nó chạy
    cron.schedule('*/1 * * * *', async () => {
        try {
            // 1. PENDING -> CONFIRMED
            const [pendingOrders] = await db.query(`SELECT * FROM orders WHERE status = 'PENDING' AND order_date <= DATE_SUB(NOW(), INTERVAL 1 MINUTE)`);
            for (const order of pendingOrders) {
                await updateStatusAndNotify(order.id, order.user_id, 'CONFIRMED', 'Đơn hàng đã được xác nhận', `Đơn hàng #${order.id} của bạn đã được hệ thống xác nhận tự động.`, 'info');
            }

            // 2. CONFIRMED -> SHIPPED
            const [confirmedOrders] = await db.query(`SELECT * FROM orders WHERE status = 'CONFIRMED' AND updated_at <= DATE_SUB(NOW(), INTERVAL 2 MINUTE)`);
            for (const order of confirmedOrders) {
                const shipment = await shipmentAPI.createShipmentOrder(order);
                await updateStatusAndNotify(order.id, order.user_id, 'SHIPPED', 'Đơn hàng đã giao cho vận chuyển', `Đơn hàng #${order.id} đã được bàn giao cho GHN. Mã vận đơn: ${shipment.tracking_code}`, 'info', shipment.tracking_code);
            }

            // 3. SHIPPED -> DELIVERING
            const [shippedOrders] = await db.query(`SELECT * FROM orders WHERE status = 'SHIPPED' AND updated_at <= DATE_SUB(NOW(), INTERVAL 2 MINUTE)`);
            for (const order of shippedOrders) {
                await updateStatusAndNotify(order.id, order.user_id, 'DELIVERING', 'Đơn hàng đang được giao', `Shipper đang giao đơn hàng #${order.id} đến bạn.`, 'warning');
            }

            // 4. DELIVERING -> COMPLETED
            const [deliveringOrders] = await db.query(`SELECT * FROM orders WHERE status = 'DELIVERING' AND updated_at <= DATE_SUB(NOW(), INTERVAL 3 MINUTE)`);
            for (const order of deliveringOrders) {
                await updateStatusAndNotify(order.id, order.user_id, 'COMPLETED', 'Giao hàng thành công', `Đơn hàng #${order.id} đã hoàn tất. Cảm ơn bạn đã mua sắm!`, 'success');
            }

        } catch (err) {
            console.error('[AUTO] Error in automation cycle:', err.message);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Ho_Chi_Minh" // Đặt múi giờ chuẩn
    });
};

module.exports = startOrderAutomation;
