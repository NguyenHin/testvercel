const express = require('express');
const router = express.Router();

const ApiProductController = require('../controllers/api/ApiProductController');
const ApiUserController = require('../controllers/api/ApiUserController');
const ApiCouponController = require('../controllers/api/ApiCouponController');
const ApiOrderController = require('../controllers/api/ApiOrderController');
const ApiAuthController = require('../controllers/api/ApiAuthController');
const CartController = require('../controllers/CartController');
const { verifyApiToken } = require('../middleware/verifyJwt');

// --- API AUTHENTICATION (CHO MOBILE/JAVA CLIENT) ---
router.post('/auth/register', ApiAuthController.register);
router.post('/auth/login', ApiAuthController.login);

// --- API SẢN PHẨM ---
router.get('/products', ApiProductController.getAllProducts);
router.get('/products/:id', ApiProductController.getProductById);

// --- API NGƯỜI DÙNG ---
router.get('/users', ApiUserController.getAllUsers);

// --- API MÃ GIẢM GIÁ ---
router.get('/coupons', ApiCouponController.getAllCoupons);
router.post('/coupon/check', ApiCouponController.checkCoupon);

// --- API ĐƠN HÀNG ---
router.get('/orders/:id', ApiOrderController.getOrderDetails);

// --- API GIỎ HÀNG ---
router.get('/cart-data', CartController.getCartData);

// --- API ĐỊA CHÍNH ---
router.get('/location/provinces', ApiOrderController.getProvinces);
router.get('/location/districts/:provinceCode', ApiOrderController.getDistricts);
router.get('/location/wards/:districtCode', ApiOrderController.getWards);

module.exports = router;
