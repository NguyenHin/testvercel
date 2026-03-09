const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendResetPasswordEmail = async (toEmail, token) => {
    // Lấy BASE_URL từ .env, nếu không có thì mặc định là localhost:3000
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password/${token}`;

    const mailOptions = {
        from: `"BookTotal Support" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Yêu cầu đặt lại mật khẩu',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #C92127; text-align: center;">Đặt lại mật khẩu</h2>
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                <p>Vui lòng nhấn vào nút bên dưới để tiến hành thay đổi mật khẩu:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #C92127; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">ĐẶT LẠI MẬT KHẨU</a>
                </div>
                <p style="color: #777; font-size: 12px;">Link này có hiệu lực trong 1 giờ. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
            </div>
        `
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email reset đã được gửi qua link: ${resetLink}`);
    } catch (error) {
        console.error('Error sending reset email:', error);
    }
};

module.exports = { sendResetPasswordEmail };
