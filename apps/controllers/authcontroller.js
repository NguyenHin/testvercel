var express = require("express");
var router = express.Router();

router.get("/login", function(req, res) {
    res.render("auth/login");
});

router.get("/register", function(req, res) {
    res.render("auth/register");
});
// XỬ LÝ ĐĂNG KÝ
router.post("/register", function(req, res) {
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;

    console.log("USER ĐĂNG KÝ:", username, email);

    // TẠM THỜI: giả lập đăng ký thành công
    res.render("auth/register", {
        message: "Đăng ký thành công!"
    });
    // XỬ LÝ LOGIN
    router.post("/login", function(req, res) {
        var username = req.body.username;
        var password = req.body.password;

        // TẠM THỜI: giả lập đúng user
        if (username === "admin" && password === "123") {
            req.session.user = {
                username: username
            };
            return res.redirect("/");
        }

        res.render("auth/login", {
            error: "Sai tài khoản hoặc mật khẩu"
        });
    });
});
module.exports = router;
