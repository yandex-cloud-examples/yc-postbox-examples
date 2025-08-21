// AWS SDK for JavaScript v3 (ESM)
import {SendEmailCommand, SESv2Client} from '@aws-sdk/client-sesv2';

// Constants (same as in the Go and Python versions)
// Sender address must be verified with Amazon SES.
const SENDER = "noreply@yourdomain.com";

// Recipient address.
const RECIPIENT = "receiver@domain.com";

// Subject line for the email.
const SUBJECT = "Yandex Cloud Postbox Test via AWS SDK for JavaScript v3";

// HTML body for the email.
const HTML_BODY = `<h1>Amazon SES Test Email (AWS SDK for JavaScript v3)</h1>
<p>This email was sent with <a href='https://yandex.cloud/ru/docs/postbox/quickstart'>Yandex Cloud Postbox</a> using the 
<a href='https://aws.amazon.com/sdk-for-javascript/'>AWS SDK for JavaScript v3</a>.</p>`;

// Text body for recipients with non-HTML email clients.
const TEXT_BODY = "This email was sent with Yandex Cloud Postbox using the AWS SDK for JavaScript v3.";

// Character encoding for the email.
const CHARSET = "UTF-8";

// Main function
async function main() {
    // Create the SES client with custom endpoint for Yandex Cloud Postbox
    const client = new SESv2Client({
        region: 'ru-central1',
        endpoint: 'https://postbox.cloud.yandex.net',
        // By default, the SDK uses the default credentials provider chain.
        // You can use static credentials by uncommenting and modifying the following lines:
        // credentials: {
        //     accessKeyId: 'accessKeyID',
        //     secretAccessKey: 'secretAccessKey',
        // },
    });

    // Assemble the email
    const params = {
        Destination: {
            ToAddresses: [RECIPIENT],
        },
        Content: {
            Simple: {
                Subject: {
                    Charset: CHARSET,
                    Data: SUBJECT,
                },
                Body: {
                    Html: {
                        Charset: CHARSET,
                        Data: HTML_BODY,
                    },
                    Text: {
                        Charset: CHARSET,
                        Data: TEXT_BODY,
                    },
                },
            },
        },
        FromEmailAddress: SENDER,
    };

    try {
        // Create the command
        const command = new SendEmailCommand(params);

        // Attempt to send the email
        const data = await client.send(command);
        console.log(data.MessageId);
    } catch (err) {
        console.error("Error sending email:", err);
        throw err;
    }
}

// Run the main function
main().catch(err => {
    console.error("Unhandled error:", err);
    process.exit(1);
});
