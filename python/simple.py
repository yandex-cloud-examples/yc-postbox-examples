import boto3
from botocore.config import Config

# Constants (same as in the Go version)
# Sender address must be verified with Amazon SES.
SENDER = "noreply@yourdomain.com"

# Recipient address.
RECIPIENT = "receiver@domain.com"

# Subject line for the email.
SUBJECT = "Yandex Cloud Postbox Test via AWS SDK for Python"

# HTML body for the email.
HTML_BODY = """<h1>Amazon SES Test Email (AWS SDK for Python)</h1>
<p>This email was sent with <a href='https://yandex.cloud/ru/docs/postbox/quickstart'>Yandex Cloud Postbox</a> using the 
<a href='https://aws.amazon.com/sdk-for-python/'>AWS SDK for Python</a>.</p>"""

# Text body for recipients with non-HTML email clients.
TEXT_BODY = "This email was sent with Yandex Cloud Postbox using the AWS SDK for Python."

# Character encoding for the email.
CHARSET = "UTF-8"


def main():
    # Create a custom endpoint resolver for Yandex Cloud Postbox
    endpoint_url = "https://postbox.cloud.yandex.net"

    # Configure the SES client with the custom endpoint
    config = Config(
        region_name="ru-central1",
        # Uncomment the following line to enable debug logging
        # parameter_validation=False,
    )

    # Create the SES client
    # By default, the SDK uses the default credentials provider chain.
    # You can use static credentials by uncommenting and modifying the following lines:
    # session = boto3.Session(
    #     aws_access_key_id='accessKeyID',
    #     aws_secret_access_key='secretAccessKey',
    # )
    # ses_client = session.client('sesv2', config=config, endpoint_url=endpoint_url)

    # Using default credentials
    ses_client = boto3.client('sesv2', config=config, endpoint_url=endpoint_url)

    # Assemble the email
    email_message = {
        'Destination': {
            'ToAddresses': [RECIPIENT],
        },
        'Content': {
            'Simple': {
                'Subject': {
                    'Charset': CHARSET,
                    'Data': SUBJECT,
                },
                'Body': {
                    'Html': {
                        'Charset': CHARSET,
                        'Data': HTML_BODY,
                    },
                    'Text': {
                        'Charset': CHARSET,
                        'Data': TEXT_BODY,
                    },
                },
            },
        },
        'FromEmailAddress': SENDER,
    }

    try:
        # Attempt to send the email
        response = ses_client.send_email(**email_message)
        # Print the message ID
        print(response['MessageId'])
    except Exception as e:
        print(f"Error sending email: {e}")
        raise


if __name__ == "__main__":
    main()
