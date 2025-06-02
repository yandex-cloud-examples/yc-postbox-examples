# Yandex Cloud Postbox AWS-Compatible Email Sender (JavaScript)

This project demonstrates how to send emails through Yandex Cloud Postbox using the AWS SDK for JavaScript v3 (@aws-sdk/client-sesv2) with ESM modules, with infrastructure managed via Terraform.

## Overview

Yandex Cloud Postbox provides email sending capabilities with AWS SES compatibility. This project includes:

1. JavaScript code for sending emails using AWS SDK for JavaScript v3 (@aws-sdk/client-sesv2) with ESM modules
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
cd terraform
chmod +x key-gen.sh
./key-gen.sh
```

### 4. Deploy infrastructure with Terraform

```bash
cd terraform
terraform init
terraform apply -var="folder_id=$YC_FOLDER_ID" -var="dns_zone_name=your-zone" -var="domain=your-domain.com" -var="private_key=$(cat privatekey.pem)" -var="public_key=$(cat dkim_dns_value.txt)" -var="domain_signing_selector=postbox"
```

### 5. Set up Node.js environment

Install dependencies:

```bash
cd javascript
npm install
```

### 6. Configure JavaScript application

Update the constants in `javascript/main.js`:

```javascript
// Constants
const SENDER = "your-verified-email@your-domain.com";
const RECIPIENT = "recipient@example.com";
// Other settings as needed
```

To use static credentials, uncomment and update the following section in `main.js`:

```javascript
credentials: {
    accessKeyId: 'YOUR_ACCESS_KEY_ID',  // From Terraform output
    secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',  // From Terraform output
},
```

### 7. Run the JavaScript application

```bash
cd javascript
npm start
```

## Project Structure

- `/javascript` - JavaScript code for sending emails
- `/terraform` - Terraform configuration for infrastructure setup
    - `key-gen.sh` - Script for generating DKIM keys
    - `iam.tf` - IAM configuration for Yandex Cloud
    - Other Terraform files for infrastructure

## Troubleshooting

- Make sure DKIM DNS records have propagated before sending emails
- Check Yandex Cloud logs for any service account permission issues
- Verify the endpoint URL is correctly configured in the JavaScript application
- If you encounter AWS SDK errors, check that you have the correct version installed
- For debugging, you can uncomment the logger option in the SES client configuration
