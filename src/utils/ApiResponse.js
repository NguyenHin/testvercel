class ApiResponse {
    static success(res, data = null, message = 'Thành công', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            status: statusCode,
            message: message,
            data: data
        });
    }

    static error(res, message = 'Đã xảy ra lỗi', statusCode = 500, errors = null) {
        return res.status(statusCode).json({
            success: false,
            status: statusCode,
            message: message,
            errors: errors
        });
    }
}

module.exports = ApiResponse;
