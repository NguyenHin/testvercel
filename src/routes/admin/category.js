const express = require('express');
const router = express.Router();
const AdminCategoryController = require('../../controllers/admin/AdminCategoryController');
const { requireAdmin } = require('../../middleware/auth');

// Tất cả các route ở đây đã được middleware requireAdmin bảo vệ ở admin.js

router.get('/', requireAdmin, AdminCategoryController.getList);

router.get('/add', requireAdmin, AdminCategoryController.getAddForm);
router.post('/add', requireAdmin, AdminCategoryController.processAdd);

router.get('/edit/:id', requireAdmin, AdminCategoryController.getEditForm);
router.post('/edit/:id', requireAdmin, AdminCategoryController.processEdit);

router.get('/delete/:id', requireAdmin, AdminCategoryController.delete);

module.exports = router;
