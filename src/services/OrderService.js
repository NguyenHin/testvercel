const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');

class OrderService {
    static async createOrder(userId, shippingAddress, paymentMethod, items, couponCode = null) {
        if (!items || items.length === 0) {
            throw new Error("Không có sản phẩm trong đơn hàng");
        }

        let totalAmount = 0;

        // 1. Verify existence of items and calculate real amount
        // Avoid trusting client side totally
        for (let item of items) {
            const product = await Product.getProductById(item.id);
            if (!product) {
                throw new Error(`Sản phẩm ${item.id} không tồn tại`);
            }
            if (product.quantity < item.quantity) {
                throw new Error(`Sản phẩm ${product.name} không đủ số lượng`);
            }
            item.price = product.price; // Enforce DB price
            totalAmount += (product.price * item.quantity);
        }

        let shippingFee = totalAmount > 500000 ? 0 : 30000;
        let productDiscount = 0;

        // 2. Validate and apply coupon if present
        if (couponCode) {
            const coupon = await Coupon.getCouponByCode(couponCode);
            if (!coupon) {
                throw new Error("Mã giảm giá không hợp lệ hoặc đã hết hạn!");
            }
            if (totalAmount < coupon.min_order_value) {
                throw new Error(`Đơn hàng phải từ ${Number(coupon.min_order_value)}đ mới được áp dụng mã!`);
            }
            // Logic to calculate exact discount based on coupon type...
            if (coupon.type === 'product') {
                if (coupon.discount_type === 'percent') {
                    productDiscount = (totalAmount * coupon.discount_value) / 100;
                    if (coupon.max_discount_amount > 0 && productDiscount > coupon.max_discount_amount) {
                        productDiscount = coupon.max_discount_amount;
                    }
                } else {
                    productDiscount = coupon.discount_value;
                }
                if (productDiscount > totalAmount) productDiscount = totalAmount;
            }
        }

        const finalTotal = totalAmount + shippingFee - productDiscount;

        // 3. Create DB records
        const orderId = await Order.createOrder({
            user_id: userId,
            total_money: totalAmount,
            shipping_fee: shippingFee,
            discount_amount: productDiscount,
            final_total: finalTotal,
            shipping_address: shippingAddress,
            status: 'PENDING',
            payment_method: paymentMethod
        });

        // 4. Update order items and stock
        for (const item of items) {
            await Order.addOrderDetail(orderId, item.id, item.price, item.quantity);
            await Product.updateStock(item.id, item.quantity); // Decrements stock
        }

        if (couponCode) {
            await Coupon.updateUsage(couponCode);
        }

        // 5. Notify the user
        await Notification.createNotification(userId, 'Đặt hàng thành công', `Đơn hàng #${orderId} của bạn đã được ghi nhận.`, 'success');

        return {
            orderId,
            finalTotal,
            paymentMethod
        };
    }
}

module.exports = OrderService;
