const express = require('express');
const router = express.Router();
const User = require('../../apps/models/user');
const { requireAdmin } = require('../../middleware/auth');

// Base path: /admin/user

// GET: Danh sách user
router.get('/', requireAdmin, async (req, res) => {
    try {
        const users = await User.getAllUsers();
        res.render('admin/user/user_list', { users: users });
    } catch (err) {
        res.status(500).send("Lỗi lấy danh sách user");
    }
});

// GET: Form thêm user
router.get('/add', requireAdmin, (req, res) => {
    // Truyền thêm biến errors (nếu có) từ flash
    res.render('admin/user/add', {
        errors: req.flash('errors'),
        formData: req.flash('formData')[0] || {} // Giữ lại dữ liệu cũ
    });
});

// POST: Xử lý thêm user
router.post('/add', requireAdmin, async (req, res) => {
    try {
        const { username, email, full_name, password, role } = req.body;
        let errors = {};

        // Kiểm tra trùng Username
        const existingUser = await User.getUserByUsername(username);
        if (existingUser) {
            errors.username = "Tên đăng nhập đã tồn tại!";
        }

        // Kiểm tra trùng Email (Giả lập check, thực tế cần thêm hàm trong Model)
        // const existingEmail = await User.getUserByEmail(email);
        // if (existingEmail) errors.email = "Email đã được sử dụng!";

        if (Object.keys(errors).length > 0) {
            // Nếu có lỗi, lưu lỗi và dữ liệu vào flash rồi redirect
            req.flash('errors', errors);
            req.flash('formData', req.body);
            return res.redirect('/admin/user/add');
        }

        await User.addUser(req.body);
        res.redirect('/admin/user');
    } catch (err) {
        console.error(err);
        // Xử lý lỗi DB (nếu có)
        if (err.code === 'ER_DUP_ENTRY') {
            let errors = {};
            if (err.message.includes('email')) errors.email = "Email đã được sử dụng!";
            if (err.message.includes('username')) errors.username = "Tên đăng nhập đã tồn tại!";

            req.flash('errors', errors);
            req.flash('formData', req.body);
            return res.redirect('/admin/user/add');
        }
        res.status(500).send("Lỗi khi thêm user: " + err.message);
    }
});

// GET: Xóa user
router.get('/delete/:id', requireAdmin, async (req, res) => {
    try {
        await User.deleteUser(req.params.id);
        res.redirect('/admin/user');
    } catch (err) {
        res.status(500).send("Lỗi khi xóa user");
    }
});

module.exports = router;