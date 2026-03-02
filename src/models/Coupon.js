const db = require('../db');

class Coupon {
    static async getCouponByCode(code) {
        try {
            const query = `
                SELECT * FROM coupons
                WHERE code = ?
                AND is_active = TRUE
                AND (expiration_date IS NULL OR expiration_date >= CURDATE())
                AND (usage_limit > used_count)
            `;
            const [rows] = await db.query(query, [code]);
            return rows[0];
        } catch (error) {
            console.error("Lá»—i láº¥y coupon:", error);
            return null;
        }
    }

    static async getAllActiveCoupons() {
        try {
            const query = `
                SELECT * FROM coupons
                WHERE is_active = TRUE
                AND (expiration_date IS NULL OR expiration_date >= CURDATE())
                AND (usage_limit > used_count)
                ORDER BY type ASC, discount_value DESC
            `;
            const [rows] = await db.query(query);
            return rows;
        } catch (error) {
            console.error("Lá»—i láº¥y danh sÃ¡ch coupon:", error);
            return [];
        }
    }

    static async updateUsage(code) {
        try {
            await db.query('UPDATE coupons SET used_count = used_count + 1 WHERE code = ?', [code]);
        } catch (error) {
            console.error("Lá»—i cáº­p nháº­t coupon:", error);
        }
    }
}

module.exports = Coupon;
