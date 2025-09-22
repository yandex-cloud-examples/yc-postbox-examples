# Yandex Cloud Postbox API Client for Node.js

> **⚠️ Disclaimer:** This code is for demonstration purposes only and should **not
** be used in production environments. For production use, please use the official AWS SDK for secure, robust, and fully supported implementations.

A plain JavaScript client for sending emails through the Yandex Cloud Postbox API. This implementation uses only
standard JavaScript APIs (fetch, Web Crypto API) and requires no third-party dependencies.

## Features

- ✅ **Pure JavaScript** - No external dependencies, uses only standard Node.js APIs
- ✅ **AWS Signature V4** - Proper authentication implementation
- ✅ **Multiple Email Types** - Simple, Template, and Raw email support
- ✅ **Modern Async/Await** - Clean promise-based API
- ✅ **Node.js 18+** - Uses native Web Crypto API and fetch
- ✅ **Error Handling** - Comprehensive error handling with detailed messages
- ✅ **Input Validation** - Email address and required field validation
- ✅ **Retry Logic** - Exponential backoff with jitter for transient failures
- ✅ **Rate Limiting** - Client-side rate limiting protection
- ✅ **Request Timeout** - Configurable timeout with AbortController
- ✅ **Debug Logging** - Optional debug mode for troubleshooting
- ✅ **TypeScript Support** - Complete TypeScript definitions included

## Quick Start

### 1. Installation and Setup

```javascript
const PostboxClient = require('./main.js');

const client = new PostboxClient({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ru-central1', // Default: ru-central1
    host: 'postbox.cloud.yandex.net', // Default host
    timeout: 30000, // Request timeout in ms (default: 30000)
    maxRetries: 3, // Max retry attempts (default: 3)
    maxJitter: 1000, // Max retry jitter in ms (default: 1000)
    minRequestInterval: 100, // Min interval between requests in ms (default: 100)
    debug: false // Enable debug logging (default: false)
});
```

### 2. Send Simple Email

```javascript
try {
    const result = await client.sendSimpleEmail({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Hello World',
        textContent: 'This is a plain text email',
        htmlContent: '<h1>Hello World</h1><p>This is an HTML email</p>'
    });

    console.log('Email sent! Message ID:', result.MessageId);
} catch (error) {
    console.error('Failed to send email:', error.message);
}
```

### 3. Send Template Email

```javascript
const result = await client.sendTemplateEmail({
    from: 'sender@example.com',
    to: ['recipient@example.com'],
    templateContent: {
        Subject: 'Welcome {{name}}!',
        Text: 'Hello {{name}}, welcome to {{company}}!',
        Html: '<h1>Hello {{name}}</h1><p>Welcome to {{company}}!</p>'
    },
    templateData: {
        name: 'John Doe',
        company: 'Acme Corp'
    }
});
```

### 4. Send Raw Email

```javascript
const result = await client.sendRawEmail({
    from: 'sender@example.com',
    to: ['recipient@example.com'],
    rawData: 'base64_encoded_mime_message'
});
```

## API Reference

### Constructor Options

| Option               | Type    | Default                    | Description                             |
|----------------------|---------|----------------------------|-----------------------------------------|
| `accessKeyId`        | string  | required                   | Yandex Cloud access key ID              |
| `secretAccessKey`    | string  | required                   | Yandex Cloud secret access key          |
| `region`             | string  | `ru-central1`              | Yandex Cloud region                     |
| `host`               | string  | `postbox.cloud.yandex.net` | API endpoint host                       |
| `timeout`            | number  | `30000`                    | Request timeout in milliseconds         |
| `maxRetries`         | number  | `3`                        | Maximum retry attempts for failed requests |
| `maxJitter`          | number  | `1000`                     | Maximum jitter for retry backoff (ms)  |
| `minRequestInterval` | number  | `100`                      | Minimum interval between requests (ms)  |
| `debug`              | boolean | `false`                    | Enable debug logging                    |

### Simple Email Options

| Option                 | Type          | Required | Description                             |
|------------------------|---------------|----------|-----------------------------------------|
| `from`                 | string        | ✅        | Sender email address (must be verified) |
| `to`                   | string\|array | ✅        | Recipient email address(es)             |
| `subject`              | string        | ✅        | Email subject                           |
| `textContent`          | string        | ❌        | Plain text content                      |
| `htmlContent`          | string        | ❌        | HTML content                            |
| `cc`                   | array         | ❌        | CC recipients                           |
| `bcc`                  | array         | ❌        | BCC recipients                          |
| `configurationSetName` | string        | ❌        | Configuration set name                  |
| `customHeaders`        | array         | ❌        | Custom email headers                    |

### Template Email Options

| Option                 | Type          | Required | Description                               |
|------------------------|---------------|----------|-------------------------------------------|
| `from`                 | string        | ✅        | Sender email address                      |
| `to`                   | string\|array | ✅        | Recipient email address(es)               |
| `templateContent`      | object        | ✅        | Template content with Subject, Text, Html |
| `templateData`         | object        | ✅        | Data for template substitution            |
| `cc`                   | array         | ❌        | CC recipients                             |
| `bcc`                  | array         | ❌        | BCC recipients                            |
| `configurationSetName` | string        | ❌        | Configuration set name                    |
| `customHeaders`        | array         | ❌        | Custom email headers                      |

### Raw Email Options

| Option                 | Type          | Required | Description                   |
|------------------------|---------------|----------|-------------------------------|
| `from`                 | string        | ✅        | Sender email address          |
| `to`                   | string\|array | ✅        | Recipient email address(es)   |
| `rawData`              | string        | ✅        | Base64 encoded raw email data |
| `cc`                   | array         | ❌        | CC recipients                 |
| `bcc`                  | array         | ❌        | BCC recipients                |
| `configurationSetName` | string        | ❌        | Configuration set name        |

## Environment Variables

Set up your environment variables for secure credential management:

```bash
export AWS_ACCESS_KEY_ID="your_access_key_id"
export AWS_SECRET_ACCESS_KEY="your_secret_access_key"
```

Or create a `.env` file:

```bash
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
```

## Error Handling

The client throws descriptive errors for different scenarios:

```javascript
try {
    await client.sendSimpleEmail(options);
} catch (error) {
    if (error.message.includes('API Error')) {
        // API returned an error response (includes Request ID for debugging)
        console.error('API Error:', error.message);
        // Example: "API Error 403: Forbidden: Access denied (Request ID: abc123-def456)"
    } else if (error.message.includes('Network error')) {
        // Network/connectivity issue
        console.error('Network Error:', error.message);
    } else {
        // Other errors (validation, etc.)
        console.error('Error:', error.message);
    }
}
```

## Common API Errors

| Error Code                                   | Description                   |
|----------------------------------------------|-------------------------------|
| `BadRequestException`                        | Invalid request parameters    |
| `BadRequestException: sender is not allowed` | Sender not in allowed list    |
| `AccountSuspendedException`                  | Account suspended permanently |
| `SendingPausedException`                     | Account suspended temporarily |
| `MessageRejected`                            | Invalid email data            |
| `MailFromDomainNotVerifiedException`         | Sender address not verified   |
| `NotFoundException`                          | Resource not found            |
| `TooManyRequestsException`                   | Rate limit exceeded           |
| `LimitExceededException`                     | Quota exceeded                |

### HTTP Status Code Errors

| Status | Description           | Common Causes                                                  |
|--------|-----------------------|----------------------------------------------------------------|
| `400`  | Bad Request           | Invalid JSON, missing required fields                          |
| `401`  | Unauthorized          | Invalid access key or secret                                   |
| `403`  | Forbidden             | Credentials valid but lacking permissions, sender not verified |
| `404`  | Not Found             | Wrong API endpoint URL                                         |
| `429`  | Too Many Requests     | Rate limiting, slow down requests                              |
| `500`  | Internal Server Error | Temporary server issues                                        |

## Troubleshooting

### 403 Forbidden Error

This is the most common error when starting with Postbox API:

```text
API Error 403: Forbidden: Access denied - check your credentials and permissions (Request ID: abc123-def456-789xyz)
```

**Possible causes:**

1. **Sender email not verified** - Verify your sender domain/email in Yandex Cloud Console
2. **Wrong service account** - Ensure your access keys belong to the correct service account
3. **Missing IAM permissions** - Service account needs `postbox.editor` role or higher
4. **Invalid signature** - Check if your system clock is synchronized

💡 **Note:** All error messages include a Request ID for debugging purposes. Include this ID when contacting support.

## Requirements

- **Node.js**: Node.js 18.0+ (for native Web Crypto API and fetch support)
- **No additional dependencies** - Uses only built-in Node.js APIs

## Security Notes

⚠️ **Important Security Considerations:**

1. **Use environment variables** for storing access keys in production
2. **Never hardcode credentials** in your source code
3. **Implement proper access controls** in your application
4. **Verify sender addresses** in your Yandex Cloud Postbox configuration
5. **Use secure network connections** - API uses HTTPS by default

## Running the Example

1. Set your environment variables:

```bash
export AWS_ACCESS_KEY_ID="your_access_key_id"
export AWS_SECRET_ACCESS_KEY="your_secret_access_key"
```

1. Run the example:

```bash
node example.js
```

The example includes:

- ✅ Simple email sending
- ✅ Template email with variable substitution
- ✅ Email with CC and BCC recipients
- ✅ Error handling and validation

## Custom Usage

For your own projects, create a new file with your specific email logic:

```javascript
const PostboxClient = require('./main.js');

async function sendWelcomeEmail(userEmail, userName) {
    const client = new PostboxClient({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });

    try {
        const result = await client.sendSimpleEmail({
            from: 'noreply@yourcompany.com', // Your verified sender
            to: [userEmail],
            subject: `Welcome ${userName}!`,
            textContent: `Hello ${userName}, welcome to our platform!`,
            htmlContent: `<h1>Welcome ${userName}!</h1><p>Thanks for joining us.</p>`
        });

        console.log('✅ Welcome email sent!');
        return result.MessageId;
    } catch (error) {
        console.error('❌ Failed to send welcome email:', error.message);
        throw error;
    }
}

// Usage
sendWelcomeEmail('user@example.com', 'John Doe');
```

📋 **See `example.js` for comprehensive examples including template emails, CC/BCC, and error handling.**

## License

This implementation is provided as-is for educational and development purposes.
