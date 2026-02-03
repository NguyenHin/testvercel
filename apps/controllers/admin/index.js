var express = require("express");
var router = express.Router();

router.get("/", function(req, res) {
    res.render("home");
});

router.use("/product", require(__dirname + "/productcontroller"));

// Dán dòng code bạn vừa hỏi vào đây:
router.use("/admin", require(__dirname + "/admin/admincontroller"));

module.exports = router;