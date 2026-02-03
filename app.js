var express = require("express");
var app = express();

// 1. Cấu hình Views (Giao diện)
app.set("views", __dirname + "/apps/views");
app.set("view engine", "ejs");

// 2. Cấu hình Static Files (CSS, JS, Ảnh)
// Để load file public/css/main.css
app.use("/static", express.static(__dirname + "/public"));

// 3. Cấu hình Controllers (Điều hướng)
var controller = require(__dirname + "/apps/controllers");
app.use(controller);

// 4. Chạy Server
var port = 3000;
app.listen(port, function() {
    console.log("Server đang chạy tại: http://localhost:" + port);
});