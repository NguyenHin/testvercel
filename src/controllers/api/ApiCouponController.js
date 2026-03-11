const Coupon = require('../../models/Coupon');

class ApiCouponController {
    static async getAllCoupons(req, res) {
        try {
            const coupons = await Coupon.getAllActiveCoupons();
            const productCoupons = coupons.filter(c => c.type && c.type.toLowerCase() === 'product');
            const shippingCoupons = coupons.filter(c => c.type && c.type.toLowerCase() === 'shipping');
            res.json({ success: true, data: { product: productCoupons, shipping: shippingCoupons } });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Lỗi lấy mã giảm giá" });
        }
    }

    static async checkCoupon(req, res) {
        const { code, totalAmount, shippingFee = 30000 } = req.body;
        try {
            const coupon = await Coupon.getCouponByCode(code);
            if (!coupon) return res.json({ success: false, message: "Mã không hợp lệ hoặc đã hết hạn!" });
            if (totalAmount < coupon.min_order_value) return res.json({ success: false, message: `Đơn hàng phải từ ${Number(coupon.min_order_value).toLocaleString('vi-VN')}đ mới được áp dụng!` });

            let discount = 0;
            let message = "";
            if (coupon.type === 'product') {
                if (coupon.discount_type === 'percent') {
                    discount = (totalAmount * coupon.discount_value) / 100;
                    if (coupon.max_discount_amount > 0 && discount > coupon.max_discount_amount) discount = coupon.max_discount_amount;
                } else {
                    discount = coupon.discount_value;
                }
                if (discount > totalAmount) discount = totalAmount;
                message = "Áp dụng mã giảm giá sản phẩm thành công!";
            } else if (coupon.type === 'shipping') {
                discount = coupon.discount_value;
                if (discount > shippingFee) discount = shippingFee;
                message = "Áp dụng mã Freeship thành công!";
            }
            res.json({ success: true, message: message, discount: discount, type: coupon.type, code: coupon.code });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Lỗi server" });
        }
    }
}

module.exports = ApiCouponController;


