const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/keys');
const ApiResponse = require('../utils/ApiResponse');

module.exports = {
    // Middleware xác thực JWT Header dành riêng cho API
    verifyApiToken: (req, res, next) => {
        const authHeader = req.headers['authorization'];

        // Kiểm tra xem header Authorization có tồn tại và đúng định dạng Bearer không
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return ApiResponse.error(res, 'Không tìm thấy token xác thực hoặc sai định dạng Bearer', 401);
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return ApiResponse.error(res, 'Token không được để trống', 401);
        }

        jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return ApiResponse.error(res, 'Token đã hết hạn. Vui lòng đăng nhập lại.', 401);
                }
                return ApiResponse.error(res, 'Token không hợp lệ. Xác thực thất bại.', 403);
            } else {
                // Đóng gói thông tin user vào req để các API sau có thể sử dụng
                req.apiUser = decodedToken;
                next();
            }
        });
    }
};

