const Order = require('../../models/Order');
const Notification = require('../../models/Notification');
const exceljs = require('exceljs');
const db = require('../../db');

class AdminOrderController {
    static async getList(req, res) {
        try {
            const filters = {
                keyword: req.query.keyword || '',
                status: req.query.status || 'all',
                payment_status: req.query.payment_status || 'all'
            };

            const orders = await Order.getFilteredOrders(filters);

            res.render('admin/order_list', {
                orders: orders,
                query: filters
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi lấy danh sách đơn hàng");
        }
    }

    static async getDetail(req, res) {
        try {
            const orderId = req.params.id;
            const order = await Order.getOrderById(orderId);
            if (!order) {
                return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
            }
            const items = await Order.getOrderItems(orderId);
            order.items = items;
            res.json({ success: true, data: order });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    static async updateStatus(req, res) {
        try {
            const orderId = req.params.id;
            const newStatus = req.params.status;

            const order = await Order.getOrderById(orderId);

            if (!order) {
                return res.status(404).send("Đơn hàng không tồn tại");
            }

            await Order.updateOrderStatus(orderId, newStatus);

            // Gửi thông báo cho người dùng
            if (order.user_id) {
                let title = 'Cập nhật đơn hàng';
                let message = `Đơn hàng #${orderId} đã thay đổi trạng thái.`;
                let type = 'info';

                switch (newStatus) {
                    case 'CONFIRMED':
                        title = 'Đơn hàng đã được xác nhận';
                        message = `Đơn hàng #${orderId} của bạn đã được xác nhận.`;
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
                        message = `Đơn hàng #${orderId} đã bị hủy.`;
                        type = 'danger';
                        break;
                }
                if (order.user_id) {
                     await Notification.createNotification(order.user_id, title, message, type);
                }
            }

            res.redirect('/admin/orders');
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi cập nhật trạng thái đơn hàng");
        }
    }

    static async updatePaymentStatus(req, res) {
        try {
            const orderId = req.params.id;
            const status = req.params.status; // PAID, UNPAID

            // Cập nhật trạng thái thanh toán trong DB
            await db.query('UPDATE orders SET payment_status = ? WHERE id = ?', [status, orderId]);

            res.redirect('/admin/orders');
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi cập nhật thanh toán");
        }
    }

    static async delete(req, res) {
        try {
            await db.query('DELETE FROM order_details WHERE order_id = ?', [req.params.id]);
            await db.query('DELETE FROM orders WHERE id = ?', [req.params.id]);

            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                 return res.json({ success: true, message: 'Đã xóa đơn hàng thành công' });
            }

            res.redirect('/admin/orders');
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi khi xóa đơn hàng');
        }
    }

    static async bulkAction(req, res) {
        try {
            const { action, orderIds } = req.body;

            if (!Array.isArray(orderIds) || orderIds.length === 0) {
                return res.json({ success: false, message: 'Vui lòng chọn ít nhất một đơn hàng.' });
            }

            if (action === 'delete') {
                for (let id of orderIds) {
                    await db.query('DELETE FROM order_details WHERE order_id = ?', [id]);
                    await db.query('DELETE FROM orders WHERE id = ?', [id]);
                }
                return res.json({ success: true, message: `Đã xóa thành công ${orderIds.length} đơn hàng.` });
            }

            return res.json({ success: false, message: 'Hành động không hợp lệ.' });
        } catch (error) {
            console.error('Bulk Action Error:', error);
            return res.json({ success: false, message: 'Đã xảy ra lỗi hệ thống.' });
        }
    }

    static async exportExcel(req, res) {
        try {
            const filters = {
                keyword: req.query.keyword || '',
                status: req.query.status || 'all',
                payment_status: req.query.payment_status || 'all'
            };

            const orders = await Order.getFilteredOrders(filters);

            const workbook = new exceljs.Workbook();
            const worksheet = workbook.addWorksheet('Danh Sách Đơn Hàng');

            worksheet.columns = [
                { header: 'Mã ĐH', key: 'id', width: 10 },
                { header: 'Khách Hàng', key: 'full_name', width: 25 },
                { header: 'Số Điện Thoại', key: 'phone', width: 15 },
                { header: 'Địa Chỉ', key: 'address', width: 40 },
                { header: 'Tổng Tiền', key: 'total', width: 15 },
                { header: 'Trạng Thái', key: 'status', width: 20 },
                { header: 'Thanh Toán', key: 'payment_status', width: 15 },
                { header: 'Ngày Đặt', key: 'order_date', width: 20 }
            ];

            orders.forEach(order => {
                let statusText = order.status;
                const statusMap = {
                    'PENDING': 'Chờ xác nhận',
                    'CONFIRMED': 'Đã xác nhận',
                    'PROCESSING': 'Đang xử lý',
                    'SHIPPED': 'Đã giao cho ĐVVC',
                    'DELIVERING': 'Đang giao hàng',
                    'COMPLETED': 'Hoàn thành',
                    'CANCELLED': 'Đã hủy'
                };
                statusText = statusMap[statusText] || statusText;

                worksheet.addRow({
                    id: '#' + order.id,
                    full_name: order.full_name || 'Khách Vãng Lai',
                    phone: order.phone || '',
                    address: order.shipping_address || '',
                    total: Number(order.final_total).toLocaleString('vi-VN') + ' đ',
                    status: statusText,
                    payment_status: order.payment_status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán',
                    order_date: new Date(order.order_date).toLocaleString('vi-VN')
                });
            });

            worksheet.getRow(1).font = { bold: true };

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=' + 'Danh_Sach_Don_Hang.xlsx');

            await workbook.xlsx.write(res);
            res.end();

        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi xuất file Excel");
        }
    }
}

module.exports = AdminOrderController;
