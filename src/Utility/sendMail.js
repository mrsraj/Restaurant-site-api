const nodemailer = require("nodemailer");
require("dotenv").config();

const sendMail = async (to, subject, htmlContent) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Restaurant App" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent,
        });

        console.log("Email sent successfully");
    } catch (error) {
        console.error("Email error:", error);
    }
};

module.exports = sendMail;
