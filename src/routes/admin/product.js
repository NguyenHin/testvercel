const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const { requireAdmin } = require('../../middleware/auth');
const multer = require('multer');
const path = require('path');

// Cáº¥u hÃ¬nh upload áº£nh
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
        cb(new Error("Chá»‰ cháº¥p nháº­n file áº£nh (jpg, jpeg, png, gif)!"));
    }
}).single('image'); // Gá»i .single() á»Ÿ Ä‘Ã¢y luÃ´n

// Middleware xá»­ lÃ½ upload vÃ  báº¯t lá»—i
const handleUpload = (req, res, next) => {
    upload(req, res, function (err) {
        if (err) {
            // Náº¿u lá»—i tá»« Multer (vÃ­ dá»¥ sai Ä‘á»‹nh dáº¡ng file)
            return res.send(`<script>alert("${err.message}"); window.history.back();</script>`);
        }
        next();
    });
};

// Base path: /admin/products

const AdminProductController = require('../../controllers/admin/AdminProductController');

// 1. Danh sách sản phẩm
router.get('/', requireAdmin, AdminProductController.getList);

// 2. Form thêm sản phẩm
router.get('/add', requireAdmin, AdminProductController.getAddForm);

// 3. Xử lý thêm sản phẩm (Dùng handleUpload thay vì upload.single trực tiếp)
router.post('/add', requireAdmin, handleUpload, AdminProductController.processAdd);

// 4. Form sửa sản phẩm
router.get('/edit/:id', requireAdmin, AdminProductController.getEditForm);

// 5. Xử lý sửa sản phẩm (Dùng handleUpload)
router.post('/edit/:id', requireAdmin, handleUpload, AdminProductController.processEdit);

// 6. Xem chi tiết sản phẩm
router.get('/detail/:id', requireAdmin, AdminProductController.getDetail);

// 7. Xóa sản phẩm
router.get('/delete/:id', requireAdmin, AdminProductController.delete);

module.exports = router;


