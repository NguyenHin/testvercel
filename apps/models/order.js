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

    getOrderById: async (id) => {
        const query = `
            SELECT o.*, u.full_name, u.phone, u.email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        `;
        const [rows] = await db.query(query, [id]);
        return rows[0];
    },

    // Hàm MỚI: Lấy danh sách sản phẩm của đơn hàng
    getOrderItems: async (orderId) => {
        const query = `
            SELECT od.*, p.name, p.image_url
            FROM order_details od
            JOIN products p ON od.product_id = p.id
            WHERE od.order_id = ?
        `;
        const [rows] = await db.query(query, [orderId]);
        return rows;
    },

    getOrdersByUserId: async (userId) => {
        const orderQuery = `SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC`;
        const [orders] = await db.query(orderQuery, [userId]);

        for (let order of orders) {
            const itemQuery = `
                SELECT od.*, p.name, p.image_url
                FROM order_details od
                JOIN products p ON od.product_id = p.id
                WHERE od.order_id = ?
            `;
            const [items] = await db.query(itemQuery, [order.id]);
            order.items = items;
        }
        return orders;
    },

    updateOrderStatus: async (id, status) => {
        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    },

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