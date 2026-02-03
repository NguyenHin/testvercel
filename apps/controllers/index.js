var express = require("express");
var router = express.Router();

// 1. TRANG CHỦ (http://localhost:3000/)
// Khi vào trang chủ -> Hiện giao diện home.ejs ngay
router.get("/", function(req, res) {
    res.render("home");
});

// 2. SẢN PHẨM (http://localhost:3000/product)
router.use("/product", require(__dirname + "/productcontroller"));

// 3. ADMIN (http://localhost:3000/admin)
// Đừng quên dòng này, nó rất quan trọng!
router.use("/admin", require(__dirname + "/admin/admincontroller"));

module.exports = router;