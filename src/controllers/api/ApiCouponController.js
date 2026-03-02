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
            res.status(500).json({ success: false, message: "Lá»—i láº¥y mÃ£ giáº£m giÃ¡" });
        }
    }

    static async checkCoupon(req, res) {
        const { code, totalAmount, shippingFee = 30000 } = req.body;
        try {
            const coupon = await Coupon.getCouponByCode(code);
            if (!coupon) return res.json({ success: false, message: "MÃ£ khÃ´ng há»£p lá»‡ hoáº·c Ä‘Ã£ háº¿t háº¡n!" });
            if (totalAmount < coupon.min_order_value) return res.json({ success: false, message: `ÄÆ¡n hÃ ng pháº£i tá»« ${Number(coupon.min_order_value).toLocaleString('vi-VN')}Ä‘ má»›i Ä‘Æ°á»£c Ã¡p dá»¥ng!` });

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
                message = "Ãp dá»¥ng mÃ£ giáº£m giÃ¡ sáº£n pháº©m thÃ nh cÃ´ng!";
            } else if (coupon.type === 'shipping') {
                discount = coupon.discount_value;
                if (discount > shippingFee) discount = shippingFee;
                message = "Ãp dá»¥ng mÃ£ Freeship thÃ nh cÃ´ng!";
            }
            res.json({ success: true, message: message, discount: discount, type: coupon.type, code: coupon.code });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Lá»—i server" });
        }
    }
}

module.exports = ApiCouponController;


