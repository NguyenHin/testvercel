var express = require("express");
var router = express.Router();

// Import Model User (Class thường, không phải Mongoose)
// LƯU Ý: Nếu thư mục của bạn tên là "model" (không có s) thì sửa đường dẫn thành "../../model/user"
var User = require("../../models/user");

// Trang chính Admin
router.get("/", function(req, res) {
    res.json({ "message": "Đây là trang Admin (Chưa có DB)" });
});

// Trang Quản lý User (View)
router.get("/user", function(req, res) {
    res.render("admin/userManage");
});

// API lấy danh sách User (Dữ liệu giả)
router.get("/getuserlist", function(req, res) {
    var userList = [];
    
    // TẠO GIẢ 5 USER ĐỂ TEST
    for (var i = 0; i < 5; i++) {
        var u = new User();
        u.id = (i + 1);
        u.name = "Người dùng mẫu " + (i + 1);
        userList.push(u);
    }
    
    res.json(userList);
});

module.exports = router;