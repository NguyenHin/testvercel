const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/keys');
const ApiResponse = require('../utils/ApiResponse');

module.exports = {
    // Middleware xÃ¡c thá»±c JWT Header dÃ nh riÃªng cho API
    verifyApiToken: (req, res, next) => {
        const authHeader = req.headers['authorization'];

        // Kiá»ƒm tra xem header Authorization cÃ³ tá»“n táº¡i vÃ  Ä‘Ãºng Ä‘á»‹nh dáº¡ng Bearer khÃ´ng
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return ApiResponse.error(res, 'KhÃ´ng tÃ¬m tháº¥y token xÃ¡c thá»±c hoáº·c sai Ä‘á»‹nh dáº¡ng Bearer', 401);
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return ApiResponse.error(res, 'Token khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng', 401);
        }

        jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return ApiResponse.error(res, 'Token Ä‘Ã£ háº¿t háº¡n. Vui lÃ²ng Ä‘Äƒng nháº­p láº¡i.', 401);
                }
                return ApiResponse.error(res, 'Token khÃ´ng há»£p lá»‡. XÃ¡c thá»±c tháº¥t báº¡i.', 403);
            } else {
                // ÄÃ³ng gÃ³i thÃ´ng tin user vÃ o req Ä‘á»ƒ cÃ¡c API sau cÃ³ thá»ƒ sá»­ dá»¥ng
                req.apiUser = decodedToken;
                next();
            }
        });
    }
};

