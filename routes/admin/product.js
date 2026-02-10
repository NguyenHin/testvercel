const express = require('express');
const router = express.Router();
const Product = require('../../apps/models/product');
const { requireAdmin } = require('../../middleware/auth');
const multer = require('multer');
const path = require('path');

// Cấu hình upload ảnh
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
}).single('image'); // Gọi .single() ở đây luôn

// Middleware xử lý upload và bắt lỗi
const handleUpload = (req, res, next) => {
    upload(req, res, function (err) {
        if (err) {
            // Nếu lỗi từ Multer (ví dụ sai định dạng file)
            return res.send(`<script>alert("${err.message}"); window.history.back();</script>`);
        }
        next();
    });
};

// Base path: /admin/products

// 1. Danh sách sản phẩm
router.get('/', requireAdmin, async (req, res) => {
    try {
        const products = await Product.getAllProducts();
        res.render('admin/products/product_list', { products: products });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi lấy dữ liệu sản phẩm");
    }
});

// 2. Form thêm sản phẩm
router.get('/add', requireAdmin, async (req, res) => {
    try {
        const categories = await Product.getCategories();
        res.render('admin/products/product_add', { categories: categories });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi lấy dữ liệu danh mục");
    }
});

// 3. Xử lý thêm sản phẩm (Dùng handleUpload thay vì upload.single trực tiếp)
router.post('/add', requireAdmin, handleUpload, async (req, res) => {
    try {
        const data = req.body;

        if (!data.name || data.name.trim() === "") {
            return res.send(`<script>alert("Tên sản phẩm không được để trống"); window.history.back();</script>`);
        }

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

        await Product.createProduct(data);
        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi khi thêm sản phẩm: " + err.message);
    }
});

// 4. Form sửa sản phẩm
router.get('/edit/:id', requireAdmin, async (req, res) => {
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
});

// 5. Xử lý sửa sản phẩm (Dùng handleUpload)
router.post('/edit/:id', requireAdmin, handleUpload, async (req, res) => {
    try {
        const data = req.body;

        if (!data.name || data.name.trim() === "") {
            return res.send(`<script>alert("Tên sản phẩm không được để trống"); window.history.back();</script>`);
        }

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

        await Product.updateProduct(req.params.id, data);
        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi khi cập nhật: " + err.message);
    }
});

// 6. Xem chi tiết sản phẩm
router.get('/detail/:id', requireAdmin, async (req, res) => {
    try {
        const product = await Product.getProductById(req.params.id);
        if (!product) return res.status(404).send("Không tìm thấy sản phẩm này");
        res.render('admin/products/product_detail', { item: product });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server khi tìm sản phẩm");
    }
});

// 7. Xóa sản phẩm
router.get('/delete/:id', requireAdmin, async (req, res) => {
    try {
        await Product.deleteProduct(req.params.id);
        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi khi xóa sản phẩm");
    }
});

module.exports = router;