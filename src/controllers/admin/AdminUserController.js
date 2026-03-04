const User = require('../../models/User');

class AdminUserController {
    static async getList(req, res) {
        try {
            const users = await User.getAllUsers();
            res.render('admin/user/user_list', { users: users });
        } catch (err) {
            res.status(500).send("Lỗi lấy danh sách user");
        }
    }

    static getAddForm(req, res) {
        res.render('admin/user/add', {
            errors: req.flash('errors'),
            formData: req.flash('formData')[0] || {}
        });
    }

    static async processAdd(req, res) {
        try {
            const { username, email, full_name, password, role } = req.body;
            let errors = {};

            const existingUser = await User.getUserByUsername(username);
            if (existingUser) {
                errors.username = "Tên đăng nhập đã tồn tại!";
            }

            if (Object.keys(errors).length > 0) {
                req.flash('errors', errors);
                req.flash('formData', req.body);
                return res.redirect('/admin/user/add');
            }

            await User.addUser(req.body);
            res.redirect('/admin/user');
        } catch (err) {
            console.error(err);
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
    }

    static async delete(req, res) {
        try {
            await User.deleteUser(req.params.id);
            res.redirect('/admin/user');
        } catch (err) {
            res.status(500).send("Lỗi khi xóa user");
        }
    }
}

module.exports = AdminUserController;


