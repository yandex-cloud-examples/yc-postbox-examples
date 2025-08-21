import nodemailer from "nodemailer";
import {SendEmailCommand, SESv2Client} from "@aws-sdk/client-sesv2";

export async function ses() {
    // 1. Configure the AWS SDK client (uses default credential chain if omitted)
    const sesClient = new SESv2Client({
        region: 'ru-central1',
        endpoint: 'https://postbox.cloud.yandex.net',
        // By default, the SDK uses the default credentials provider chain.
        // You can use static credentials by uncommenting and modifying the following lines:
        // credentials: {
        //     accessKeyId: 'accessKeyID',
        //     secretAccessKey: 'secretAccessKey',
        // },
    });

    // 2. Create a Nodemailer transport that points at SES
    const transporter = nodemailer.createTransport({
        SES: {sesClient, SendEmailCommand},
    });

    // 3. Send the message
    const info = await transporter.sendMail({
        from: '"Your Name" <noreply@yourdomain.com>',
        to: "receiver@domain.com",
        subject: "Test Email from Node.js Nodemailer",
        text: "Hello, this is a plain text message",
        html: "<b>Hello, this is an HTML message!</b>",
        // Any SendEmailCommand input can be set under the `ses` key:
        ses: {
            // ConfigurationSetName is optional, if you have a configuration set
            // defined in your AWS SES account, you can specify it here.
            // ConfigurationSetName: "my‑config‑set",
            EmailTags: [{Name: "tag_name", Value: "tag_value"}],
        },
    });
}
