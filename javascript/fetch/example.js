/**
 * Example usage of Yandex Cloud Postbox API Client
 *
 * Before running:
 * 1. Set environment variables:
 *    export AWS_ACCESS_KEY_ID="your_access_key_id"
 *    export AWS_SECRET_ACCESS_KEY="your_secret_access_key"
 *
 * 2. Run the example:
 *    node example.js
 */


const PostboxClient = require('./main.js');

async function runExample() {
    const client = new PostboxClient({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: 'ru-central1', // Default region
        host: 'postbox.cloud.yandex.net' // Default host
    });

    console.log('🚀 Starting Yandex Cloud Postbox API examples...\n');

    // Check if credentials are provided
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.error('❌ Error: Missing environment variables');
        console.error('Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
        console.error('Example:');
        console.error('  export AWS_ACCESS_KEY_ID="your_access_key_id"');
        console.error('  export AWS_SECRET_ACCESS_KEY="your_secret_access_key"');
        process.exit(1);
    }

    // Example 1: Send a simple email
    console.log('📧 Example 1: Sending simple email...');
    try {
        const result = await client.sendSimpleEmail({
            from: 'sender@example.com', // Replace with your verified sender address
            to: ['recipient@example.com'], // Replace with actual recipient
            subject: 'Test Email from Postbox API',
            textContent: 'This is a test email sent via Yandex Cloud Postbox API using plain JavaScript.',
            htmlContent: '<h1>Test Email</h1><p>This is a test email sent via <strong>Yandex Cloud Postbox API</strong> using plain JavaScript.</p>'
        });

        console.log('✅ Simple email sent successfully!');
        console.log('   Message ID:', result.MessageId);
    } catch (error) {
        console.error('❌ Failed to send simple email:', error.message);
    }

    console.log(''); // Empty line for readability

    // Example 2: Send a template email
    console.log('📧 Example 2: Sending template email...');
    try {
        const templateResult = await client.sendTemplateEmail({
            from: 'sender@example.com', // Replace with your verified sender address
            to: ['recipient@example.com'], // Replace with actual recipient
            templateContent: {
                Subject: 'Welcome {{name}} to {{company}}!',
                Text: 'Hello {{name}}, welcome to {{company}}! We are excited to have you on board. Your account has been created successfully.',
                Html: `
          <h1>Welcome {{name}}!</h1>
          <p>We are thrilled to welcome you to <strong>{{company}}</strong>!</p>
          <ul>
            <li>Your role: {{role}}</li>
            <li>Start date: {{startDate}}</li>
            <li>Department: {{department}}</li>
          </ul>
          <p>We look forward to working with you!</p>
          <p>Best regards,<br>The {{company}} Team</p>
        `
            },
            templateData: {
                name: 'John Doe',
                company: 'Acme Corporation',
                role: 'Software Developer',
                startDate: '2024-01-15',
                department: 'Engineering'
            }
        });

        console.log('✅ Template email sent successfully!');
        console.log('   Message ID:', templateResult.MessageId);
    } catch (error) {
        console.error('❌ Failed to send template email:', error.message);
    }

    console.log(''); // Empty line for readability

    // Example 3: Send email with CC and BCC
    console.log('📧 Example 3: Sending email with CC and BCC...');
    try {
        const ccBccResult = await client.sendSimpleEmail({
            from: 'sender@example.com', // Replace with your verified sender address
            to: ['recipient@example.com'], // Replace with actual recipient
            cc: ['cc-recipient@example.com'], // Replace with actual CC recipient
            bcc: ['bcc-recipient@example.com'], // Replace with actual BCC recipient
            subject: 'Email with CC and BCC',
            textContent: 'This email demonstrates CC and BCC functionality.',
            htmlContent: '<h2>Email with CC and BCC</h2><p>This email demonstrates CC and BCC functionality.</p>'
        });

        console.log('✅ Email with CC/BCC sent successfully!');
        console.log('   Message ID:', ccBccResult.MessageId);
    } catch (error) {
        console.error('❌ Failed to send email with CC/BCC:', error.message);
    }

    console.log('\n🎉 Examples completed!');
    console.log('💡 Remember to replace example email addresses with real, verified addresses.');
}

// Run the example
runExample().catch(error => {
    console.error('💥 Unexpected error:', error.message);
    process.exit(1);
});
