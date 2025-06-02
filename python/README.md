# Yandex Cloud Postbox AWS-Compatible Email Sender (Python)

This project demonstrates how to send emails through Yandex Cloud Postbox using the AWS SDK for Python (boto3), with infrastructure managed via Terraform.

## Overview

Yandex Cloud Postbox provides email sending capabilities with AWS SES compatibility. This project includes:

1. Python code for sending emails using AWS SDK for Python (boto3)
2. Terraform configuration for setting up the required infrastructure
3. Scripts for generating DKIM keys for email authentication

## Prerequisites

- [Python](https://www.python.org/downloads/) 3.6 or later
- [pip](https://pip.pypa.io/en/stable/installation/) (Python package installer)
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

### 5. Set up Python environment

Create a virtual environment and install dependencies:

```bash
cd python
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 6. Configure Python application

Update the constants in `python/main.py`:

```python
# Constants
SENDER = "your-verified-email@your-domain.com"
RECIPIENT = "recipient@example.com"
# Other settings as needed
```

To use static credentials, uncomment and update the following section in `main.py`:

```python
session = boto3.Session(
    aws_access_key_id='YOUR_ACCESS_KEY_ID',  # From Terraform output
    aws_secret_access_key='YOUR_SECRET_ACCESS_KEY',  # From Terraform output
)
ses_client = session.client('sesv2', config=config, endpoint_url=endpoint_url)
```

### 7. Run the Python application

```bash
cd python
python main.py
```

## Project Structure

- `/python` - Python code for sending emails
- `/terraform` - Terraform configuration for infrastructure setup
    - `key-gen.sh` - Script for generating DKIM keys
    - `iam.tf` - IAM configuration for Yandex Cloud
    - Other Terraform files for infrastructure

## Troubleshooting

- Make sure DKIM DNS records have propagated before sending emails
- Check Yandex Cloud logs for any service account permission issues
- Verify the endpoint URL is correctly configured in the Python application
- If you encounter boto3 errors, check that you have the correct version installed