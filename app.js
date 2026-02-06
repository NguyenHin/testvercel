
// app.js
const express = require("express");
const app = express();
const port = 3000;

var express = require("express");
var session = require("express-session");
var app = express();


// 1. Cấu hình View Engine (EJS)
app.set("view engine", "ejs");
app.set("views", __dirname + "/apps/views"); // Trỏ đúng thư mục Views

// 2. Cấu hình Public (CSS, JS, Ảnh)
app.use(express.static(__dirname + "/public"));


// 3. Cấu hình nhận dữ liệu Form
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 4. GỌI CONTROLLER CHÍNH (Router)
// Dòng này sẽ tự động tìm file index.js trong thư mục apps/controllers
app.use(require(__dirname + "/apps/controllers")); 

// Khởi động Server
app.listen(port, () => {
    console.log(`Server đang chạy tại: http://localhost:${port}`);
});
=======

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

// 3. Cấu hình Controllers (Điều hướng)
var controller = require(__dirname + "/apps/controllers");
app.use(controller);



// 4. Chạy Server
var port = 3000;
app.listen(port, function() {
    console.log("Server đang chạy tại: http://localhost:" + port);
});
>>>>>>> 818086f3a5e7648cff072a20643f6dfa9bdd426d
