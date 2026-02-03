var express = require("express");
var router = express.Router();

// Thêm dòng này để kiểm tra xem file này có được gọi không
console.log("--> Đã load file ProductController"); 

router.get("/", function(req, res) {
    console.log("--> Đã vào router Product"); // Log khi có người truy cập
    res.render("product");
});

module.exports = router;