const nodemailer = require('nodemailer');

// Cấu hình transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your_email@gmail.com', // Thay bằng email của bạn
        pass: 'your_app_password'     // Thay bằng Mật khẩu ứng dụng (App Password)
    }
});

const sendWelcomeEmail = async (toEmail, username) => {
    const mailOptions = {
        from: '"BookTotal Support" <no-reply@booktotal.com>',
        to: toEmail,
        subject: 'Chào mừng bạn đến với BookTotal!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #C92127; text-align: center;">Chào mừng ${username}!</h2>
                <p>Cảm ơn bạn đã đăng ký tài khoản tại <b>BookTotal</b>.</p>
                <p>Tài khoản của bạn đã được tạo thành công. Bây giờ bạn có thể đăng nhập và trải nghiệm mua sắm hàng ngàn đầu sách hấp dẫn.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:3001/auth/login" style="background-color: #C92127; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Đăng nhập ngay</a>
                </div>
                <p style="color: #777; font-size: 12px;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="text-align: center; color: #999; font-size: 12px;">&copy; 2024 BookTotal Corporation</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${toEmail}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = { sendWelcomeEmail };