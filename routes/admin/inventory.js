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
        const { product_id, quantity, note } = req.body;
        await Product.importStock(product_id, parseInt(quantity), note);
        res.redirect('/admin/inventory');
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi nhập kho");
    }
});

// Route xem lịch sử nhập hàng (API trả về JSON cho Modal)
router.get('/logs/:id', requireAdmin, async (req, res) => {
    try {
        const logs = await Product.getInventoryLogs(req.params.id);
        res.json({ success: true, data: logs });
    } catch (err) {
        res.status(500).json({ success: false, message: "Lỗi lấy lịch sử" });
    }
});

module.exports = router;