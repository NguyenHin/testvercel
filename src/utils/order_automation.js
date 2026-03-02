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
        // console.log(`[AUTO] Order #${orderId} updated to ${newStatus}`); // Táº¯t log Ä‘á»¡ rá»‘i
    } catch (err) {
        console.error(`[AUTO] Error updating order #${orderId}:`, err.message);
    }
};

const startOrderAutomation = () => {
    console.log('--- Order Automation Started ---');

    // Cháº¡y má»—i phÃºt (*/1 * * * *)
    // ThÃªm scheduled: true Ä‘á»ƒ Ä‘áº£m báº£o nÃ³ cháº¡y
    cron.schedule('*/1 * * * *', async () => {
        try {
            // 1. PENDING -> CONFIRMED
            const [pendingOrders] = await db.query(`SELECT * FROM orders WHERE status = 'PENDING' AND order_date <= DATE_SUB(NOW(), INTERVAL 1 MINUTE)`);
            for (const order of pendingOrders) {
                await updateStatusAndNotify(order.id, order.user_id, 'CONFIRMED', 'ÄÆ¡n hÃ ng Ä‘Ã£ Ä‘Æ°á»£c xÃ¡c nháº­n', `ÄÆ¡n hÃ ng #${order.id} cá»§a báº¡n Ä‘Ã£ Ä‘Æ°á»£c há»‡ thá»‘ng xÃ¡c nháº­n tá»± Ä‘á»™ng.`, 'info');
            }

            // 2. CONFIRMED -> SHIPPED
            const [confirmedOrders] = await db.query(`SELECT * FROM orders WHERE status = 'CONFIRMED' AND updated_at <= DATE_SUB(NOW(), INTERVAL 2 MINUTE)`);
            for (const order of confirmedOrders) {
                const shipment = await shipmentAPI.createShipmentOrder(order);
                await updateStatusAndNotify(order.id, order.user_id, 'SHIPPED', 'ÄÆ¡n hÃ ng Ä‘Ã£ giao cho váº­n chuyá»ƒn', `ÄÆ¡n hÃ ng #${order.id} Ä‘Ã£ Ä‘Æ°á»£c bÃ n giao cho GHN. MÃ£ váº­n Ä‘Æ¡n: ${shipment.tracking_code}`, 'info', shipment.tracking_code);
            }

            // 3. SHIPPED -> DELIVERING
            const [shippedOrders] = await db.query(`SELECT * FROM orders WHERE status = 'SHIPPED' AND updated_at <= DATE_SUB(NOW(), INTERVAL 2 MINUTE)`);
            for (const order of shippedOrders) {
                await updateStatusAndNotify(order.id, order.user_id, 'DELIVERING', 'ÄÆ¡n hÃ ng Ä‘ang Ä‘Æ°á»£c giao', `Shipper Ä‘ang giao Ä‘Æ¡n hÃ ng #${order.id} Ä‘áº¿n báº¡n.`, 'warning');
            }

            // 4. DELIVERING -> COMPLETED
            const [deliveringOrders] = await db.query(`SELECT * FROM orders WHERE status = 'DELIVERING' AND updated_at <= DATE_SUB(NOW(), INTERVAL 3 MINUTE)`);
            for (const order of deliveringOrders) {
                await updateStatusAndNotify(order.id, order.user_id, 'COMPLETED', 'Giao hÃ ng thÃ nh cÃ´ng', `ÄÆ¡n hÃ ng #${order.id} Ä‘Ã£ hoÃ n táº¥t. Cáº£m Æ¡n báº¡n Ä‘Ã£ mua sáº¯m!`, 'success');
            }

        } catch (err) {
            console.error('[AUTO] Error in automation cycle:', err.message);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Ho_Chi_Minh" // Äáº·t mÃºi giá» chuáº©n
    });
};

module.exports = startOrderAutomation;
