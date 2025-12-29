import nodemailer from "nodemailer";

export const sendMail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false, // important for Brevo/SMTP
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  return await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html
  });
};
