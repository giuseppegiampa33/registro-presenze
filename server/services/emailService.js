const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // For development, use Ethereal Email (fake SMTP)
    // In production, you would configure real SMTP credentials in .env

    // Create a test account if no credentials are provided
    let testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER || testAccount.user,
            pass: process.env.SMTP_PASS || testAccount.pass,
        },
    });

    const message = {
        from: '"Intern Tracker" <noreply@interntracker.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};

module.exports = sendEmail;
