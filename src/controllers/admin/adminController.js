const Product = require('../../models/Product');
const Order = require('../../models/Order');
const User = require('../../models/User');
const db = require('../../db');

module.exports = {
    dashboard: async (req, res) => {
        try {
            // 1. Thống kê tổng quan
            const [totalRevenue] = await db.query("SELECT SUM(final_total) as total FROM orders WHERE status = 'COMPLETED'");
            const [totalOrders] = await db.query("SELECT COUNT(*) as count FROM orders");
            const [totalUsers] = await db.query("SELECT COUNT(*) as count FROM users WHERE role != 'admin'");
            const [lowStock] = await db.query("SELECT COUNT(*) as count FROM products WHERE quantity < 10");

            // 2. Biểu đồ doanh thu 7 ngày gần nhất
            const revenueStats = await Order.getRevenueStats();

            // 3. Đơn hàng mới nhất
            const [recentOrders] = await db.query(`
                SELECT o.*, u.full_name
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                ORDER BY o.order_date DESC LIMIT 5
            `);

            res.render('admin/index', {
                stats: {
                    revenue: totalRevenue[0].total || 0,
                    orders: totalOrders[0].count || 0,
                    users: totalUsers[0].count || 0,
                    lowStock: lowStock[0].count || 0
                },
                revenueChart: revenueStats,
                recentOrders: recentOrders
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi Dashboard");
        }
    },

    // ... Các hàm khác cho Product, Order sẽ chuyển dần ...
};


