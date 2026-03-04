const Category = require('../../models/Category');
const Product = require('../../models/Product'); // To get product count per category, if needed later

class AdminCategoryController {
    static async getList(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const offset = (page - 1) * limit;

            const filters = {
                keyword: req.query.keyword || '',
                limit: limit,
                offset: offset
            };

            const categories = await Category.getAllCategories(filters);
            const totalCategories = await Category.countCategories(filters);
            const totalPages = Math.ceil(totalCategories / limit);

            res.render('admin/categories/category_list', {
                categories,
                query: filters,
                currentPage: page,
                totalPages: totalPages
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi lấy dữ liệu danh mục");
        }
    }

    static async getAddForm(req, res) {
        res.render('admin/categories/category_add');
    }

    static async processAdd(req, res) {
        try {
            const data = req.body;

            if (!data.name || data.name.trim() === "") {
                return res.send(`<script>alert("Tên danh mục không được để trống"); window.history.back();</script>`);
            }

            await Category.createCategory(data);
            res.redirect('/admin/categories');
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi khi thêm danh mục: " + err.message);
        }
    }

    static async getEditForm(req, res) {
        try {
            const category = await Category.getCategoryById(req.params.id);

            if (!category) return res.status(404).send("Không tìm thấy danh mục này");

            res.render('admin/categories/category_edit', {
                category: category
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi server khi tìm danh mục");
        }
    }

    static async processEdit(req, res) {
        try {
            const data = req.body;

            if (!data.name || data.name.trim() === "") {
                return res.send(`<script>alert("Tên danh mục không được để trống"); window.history.back();</script>`);
            }

            await Category.updateCategory(req.params.id, data);
            res.redirect('/admin/categories');
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi khi cập nhật danh mục: " + err.message);
        }
    }

    static async delete(req, res) {
        try {
            // Check if there are products using this category could be done here.
            await Category.deleteCategory(req.params.id);
            res.redirect('/admin/categories');
        } catch (err) {
            console.error(err);
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                res.send(`<script>alert("Không thể xóa danh mục này vì đang có sản phẩm thuộc danh mục."); window.history.back();</script>`);
            } else {
                res.status(500).send("Lỗi khi xóa danh mục");
            }
        }
    }
}

module.exports = AdminCategoryController;
