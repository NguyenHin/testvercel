const AuthValidator = require('../../validators/AuthValidator');
const AuthService = require('../../services/AuthService');
const ApiResponse = require('../../utils/ApiResponse');

// Thêm các API đăng nhập/đăng ký riêng cho Java Client
// Bình thường các tính năng này ở Web Form (Controller) trả về HTML (redirect)
// Ở đây trả về chuẩn JSON cho App
class ApiAuthController {
    static async register(req, res) {
        try {
            const validation = AuthValidator.validateRegistration(req.body);
            if (!validation.isValid) {
                return ApiResponse.error(res, 'Dữ liệu không hợp lệ', 400, validation.errors);
            }

            const result = await AuthService.registerUser(req.body);
            return ApiResponse.success(res, result, 'Đăng ký thành công', 201);
        } catch (error) {
            return ApiResponse.error(res, error.message, 400);
        }
    }

    static async login(req, res) {
        try {
            const validation = AuthValidator.validateLogin(req.body);
            if (!validation.isValid) {
                return ApiResponse.error(res, 'Dữ liệu đăng nhập không hợp lệ', 400, validation.errors);
            }

            const result = await AuthService.authenticateUser(req.body.username, req.body.password);
            return ApiResponse.success(res, result, 'Đăng nhập thành công', 200);
        } catch (error) {
            return ApiResponse.error(res, error.message, 401);
        }
    }
}

module.exports = ApiAuthController;


