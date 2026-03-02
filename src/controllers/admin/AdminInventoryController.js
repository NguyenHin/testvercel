const Product = require('../../models/Product');

class AdminInventoryController {
    static async getList(req, res) {
        try {
            const products = await Product.getAllProducts();
            res.render('admin/inventory_list', { products: products });
        } catch (err) {
            res.status(500).send("Lá»—i láº¥y dá»¯ liá»‡u kho");
        }
    }

    static async processImport(req, res) {
        try {
            const { product_id, quantity, note } = req.body;
            await Product.importStock(product_id, parseInt(quantity), note);
            res.redirect('/admin/inventory');
        } catch (err) {
            console.error(err);
            res.status(500).send("Lá»—i nháº­p kho");
        }
    }

    static async getLogs(req, res) {
        try {
            const logs = await Product.getInventoryLogs(req.params.id);
            res.json({ success: true, data: logs });
        } catch (err) {
            res.status(500).json({ success: false, message: "Lá»—i láº¥y lá»‹ch sá»­" });
        }
    }
}

module.exports = AdminInventoryController;


