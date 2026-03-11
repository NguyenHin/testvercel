const Order = require('../../models/Order');
const db = require('../../db');

class ApiOrderController {
    static async getOrderDetails(req, res) {
        try {
            const orderId = req.params.id;
            const order = await Order.getOrderById(orderId);
            if (!order) return res.status(404).json({ success: false, message: "Order not found" });

            const items = await Order.getOrderItems(orderId);
            order.items = items;

            res.json({ success: true, data: order });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Lỗi server" });
        }
    }

    static async getProvinces(req, res) {
        try {
            const [rows] = await db.query('SELECT * FROM provinces ORDER BY name');
            res.json(rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Lỗi lấy tỉnh thành' });
        }
    }

    static async getDistricts(req, res) {
        try {
            const [rows] = await db.query('SELECT * FROM districts WHERE province_code = ? ORDER BY name', [req.params.provinceCode]);
            res.json(rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Lỗi lấy quận huyện' });
        }
    }

    static async getWards(req, res) {
        try {
            const [rows] = await db.query('SELECT * FROM wards WHERE district_code = ? ORDER BY name', [req.params.districtCode]);
            res.json(rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Lỗi lấy phường xã' });
        }
    }
}

module.exports = ApiOrderController;



