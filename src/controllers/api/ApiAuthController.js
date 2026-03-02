const AuthValidator = require('../../validators/AuthValidator');
const AuthService = require('../../services/AuthService');
const ApiResponse = require('../../utils/ApiResponse');

// ThÃªm cÃ¡c API Ä‘Äƒng nháº­p/Ä‘Äƒng kÃ½ riÃªng cho Java Client
// BÃ¬nh thÆ°á»ng cÃ¡c tÃ­nh nÄƒng nÃ y á»Ÿ Web Form (Controller) tráº£ vá» HTML (redirect)
// á»ž Ä‘Ã¢y tráº£ vá» chuáº©n JSON cho App
class ApiAuthController {
    static async register(req, res) {
        try {
            const validation = AuthValidator.validateRegistration(req.body);
            if (!validation.isValid) {
                return ApiResponse.error(res, 'Dá»¯ liá»‡u khÃ´ng há»£p lá»‡', 400, validation.errors);
            }

            const result = await AuthService.registerUser(req.body);
            return ApiResponse.success(res, result, 'ÄÄƒng kÃ½ thÃ nh cÃ´ng', 201);
        } catch (error) {
            return ApiResponse.error(res, error.message, 400);
        }
    }

    static async login(req, res) {
        try {
            const validation = AuthValidator.validateLogin(req.body);
            if (!validation.isValid) {
                return ApiResponse.error(res, 'Dá»¯ liá»‡u Ä‘Äƒng nháº­p khÃ´ng há»£p lá»‡', 400, validation.errors);
            }

            const result = await AuthService.authenticateUser(req.body.username, req.body.password);
            return ApiResponse.success(res, result, 'ÄÄƒng nháº­p thÃ nh cÃ´ng', 200);
        } catch (error) {
            return ApiResponse.error(res, error.message, 401);
        }
    }
}

module.exports = ApiAuthController;


