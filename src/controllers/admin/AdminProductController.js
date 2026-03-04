const Product = require('../../models/Product');

class AdminProductController {
    static async getList(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const offset = (page - 1) * limit;

            const filters = {
                keyword: req.query.keyword || '',
                category_id: req.query.category_id || '',
                status: req.query.status || 'all',
                limit: limit,
                offset: offset
            };

            const products = await Product.getAllProducts(filters);
            const totalProducts = await Product.countProducts(filters);
            const totalPages = Math.ceil(totalProducts / limit);

            const categories = await Product.getCategories();

            res.render('admin/products/product_list', {
                products,
                categories,
                query: filters,
                currentPage: page,
                totalPages: totalPages
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi lấy dữ liệu sản phẩm");
        }
    }

    static async getAddForm(req, res) {
        try {
            const categories = await Product.getCategories();
            res.render('admin/products/product_add', { categories: categories });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi lấy dữ liệu danh mục");
        }
    }

    static async processAdd(req, res) {
        try {
            const data = req.body;

            if (!data.name || data.name.trim() === "") {
                return res.send(`<script>alert("Tên sản phẩm không được để trống"); window.history.back();</script>`);
            }

            if (data.price) data.price = data.price.toString().replace(/\D/g, '');
            data.price = parseInt(data.price) || 0;
            if (data.price <= 0) {
                return res.send(`<script>alert("Giá bán phải lớn hơn 0"); window.history.back();</script>`);
            }

            if (req.file) data.image_url = req.file.filename;
            else data.image_url = 'default.jpg';

            data.quantity = parseInt(data.quantity) || 0;
            data.pages = data.pages ? parseInt(data.pages) : null;
            data.publication_year = data.publication_year ? parseInt(data.publication_year) : null;
            data.category_id = (data.category_id && parseInt(data.category_id) > 0) ? parseInt(data.category_id) : null;
            data.is_hidden = data.is_hidden ? parseInt(data.is_hidden) : 0;

            await Product.createProduct(data);
            res.redirect('/admin/products');
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi khi thêm sản phẩm: " + err.message);
        }
    }

    static async getEditForm(req, res) {
        try {
            const product = await Product.getProductById(req.params.id);
            const categories = await Product.getCategories();

            if (!product) return res.status(404).send("Không tìm thấy sản phẩm này");

            res.render('admin/products/product_edit', {
                product: product,
                categories: categories
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi server khi tìm sản phẩm");
        }
    }

    static async processEdit(req, res) {
        try {
            const data = req.body;

            if (!data.name || data.name.trim() === "") {
                return res.send(`<script>alert("Tên sản phẩm không được để trống"); window.history.back();</script>`);
            }

            if (data.price) data.price = data.price.toString().replace(/\D/g, '');
            data.price = parseInt(data.price) || 0;
            if (data.price <= 0) {
                return res.send(`<script>alert("Giá bán phải lớn hơn 0"); window.history.back();</script>`);
            }

            if (req.file) data.image_url = req.file.filename;
            else data.image_url = req.body.old_image;
            delete data.old_image;

            data.quantity = parseInt(data.quantity) || 0;
            data.pages = data.pages ? parseInt(data.pages) : null;
            data.publication_year = data.publication_year ? parseInt(data.publication_year) : null;
            data.category_id = (data.category_id && parseInt(data.category_id) > 0) ? parseInt(data.category_id) : null;
            data.is_hidden = data.is_hidden ? parseInt(data.is_hidden) : 0;

            await Product.updateProduct(req.params.id, data);
            res.redirect('/admin/products');
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi khi cập nhật: " + err.message);
        }
    }

    static async getDetail(req, res) {
        try {
            const product = await Product.getProductById(req.params.id);
            if (!product) return res.status(404).send("Không tìm thấy sản phẩm này");
            res.render('admin/products/product_detail', { item: product });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi server khi tìm sản phẩm");
        }
    }

    static async delete(req, res) {
        try {
            await Product.deleteProduct(req.params.id);
            res.redirect('/admin/products');
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi khi xóa sản phẩm");
        }
    }
}

module.exports = AdminProductController;
