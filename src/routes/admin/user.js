const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../../middleware/auth');
const AdminUserController = require('../../controllers/admin/AdminUserController');


// Base path: /admin/user

// GET: Danh sÃ¡ch user
router.get('/', requireAdmin, AdminUserController.getList);

// GET: Form thÃªm user
router.get('/add', requireAdmin, AdminUserController.getAddForm);

// POST: Xá»­ lÃ½ thÃªm user
router.post('/add', requireAdmin, AdminUserController.processAdd);

// GET: XÃ³a user
router.get('/delete/:id', requireAdmin, AdminUserController.delete);

module.exports = router;


