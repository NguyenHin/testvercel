const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const { requireAdmin } = require('../../middleware/auth');

// Base path: /admin/inventory

const AdminInventoryController = require('../../controllers/admin/AdminInventoryController');

router.get('/', requireAdmin, AdminInventoryController.getList);
router.post('/import', requireAdmin, AdminInventoryController.processImport);

// Route xem lịch sử nhập hàng (API trả về JSON cho Modal)
router.get('/logs/:id', requireAdmin, AdminInventoryController.getLogs);

module.exports = router;


