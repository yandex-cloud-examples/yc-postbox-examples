# Yandex Cloud Postbox Nodemailer Email Sender (JavaScript)

This project demonstrates how to send emails through Yandex Cloud Postbox using Nodemailer with both SMTP and AWS SES compatibility modes, with infrastructure managed via Terraform.

## Overview

Yandex Cloud Postbox provides email sending capabilities with AWS SES compatibility. This project includes:

1. JavaScript code for sending emails using Nodemailer with two different transports:
   - **SMTP transport** - Direct SMTP connection to Yandex Cloud Postbox
   - **SES transport** - AWS SDK for JavaScript v3 (@aws-sdk/client-sesv2) through Nodemailer
2. Terraform configuration for setting up the required infrastructure
3. Scripts for generating DKIM keys for email authentication

## Prerequisites

- [Node.js](https://nodejs.org/) 14.x or later (required for stable ESM modules support)
- [npm](https://www.npmjs.com/) (Node.js package manager)
- [Terraform](https://www.terraform.io/downloads.html) 1.0.0 or later
- [Yandex Cloud CLI](https://cloud.yandex.com/docs/cli/quickstart)
- A Yandex Cloud account with a configured folder
- A DNS zone managed by Yandex Cloud

## Setup

### 1. Configure Yandex Cloud CLI

```bash
yc init
```

### 2. Set environment variables for Terraform

```bash
export YC_TOKEN=$(yc iam create-token)
export YC_CLOUD_ID=$(yc config get cloud-id)
export YC_FOLDER_ID=$(yc config get folder-id)
```

### 3. Generate DKIM keys

```bash
cd ../../terraform
chmod +x key-gen.sh
./key-gen.sh
```

### 4. Deploy infrastructure with Terraform

```bash
cd ../../terraform
terraform init
terraform apply -var="folder_id=$YC_FOLDER_ID" -var="dns_zone_name=your-zone" -var="domain=your-domain.com" -var="private_key=$(cat privatekey.pem)" -var="public_key=$(cat dkim_dns_value.txt)" -var="domain_signing_selector=postbox"
```

### 5. Set up Node.js environment

Install dependencies:

```bash
cd ../javascript/nodemailer
npm install
```

### 6. Configure the application

#### For SMTP transport (smtp.js):

Set environment variables for API credentials:

```bash
export API_KEY_ID="your-api-key-id"
export API_KEY_SECRET="your-api-key-secret"
```

Update the email addresses in `smtp.js`:

```javascript
const info = await transporter.sendMail({
    from: '"Your Name" <noreply@your-verified-domain.com>',
    to: "recipient@example.com",
    // ... other settings
});
```

#### For SES transport (sdk.js):

To use static credentials, uncomment and update the following section in `sdk.js`:

```javascript
credentials: {
    accessKeyId: 'YOUR_ACCESS_KEY_ID',  // From Terraform output
    secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',  // From Terraform output
},
```

Update the email addresses in `sdk.js`:

```javascript
const info = await transporter.sendMail({
    from: '"Your Name" <noreply@your-verified-domain.com>',
    to: "recipient@example.com",
    // ... other settings
});
```

### 7. Run the application

You can run different examples using the main.js file:

#### Run SMTP example:
```bash
npm run smtp
# or
node main.js smtp
```

#### Run SDK example:
```bash
npm run sdk
# or
node main.js sdk
```

#### Show usage help:
```bash
node main.js
```

## Project Structure

- `main.js` - Entry point that parses command-line arguments and runs the appropriate example
- `smtp.js` - SMTP transport example using direct SMTP connection
- `sdk.js` - SES transport example using AWS SDK through Nodemailer
- `package.json` - Node.js dependencies and scripts
- `README.md` - This documentation file

## Transport Methods

### SMTP Transport
- Uses direct SMTP connection to `postbox.cloud.yandex.net:587`
- Requires API key ID and secret for authentication
- Simpler setup, good for basic email sending

### SES Transport
- Uses AWS SDK for JavaScript v3 through Nodemailer
- Compatible with AWS SES API
- Supports advanced features like email tags and configuration sets
- Can use default credential chain or static credentials

## Environment Variables

For SMTP transport:
- `API_KEY_ID` - Your Yandex Cloud API key ID
- `API_KEY_SECRET` - Your Yandex Cloud API key secret

## Troubleshooting

- Make sure DKIM DNS records have propagated before sending emails
- Check Yandex Cloud logs for any service account permission issues
- Verify the endpoint URL is correctly configured in the SDK example
- For SMTP: Ensure API_KEY_ID and API_KEY_SECRET environment variables are set
- For SES: Check that credentials are properly configured (either via environment or static)
- If you encounter AWS SDK errors, check that you have the correct version installed
- Verify that sender email addresses are from verified domains in your Postbox configuration

## Dependencies

- `nodemailer` ^7.0.5 - Email sending library
- `@aws-sdk/client-sesv2` ^3.872.0 - AWS SDK for SES v2
- `@types/nodemailer` ^7.0.1 - TypeScript definitions (dev dependency)
