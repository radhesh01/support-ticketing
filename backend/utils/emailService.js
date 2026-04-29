const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Login OTP",
    html: `<p>Your OTP is <strong>${otp}</strong>. Valid for 5 minutes.</p>`,
  });
};

exports.sendTicketConfirmationEmail = async (email, title) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Support Ticket Created",
    html: `<p>Your ticket <strong>"${title}"</strong> has been created successfully.</p>`,
  });
};