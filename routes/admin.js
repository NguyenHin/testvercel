const express = require('express');
const router = express.Router();
const Product = require('../apps/models/product');
const User = require('../apps/models/user');
const { requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) return cb(null, true);
        cb(new Error("Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif)!"));
    }
});

router.get('/admin', requireAdmin, (req, res) => {
    res.render('admin/index');
});

router.get('/admin/products', requireAdmin, async (req, res) => {
    try {
        const products = await Product.getAllProducts();
        res.render('admin/product_list', { products: products });
    } catch (err) {
        res.status(500).send("Lỗi lấy dữ liệu");
    }
});

router.get('/admin/products/add', requireAdmin, async (req, res) => {
    try {
        const categories = await Product.getCategories();
        res.render('admin/product_add', { categories: categories });
    } catch (err) {
        res.status(500).send("Lỗi lấy dữ liệu danh mục");
    }
});

router.post('/admin/products/add', requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const data = req.body;

        if (!data.name || data.name.trim() === "") {
            return res.send(`<script>alert("Product name is required"); window.history.back();</script>`);
        }

        data.price = parseInt(data.price) || 0;
        if (data.price <= 0) {
            return res.send(`<script>alert("Price must be greater than 0"); window.history.back();</script>`);
        }

        if (req.file) data.image_url = req.file.filename;
        else data.image_url = 'default.jpg';

        data.quantity = parseInt(data.quantity) || 0;
        data.pages = data.pages ? parseInt(data.pages) : null;
        data.publication_year = data.publication_year ? parseInt(data.publication_year) : null;
        data.category_id = (data.category_id && parseInt(data.category_id) > 0) ? parseInt(data.category_id) : null;

        // author_name, publisher_name, supplier_name được truyền nguyên văn

        await Product.createProduct(data);
        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi khi thêm sản phẩm: " + err.message);
    }
});

router.get('/admin/products/edit/:id', requireAdmin, async (req, res) => {
    try {
        const product = await Product.getProductById(req.params.id);
        const categories = await Product.getCategories();

        if (!product) return res.status(404).send("Không tìm thấy sản phẩm này");

        res.render('admin/product_edit', {
            product: product,
            categories: categories
        });
    } catch (err) {
        res.status(500).send("Lỗi server khi tìm sản phẩm");
    }
});

router.post('/admin/products/edit/:id', requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const data = req.body;

        if (!data.name || data.name.trim() === "") {
            return res.send(`<script>alert("Product name is required"); window.history.back();</script>`);
        }

        data.price = parseInt(data.price) || 0;
        if (data.price <= 0) {
            return res.send(`<script>alert("Price must be greater than 0"); window.history.back();</script>`);
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
        res.status(500).send("Lỗi khi cập nhật: " + err.message);
    }
});

router.get('/admin/products/detail/:id', requireAdmin, async (req, res) => {
    try {
        const product = await Product.getProductById(req.params.id);
        if (!product) return res.status(404).send("Không tìm thấy sản phẩm này");
        res.render('admin/product_detail', { item: product });
    } catch (err) {
        res.status(500).send("Lỗi server khi tìm sản phẩm");
    }
});

router.get('/admin/products/delete/:id', requireAdmin, async (req, res) => {
    try {
        await Product.deleteProduct(req.params.id);
        res.redirect('/admin/products');
    } catch (err) {
        res.status(500).send("Lỗi khi xóa sản phẩm");
    }
});

router.get('/admin/user', requireAdmin, async (req, res) => {
    try {
        const users = await User.getAllUsers();
        res.render('admin/user/user_list', { users: users });
    } catch (err) {
        res.status(500).send("Lỗi lấy danh sách user");
    }
});

router.get('/admin/user/add', requireAdmin, (req, res) => {
    res.render('admin/user/add');
});

router.post('/admin/user/add', requireAdmin, async (req, res) => {
    try {
        const existingUser = await User.getUserByUsername(req.body.username);
        if (existingUser) return res.send("Username đã tồn tại!");
        await User.addUser(req.body);
        res.redirect('/admin/user');
    } catch (err) {
        res.status(500).send("Lỗi khi thêm user");
    }
});

router.get('/admin/user/delete/:id', requireAdmin, async (req, res) => {
    try {
        await User.deleteUser(req.params.id);
        res.redirect('/admin/user');
    } catch (err) {
        res.status(500).send("Lỗi khi xóa user");
    }
});

router.get('/admin/reviews', requireAdmin, async (req, res) => {
    try {
        const reviews = await Product.getAllReviewsForAdmin();
        res.render('admin/review_list', { reviews: reviews });
    } catch (err) {
        res.status(500).send("Lỗi lấy danh sách đánh giá");
    }
});

router.get('/admin/reviews/approve/:id', requireAdmin, async (req, res) => {
    try {
        await Product.updateReviewStatus(req.params.id, 'APPROVED');
        res.redirect('/admin/reviews');
    } catch (err) {
        res.status(500).send("Lỗi duyệt đánh giá");
    }
});

router.get('/admin/reviews/delete/:id', requireAdmin, async (req, res) => {
    try {
        await Product.deleteReview(req.params.id);
        res.redirect('/admin/reviews');
    } catch (err) {
        res.status(500).send("Lỗi xóa đánh giá");
    }
});

module.exports = router;