const nodemailer = require('nodemailer');

// Cấu hình transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your_email@gmail.com', // Thay bằng email của bạn
        pass: 'your_app_password'     // Thay bằng Mật khẩu ứng dụng
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
                <p>Tài khoản của bạn đã được tạo thành công.</p>
            </div>
        `
    };
    try { await transporter.sendMail(mailOptions); } catch (error) { console.error('Error sending email:', error); }
};

// Hàm MỚI: Gửi email reset password
const sendResetPasswordEmail = async (toEmail, token) => {
    const resetLink = `http://localhost:3002/reset-password/${token}`;

    const mailOptions = {
        from: '"BookTotal Support" <no-reply@booktotal.com>',
        to: toEmail,
        subject: 'Yêu cầu đặt lại mật khẩu',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #C92127; text-align: center;">Đặt lại mật khẩu</h2>
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với email này.</p>
                <p>Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu (Link có hiệu lực trong 1 giờ):</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #C92127; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">ĐẶT LẠI MẬT KHẨU</a>
                </div>
                <p style="color: #777; font-size: 12px;">Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
            </div>
        `
    };
    try { await transporter.sendMail(mailOptions); } catch (error) { console.error('Error sending email:', error); }
};

module.exports = { sendWelcomeEmail, sendResetPasswordEmail };