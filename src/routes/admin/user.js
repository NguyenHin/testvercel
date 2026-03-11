const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../../middleware/auth');
const AdminUserController = require('../../controllers/admin/AdminUserController');


// Base path: /admin/user

// GET: Danh sách user
router.get('/', requireAdmin, AdminUserController.getList);

// GET: Form thêm user
router.get('/add', requireAdmin, AdminUserController.getAddForm);

// POST: Xử lý thêm user
router.post('/add', requireAdmin, AdminUserController.processAdd);

// GET: Form sửa user
router.get('/edit/:id', requireAdmin, AdminUserController.getEditForm);

// POST: Xử lý sửa user
router.post('/edit/:id', requireAdmin, AdminUserController.processEdit);

// GET: Xóa user
router.get('/delete/:id', requireAdmin, AdminUserController.delete);

module.exports = router;


