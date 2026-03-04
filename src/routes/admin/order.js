const express = require('express');
const router = express.Router();
const AdminOrderController = require('../../controllers/admin/AdminOrderController');
const { requireAdmin } = require('../../middleware/auth');

// Base path: /admin/orders

router.get('/', requireAdmin, AdminOrderController.getList);
router.get('/export', requireAdmin, AdminOrderController.exportExcel);
router.post('/bulk-action', requireAdmin, AdminOrderController.bulkAction);
router.get('/update/:id/:status', requireAdmin, AdminOrderController.updateStatus);
router.get('/delete/:id', requireAdmin, AdminOrderController.delete);

module.exports = router;


