import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Create a transporter object with SMTP config
  const transporter = nodemailer.createTransport({
    host: process.env.AWS_HOST, // postbox.cloud.yandex.net
    auth: {
      user: process.env.AWS_ACCESS_KEY_ID, // your access key
      pass: process.env.AWS_SECRET_ACCESS_KEY, // app password (not your account password)
    },
    secure: true,
    port: 465,
  });

  // Send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Your Name" <noreply@yourdomain.com>',
    to: "receiver@domain.com",
    subject: "Test Email from Node.js Nodemailer",
    text: "Hello, this is a plain text message",
    html: "<b>Hello, this is an HTML message!</b>",
  });

  console.log("Message sent: %s", info.messageId);
}

main().catch(console.error);
