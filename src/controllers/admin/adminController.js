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

    getStats: async (req, res) => {
        try {
            // 1. Tổng doanh thu thực tế (Chỉ tính đơn đã hoàn thành)
            const [revenueResult] = await db.query("SELECT SUM(final_total) as total FROM orders WHERE status = 'COMPLETED'");
            const totalRevenue = revenueResult[0].total || 0;

            // 2. Tổng số đơn hàng
            const [totalOrdersResult] = await db.query("SELECT COUNT(*) as count FROM orders");
            const totalOrders = totalOrdersResult[0].count || 0;

            // 3. Thống kê trạng thái đơn hàng
            const [statusStats] = await db.query(`
                SELECT status, COUNT(*) as count
                FROM orders
                GROUP BY status
            `);

            const orderStats = {
                PENDING: 0,
                CONFIRMED: 0,
                SHIPPING: 0,
                COMPLETED: 0,
                CANCELLED: 0
            };

            statusStats.forEach(stat => {
                // Chuẩn hóa key nếu cần, giả sử DB lưu uppercase
                const statusKey = stat.status.toUpperCase();
                orderStats[statusKey] = stat.count;
            });

            // 4. Biểu đồ doanh thu 7 ngày gần nhất
            const revenueChartData = await Order.getRevenueStats();
            const labels = [];
            const data = [];

            revenueChartData.forEach(item => {
                const dateStr = item.date instanceof Date ? item.date.toLocaleDateString('vi-VN') : item.date;
                labels.push(dateStr);
                data.push(item.revenue);
            });

            // 5. Danh sách chi tiết các đơn hàng gần đây (để theo dõi)
            const [recentOrders] = await db.query(`
                SELECT o.*, u.full_name
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                ORDER BY o.order_date DESC
                LIMIT 20
            `);

            res.render('admin/stats', {
                totalRevenue,
                totalOrders,
                orderStats,
                labels,
                data,
                recentOrders
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi trang Thống kê");
        }
    }
};
