const Product = require('../../models/Product');

class AdminInventoryController {
    static async getList(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const offset = (page - 1) * limit;

            const filters = {
                keyword: req.query.keyword || '',
                category_id: req.query.category_id || '',
                stock_status: req.query.stock_status || 'all',
                limit: limit,
                offset: offset
            };

            const products = await Product.getAllProducts(filters);
            const totalProductsFiltered = await Product.countProducts(filters);
            const totalPages = Math.ceil(totalProductsFiltered / limit);

            const categories = await Product.getCategories();

            // Top indicators
            const totalProducts = await Product.getTotalStockQuantity();
            const lowStockProducts = await Product.countProducts({ stock_status: 'low' });

            res.render('admin/inventory_list', {
                products,
                categories,
                query: filters,
                currentPage: page,
                totalPages,
                totalProducts,
                lowStockProducts
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi lấy dữ liệu kho");
        }
    }

    static async processImport(req, res) {
        try {
            const { product_id, quantity, note } = req.body;
            await Product.importStock(product_id, parseInt(quantity), note);
            res.redirect('/admin/inventory');
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi nhập kho");
        }
    }

    static async processExport(req, res) {
        try {
            const { product_id, quantity, note } = req.body;
            await Product.exportStock(product_id, parseInt(quantity), note);
            res.redirect('/admin/inventory');
        } catch (err) {
            console.error(err);
            res.send(`<script>alert("${err.message || 'Lỗi xuất kho'}"); window.history.back();</script>`);
        }
    }

    static async getLogs(req, res) {
        try {
            const logs = await Product.getInventoryLogs(req.params.id);
            res.json({ success: true, data: logs });
        } catch (err) {
            res.status(500).json({ success: false, message: "Lỗi lấy lịch sử" });
        }
    }
}

module.exports = AdminInventoryController;


