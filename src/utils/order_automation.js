const cron = require('node-cron');
const db = require('../db');
const Notification = require('../models/Notification');
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
    } catch (err) {
        console.error(`[AUTO] Error updating order #${orderId}:`, err.message);
    }
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const startOrderAutomation = () => {
    console.log('--- Order Automation is DISABLED ---');
    // Đã vô hiệu hóa logic tự động cập nhật trạng thái đơn hàng
    // Admin sẽ thực hiện thủ công tại trang quản trị
};

module.exports = startOrderAutomation;
