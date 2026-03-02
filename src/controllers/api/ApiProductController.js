const Product = require('../../models/Product');

class ApiProductController {
    static async getAllProducts(req, res) {
        try {
            const products = await Product.getAllProducts();
            res.status(200).json({ success: true, data: products });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async getProductById(req, res) {
        try {
            const product = await Product.getProductById(req.params.id);
            if (!product) return res.status(404).json({ success: false, message: "Product not found" });
            res.status(200).json({ success: true, data: product });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = ApiProductController;


