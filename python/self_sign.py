import hashlib
import hmac
import json
import os
from datetime import datetime, timezone
from typing import Dict, Optional, Any

import requests


class YandexCloudPostboxClient:
    """Client for sending emails through Yandex Cloud Postbox using AWS SESv2 API."""

    # AWS SIG4 constants
    ALGORITHM = 'AWS4-HMAC-SHA256'
    SERVICE = 'ses'
    HOST = 'postbox.cloud.yandex.net'
    REGION = 'ru-central1'
    ENDPOINT = '/v2/email/outbound-emails'
    CHARSET = 'UTF-8'

    def __init__(self, access_key: Optional[str] = None, secret_key: Optional[str] = None):
        """
        Initialize the Postbox client.

        Args:
            access_key: AWS access key ID (defaults to AWS_ACCESS_KEY_ID env var)
            secret_key: AWS secret access key (defaults to AWS_SECRET_ACCESS_KEY env var)
        """
        self.access_key = access_key or os.environ.get('AWS_ACCESS_KEY_ID')
        self.secret_key = secret_key or os.environ.get('AWS_SECRET_ACCESS_KEY')

        if not self.access_key or not self.secret_key:
            raise ValueError("AWS credentials must be provided either as parameters or environment variables")

    def _get_timestamp(self) -> tuple[str, str]:
        """Get formatted timestamp for AWS signing."""
        utc_now = datetime.now(timezone.utc)
        amz_date = utc_now.strftime('%Y%m%dT%H%M%SZ')
        date_stamp = utc_now.strftime('%Y%m%d')
        return amz_date, date_stamp

    def _sign(self, key: bytes, message: str) -> bytes:
        """Create HMAC-SHA256 signature."""
        return hmac.new(key, message.encode('utf-8'), hashlib.sha256).digest()

    def _get_signature_key(self, date_stamp: str) -> bytes:
        """Generate AWS4 signature key."""
        k_date = self._sign(f"AWS4{self.secret_key}".encode('utf-8'), date_stamp)
        k_region = self._sign(k_date, self.REGION)
        k_service = self._sign(k_region, self.SERVICE)
        k_signing = self._sign(k_service, "aws4_request")
        return k_signing

    def _create_canonical_request(self, payload: str, amz_date: str) -> str:
        """Create AWS4 canonical request."""
        method = 'POST'
        canonical_querystring = ''
        canonical_headers = f'host:{self.HOST}\nx-amz-date:{amz_date}\n'
        signed_headers = 'host;x-amz-date'
        payload_hash = hashlib.sha256(payload.encode('utf-8')).hexdigest()

        canonical_request = '\n'.join([
            method,
            self.ENDPOINT,
            canonical_querystring,
            canonical_headers,
            signed_headers,
            payload_hash
        ])

        return canonical_request

    def _create_string_to_sign(self, canonical_request: str, amz_date: str, date_stamp: str) -> str:
        """Create AWS4 string to sign."""
        credential_scope = f"{date_stamp}/{self.REGION}/{self.SERVICE}/aws4_request"
        canonical_request_hash = hashlib.sha256(canonical_request.encode('utf-8')).hexdigest()

        string_to_sign = '\n'.join([
            self.ALGORITHM,
            amz_date,
            credential_scope,
            canonical_request_hash
        ])

        return string_to_sign

    def _create_authorization_header(self, signature: str, amz_date: str, date_stamp: str) -> str:
        """Create AWS4 authorization header."""
        credential_scope = f"{date_stamp}/{self.REGION}/{self.SERVICE}/aws4_request"
        signed_headers = 'host;x-amz-date'

        return (f"{self.ALGORITHM} "
                f"Credential={self.access_key}/{credential_scope}, "
                f"SignedHeaders={signed_headers}, "
                f"Signature={signature}")

    def _sign_request(self, payload: str) -> Dict[str, str]:
        """Sign the request using AWS Signature Version 4."""
        amz_date, date_stamp = self._get_timestamp()

        # Create canonical request
        canonical_request = self._create_canonical_request(payload, amz_date)

        # Create string to sign
        string_to_sign = self._create_string_to_sign(canonical_request, amz_date, date_stamp)

        # Calculate signature
        signing_key = self._get_signature_key(date_stamp)
        signature = hmac.new(signing_key, string_to_sign.encode('utf-8'), hashlib.sha256).hexdigest()

        # Create authorization header
        authorization_header = self._create_authorization_header(signature, amz_date, date_stamp)

        return {
            'Host': self.HOST,
            'x-amz-date': amz_date,
            'Content-Type': 'application/json',
            'Authorization': authorization_header
        }

    def send_email(self, from_email: str, to_emails: list[str], subject: str,
                   html_body: Optional[str] = None, text_body: Optional[str] = None,
                   timeout: int = 30) -> requests.Response:
        """
        Send an email through Yandex Cloud Postbox.

        Args:
            from_email: Sender email address (must be verified with SES)
            to_emails: List of recipient email addresses
            subject: Email subject line
            html_body: HTML body content (optional)
            text_body: Plain text body content (optional)
            timeout: Request timeout in seconds

        Returns:
            requests.Response: The HTTP response from the API

        Raises:
            ValueError: If neither html_body nor text_body is provided
            requests.HTTPError: If the request fails
        """
        if not html_body and not text_body:
            raise ValueError("Either html_body or text_body must be provided")

        # Build email message
        email_message: Dict[str, Any] = {
            'Destination': {
                'ToAddresses': to_emails,
            },
            'Content': {
                'Simple': {
                    'Subject': {
                        'Charset': self.CHARSET,
                        'Data': subject,
                    },
                    'Body': {},
                },
            },
            'FromEmailAddress': from_email,
        }

        # Add body content
        if html_body:
            email_message['Content']['Simple']['Body']['Html'] = {
                'Charset': self.CHARSET,
                'Data': html_body,
            }

        if text_body:
            email_message['Content']['Simple']['Body']['Text'] = {
                'Charset': self.CHARSET,
                'Data': text_body,
            }

        # Convert to JSON and sign request
        payload = json.dumps(email_message)
        headers = self._sign_request(payload)

        # Make the request
        request_url = f'https://{self.HOST}{self.ENDPOINT}'

        try:
            response = requests.post(request_url, data=payload, headers=headers, timeout=timeout)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            raise requests.HTTPError(f"Failed to send email: {e}") from e


def main():
    """Main function demonstrating email sending."""
    # Email configuration
    SENDER = "noreply@yourdomain.com"
    RECIPIENT = "receiver@domain.com"
    SUBJECT = "Yandex Cloud Postbox Test with self-signed request"

    HTML_BODY = """<h1>Ynadex Postbox Test Email</h1>
<p>This email was sent with <a href='https://yandex.cloud/ru/docs/postbox/quickstart'>Yandex Cloud Postbox</a> using the 
<a href='https://aws.amazon.com/sdk-for-python/'>AWS SDK for Python</a>.</p>"""

    TEXT_BODY = "This email was sent with Yandex Cloud Postbox using self-signed request in Python."

    try:
        # Create client and send email
        client = YandexCloudPostboxClient()

        print("Sending email...")
        response = client.send_email(
            from_email=SENDER,
            to_emails=[RECIPIENT],
            subject=SUBJECT,
            html_body=HTML_BODY,
            text_body=TEXT_BODY
        )

        print(f"Email sent successfully!")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")

    except ValueError as e:
        print(f"Configuration error: {e}")
    except requests.HTTPError as e:
        print(f"HTTP error: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise


if __name__ == "__main__":
    main()
