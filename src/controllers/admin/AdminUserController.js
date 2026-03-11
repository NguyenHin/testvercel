const User = require('../../models/User');

class AdminUserController {
    static async getList(req, res) {
        try {
            const users = await User.getAllUsers();
            res.render('admin/user/user_list', {
                users: users,
                error: req.query.error,
                success: req.query.success
            });
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
            res.redirect('/admin/user?success=' + encodeURIComponent('Thêm người dùng thành công!'));
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

    static async getEditForm(req, res) {
        try {
            const user = await User.getUserById(req.params.id);
            if (!user) {
                return res.status(404).send("Người dùng không tồn tại");
            }
            res.render('admin/user/edit', {
                userRow: user,
                errors: req.flash('errors'),
                formData: req.flash('formData')[0] || user
            });
        } catch (err) {
            res.status(500).send("Lỗi lấy thông tin user: " + err.message);
        }
    }

    static async processEdit(req, res) {
        try {
            const id = req.params.id;
            const { email, full_name, password, role } = req.body;
            let errors = {};

            if (Object.keys(errors).length > 0) {
                req.flash('errors', errors);
                req.flash('formData', req.body);
                return res.redirect(`/admin/user/edit/${id}`);
            }

            await User.updateUser(id, req.body);
            res.redirect('/admin/user?success=' + encodeURIComponent('Cập nhật người dùng thành công!'));
        } catch (err) {
            console.error(err);
            if (err.code === 'ER_DUP_ENTRY') {
                let errors = {};
                if (err.message.includes('email')) errors.email = "Email đã được sử dụng!";

                req.flash('errors', errors);
                req.flash('formData', req.body);
                return res.redirect(`/admin/user/edit/${req.params.id}`);
            }
            res.status(500).send("Lỗi khi cập nhật user: " + err.message);
        }
    }

    static async delete(req, res) {
        try {
            const id = req.params.id;

            // Không cho phép admin tự xóa chính mình (tùy chọn)
            if (res.locals.user && res.locals.user.id == id) {
                return res.redirect('/admin/user?error=' + encodeURIComponent('Bạn không thể tự xóa tài khoản của chính mình!'));
            }

            await User.deleteUser(id);
            res.redirect('/admin/user?success=' + encodeURIComponent('Xóa người dùng thành công!'));
        } catch (err) {
            console.error('LỖI XÓA USER:', err);
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.redirect('/admin/user?error=' + encodeURIComponent('Không thể xóa người dùng này vì họ đã có đơn hàng hoặc dữ liệu liên quan khác!'));
            }
            res.redirect('/admin/user?error=' + encodeURIComponent('Đã xảy ra lỗi khi xóa người dùng!'));
        }
    }
}

module.exports = AdminUserController;