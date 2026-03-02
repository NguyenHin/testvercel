const Product = require('../models/Product');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

class OrderController {
    static processCheckout(req, res) {
        if (!res.locals.user) return res.redirect('/auth/login?returnUrl=/cart');

        const selectedIds = req.body.selected_items;
        let cart = req.cart || [];

        if (!selectedIds || selectedIds.length === 0) return res.redirect('/cart');

        const checkoutItems = cart.filter(item => selectedIds.includes(item.id.toString()));
        const totalAmount = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const productDiscount = parseFloat(req.body.product_discount) || 0;
        const shippingFee = totalAmount > 500000 ? 0 : 30000;

        res.cookie('checkoutData', JSON.stringify({ items: checkoutItems, totalAmount, productDiscount, shippingFee }), { maxAge: 10 * 60 * 1000 });
        res.redirect('/checkout');
    }

    static showCheckout(req, res) {
        if (!res.locals.user) return res.redirect('/auth/login?returnUrl=/cart');

        let checkoutData = {};
        if (req.cookies.checkoutData) {
            try { checkoutData = JSON.parse(req.cookies.checkoutData); } catch (e) { }
        }

        if (!checkoutData.items || checkoutData.items.length === 0) {
            return res.redirect('/cart');
        }

        res.render('checkout', {
            cart: checkoutData.items,
            totalAmount: checkoutData.totalAmount,
            productDiscount: checkoutData.productDiscount,
            shippingFee: checkoutData.shippingFee
        });
    }

    static async createOrder(req, res) {
        if (!res.locals.user) return res.redirect('/auth/login');
        if (res.locals.user.role === 'admin') return res.status(403).send("Admin không thể đặt hàng!");

        let checkoutData = {};
        if (req.cookies.checkoutData) {
            try { checkoutData = JSON.parse(req.cookies.checkoutData); } catch (e) { }
        }
        if (!checkoutData.items || checkoutData.items.length === 0) return res.redirect('/cart');

        const { full_name, phone, email, address, note, payment_method } = req.body;
        const userId = res.locals.user.id;
        const { totalAmount, shippingFee, productDiscount } = checkoutData;
        const finalTotal = totalAmount + shippingFee - productDiscount;

        try {
            const orderId = await Order.createOrder({
                user_id: userId,
                total_money: totalAmount,
                shipping_fee: shippingFee,
                discount_amount: productDiscount,
                final_total: finalTotal,
                shipping_address: `${full_name}, ${phone}, ${address} (${note})`,
                status: 'PENDING',
                payment_method: payment_method
            });

            for (const item of checkoutData.items) {
                await Order.addOrderDetail(orderId, item.id, item.price, item.quantity);
                await Product.updateStock(item.id, item.quantity);
            }

            let cart = req.cart || [];
            const boughtIds = checkoutData.items.map(item => item.id);
            cart = cart.filter(item => !boughtIds.includes(item.id));
            res.cookie('cart', JSON.stringify(cart), { maxAge: 24 * 60 * 60 * 1000 });
            res.clearCookie('checkoutData');

            if (payment_method === 'MOMO' || payment_method === 'VNPAY') {
                return res.render('payment_gateway', { orderId: orderId, amount: finalTotal, method: payment_method });
            } else {
                await Notification.createNotification(userId, 'Đặt hàng thành công', `Đơn hàng #${orderId} của bạn đã được ghi nhận.`, 'success');
                res.redirect(`/order/success/${orderId}`);
            }

        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi khi đặt hàng");
        }
    }

    static async showOrderSuccess(req, res) {
        if (!res.locals.user) return res.redirect('/');
        res.render('order_success', { orderId: req.params.id });
    }

    static async getOrderHistory(req, res) {
        if (!res.locals.user) return res.redirect('/auth/login');
        try {
            const orders = await Order.getOrdersByUserId(res.locals.user.id);
            res.render('order_history', { orders: orders });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi lấy lịch sử đơn hàng");
        }
    }

    static async processPayment(req, res) {
        const { orderId, status } = req.body;
        const userId = res.locals.user ? res.locals.user.id : null;

        try {
            if (status === 'SUCCESS') {
                await Order.updateOrderStatus(orderId, 'CONFIRMED');
                if (userId) await Notification.createNotification(userId, 'Thanh toán thành công', `Đơn hàng #${orderId} đã được thanh toán thành công.`, 'success');
                res.redirect(`/order/success/${orderId}`);
            } else {
                await Order.updateOrderStatus(orderId, 'CANCELLED');
                if (userId) await Notification.createNotification(userId, 'Thanh toán thất bại', `Đơn hàng #${orderId} đã bị hủy do thanh toán thất bại.`, 'danger');
                res.send(`<div style="text-align:center; padding: 50px;"><h2 style="color: red;">Thanh toán thất bại!</h2><p>Đơn hàng #${orderId} đã bị hủy.</p><a href="/">Về trang chủ</a></div>`);
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi xử lý thanh toán");
        }
    }
}

module.exports = OrderController;
