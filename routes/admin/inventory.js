const express = require('express');
const router = express.Router();
const Product = require('../../apps/models/product');
const { requireAdmin } = require('../../middleware/auth');

// Base path: /admin/inventory

router.get('/', requireAdmin, async (req, res) => {
    try {
        const products = await Product.getAllProducts();
        res.render('admin/inventory_list', { products: products });
    } catch (err) {
        res.status(500).send("Lỗi lấy dữ liệu kho");
    }
});

router.post('/import', requireAdmin, async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        // Gọi hàm importStock chuyên dụng (chỉ tăng kho, không tăng đã bán)
        await Product.importStock(product_id, parseInt(quantity));
        res.redirect('/admin/inventory');
    } catch (err) {
        res.status(500).send("Lỗi nhập kho");
    }
});

module.exports = router;