const db = require('../../db');

module.exports = {
    createOrder: async (data) => {
        const { user_id, total_money, shipping_fee, discount_amount, final_total, shipping_address, status } = data;
        const query = `
            INSERT INTO orders (user_id, total_money, shipping_fee, discount_amount, final_total, shipping_address, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [user_id, total_money, shipping_fee, discount_amount, final_total, shipping_address, status]);
        return result.insertId;
    },

    addOrderDetail: async (orderId, productId, price, quantity) => {
        const query = `INSERT INTO order_details (order_id, product_id, price_at_purchase, quantity) VALUES (?, ?, ?, ?)`;
        await db.query(query, [orderId, productId, price, quantity]);
    },

    getAllOrders: async () => {
        const query = `
            SELECT o.*, u.full_name
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.order_date DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    updateOrderStatus: async (id, status) => {
        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    },

    // SỬA: Xóa chi tiết trước rồi mới xóa đơn hàng (An toàn hơn)
    deleteOrder: async (id) => {
        await db.query('DELETE FROM order_details WHERE order_id = ?', [id]);
        await db.query('DELETE FROM orders WHERE id = ?', [id]);
    },

    getRevenueStats: async () => {
        const query = `
            SELECT
                DATE(order_date) as date,
                SUM(final_total) as revenue
            FROM orders
            WHERE status = 'COMPLETED'
            AND order_date >= DATE(NOW()) - INTERVAL 7 DAY
            GROUP BY DATE(order_date)
            ORDER BY date ASC
        `;
        const [rows] = await db.query(query);
        return rows;
    }
};