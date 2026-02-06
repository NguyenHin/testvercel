// apps/controllers/index.js
var express = require("express");
var router = express.Router();
var multer = require("multer");

// --- IMPORT CÁC CONTROLLER CON ---
var homeController = require("./homecontroller");
var adminController = require("./admin/admincontroller");
var productController = require("./productcontroller"); // Import thêm Product nếu có

// --- CẤU HÌNH UPLOAD ẢNH (MULTER) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "public/images/"),
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage: storage });

// --- ĐỊNH NGHĨA ROUTE ---

// 1. TRANG CHỦ
router.get("/", homeController.index);

// 2. KHU VỰC ADMIN
router.get("/admin", adminController.index);
router.get("/admin/create", adminController.create);
router.post("/admin/store", upload.single("image"), adminController.store);

// 3. KHU VỰC SẢN PHẨM (Nếu bạn phát triển thêm trang chi tiết)
// Mọi đường dẫn bắt đầu bằng /product sẽ chạy vào productController
// Ví dụ: /product/detail/1
router.use("/product", productController); 

router.use("/auth", require(__dirname + "/authcontroller"));


module.exports = router;