import nodemailer from "nodemailer";

async function main() {
    // Create a transporter object with SMTP config
    const transporter = nodemailer.createTransport({
        host: 'postbox.cloud.yandex.net',
        auth: {
            // https://yandex.cloud/ru/docs/postbox/operations/send-email#smtp
            user: process.env.API_KEY_ID, // your API key ID
            pass: process.env.API_KEY_SECRET, // your API key secret
        },
        port: 587,
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
