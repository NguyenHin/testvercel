const User = require('../../models/User');

class ApiUserController {
    static async getAllUsers(req, res) {
        try {
            const users = await User.getAllUsers();
            const safeUsers = users.map(u => { const { password, ...rest } = u; return rest; });
            res.status(200).json({ success: true, data: safeUsers });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = ApiUserController;


