const Product = require('../../models/Product');

class AdminProductController {
    static async getList(req, res) {
        try {
            const products = await Product.getAllProducts();
            res.render('admin/products/product_list', { products: products });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lá»—i láº¥y dá»¯ liá»‡u sáº£n pháº©m");
        }
    }

    static async getAddForm(req, res) {
        try {
            const categories = await Product.getCategories();
            res.render('admin/products/product_add', { categories: categories });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lá»—i láº¥y dá»¯ liá»‡u danh má»¥c");
        }
    }

    static async processAdd(req, res) {
        try {
            const data = req.body;

            if (!data.name || data.name.trim() === "") {
                return res.send(`<script>alert("TÃªn sáº£n pháº©m khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng"); window.history.back();</script>`);
            }

            data.price = parseInt(data.price) || 0;
            if (data.price <= 0) {
                return res.send(`<script>alert("GiÃ¡ bÃ¡n pháº£i lá»›n hÆ¡n 0"); window.history.back();</script>`);
            }

            if (req.file) data.image_url = req.file.filename;
            else data.image_url = 'default.jpg';

            data.quantity = parseInt(data.quantity) || 0;
            data.pages = data.pages ? parseInt(data.pages) : null;
            data.publication_year = data.publication_year ? parseInt(data.publication_year) : null;
            data.category_id = (data.category_id && parseInt(data.category_id) > 0) ? parseInt(data.category_id) : null;

            await Product.createProduct(data);
            res.redirect('/admin/products');
        } catch (err) {
            console.error(err);
            res.status(500).send("Lá»—i khi thÃªm sáº£n pháº©m: " + err.message);
        }
    }

    static async getEditForm(req, res) {
        try {
            const product = await Product.getProductById(req.params.id);
            const categories = await Product.getCategories();

            if (!product) return res.status(404).send("KhÃ´ng tÃ¬m tháº¥y sáº£n pháº©m nÃ y");

            res.render('admin/products/product_edit', {
                product: product,
                categories: categories
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lá»—i server khi tÃ¬m sáº£n pháº©m");
        }
    }

    static async processEdit(req, res) {
        try {
            const data = req.body;

            if (!data.name || data.name.trim() === "") {
                return res.send(`<script>alert("TÃªn sáº£n pháº©m khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng"); window.history.back();</script>`);
            }

            data.price = parseInt(data.price) || 0;
            if (data.price <= 0) {
                return res.send(`<script>alert("GiÃ¡ bÃ¡n pháº£i lá»›n hÆ¡n 0"); window.history.back();</script>`);
            }

            if (req.file) data.image_url = req.file.filename;
            else data.image_url = req.body.old_image;
            delete data.old_image;

            data.quantity = parseInt(data.quantity) || 0;
            data.pages = data.pages ? parseInt(data.pages) : null;
            data.publication_year = data.publication_year ? parseInt(data.publication_year) : null;
            data.category_id = (data.category_id && parseInt(data.category_id) > 0) ? parseInt(data.category_id) : null;

            await Product.updateProduct(req.params.id, data);
            res.redirect('/admin/products');
        } catch (err) {
            console.error(err);
            res.status(500).send("Lá»—i khi cáº­p nháº­t: " + err.message);
        }
    }

    static async getDetail(req, res) {
        try {
            const product = await Product.getProductById(req.params.id);
            if (!product) return res.status(404).send("KhÃ´ng tÃ¬m tháº¥y sáº£n pháº©m nÃ y");
            res.render('admin/products/product_detail', { item: product });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lá»—i server khi tÃ¬m sáº£n pháº©m");
        }
    }

    static async delete(req, res) {
        try {
            await Product.deleteProduct(req.params.id);
            res.redirect('/admin/products');
        } catch (err) {
            console.error(err);
            res.status(500).send("Lá»—i khi xÃ³a sáº£n pháº©m");
        }
    }
}

module.exports = AdminProductController;


