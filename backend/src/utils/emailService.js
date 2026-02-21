const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

const sendPasswordResetEmail = async (email, resetToken, fullname) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    const transporter = createTransporter();

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'Vigat Bahee <noreply@vigatbahee.com>',
        to: email,
        subject: 'Vigat Bahee - Password Reset Request',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #3B82F6;">विगत बही - पासवर्ड रीसेट</h2>
        <p>नमस्ते ${fullname},</p>
        <p>We received a request to reset your Vigat Bahee account password.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; 
                  border-radius: 6px; text-decoration: none; font-weight: bold; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #666;">This link will expire in <strong>1 hour</strong>.</p>
        <p style="color: #666;">If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">Vigat Bahee - Digital Gift Registry System</p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail };
