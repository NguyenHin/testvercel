class AuthValidator {
    static validateRegistration(data) {
        const errors = [];
        if (!data.username || data.username.trim().length < 4) {
            errors.push('Tên đăng nhập phải dài ít nhất 4 ký tự');
        } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
            errors.push('Username chỉ cho phép chữ cái, số hoặc dấu _');
        }

        if (!data.email) {
            errors.push('Email không được để trống');
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                errors.push('Email không đúng định dạng hợp lệ');
            }
        }

        if (!data.password || data.password.length < 6) {
            errors.push('Mật khẩu phải chứa từ 6 ký tự trở lên');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static validateLogin(data) {
        const errors = [];
        if (!data.username) errors.push('Vui lòng nhập tên đăng nhập');
        if (!data.password) errors.push('Vui lòng nhập mật khẩu');

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = AuthValidator;
