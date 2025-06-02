import boto3
from botocore.config import Config
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import os

# Constants (same as in the Go version)
# Sender address must be verified with Amazon SES.
SENDER = "noreply@yourdomain.com"

# Recipient address.
RECIPIENT = "receiver@domain.com"

# Subject line for the email.
SUBJECT = "Yandex Cloud Postbox Raw Email Test via AWS SDK for Python"

# Path to attachment file
ATTACHMENT = "attachment.txt"

# HTML body for the email.
HTML_BODY = """<h1>Amazon SES Raw Email Test (AWS SDK for Python)</h1>
<p>This email was sent with <a href='https://yandex.cloud/ru/docs/postbox/quickstart'>Yandex Cloud Postbox</a> using the 
<a href='https://aws.amazon.com/sdk-for-python/'>AWS SDK for Python</a> with raw email format.</p>
<p>Please see the attached file.</p>"""

# Text body for recipients with non-HTML email clients.
TEXT_BODY = "This email was sent with Yandex Cloud Postbox using the AWS SDK for Python with raw email format. Please see the attached file."

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

    # Create a multipart/mixed parent container
    msg = MIMEMultipart('mixed')
    # Add subject, from and to lines
    msg['Subject'] = SUBJECT
    msg['From'] = SENDER
    msg['To'] = RECIPIENT

    # Create a multipart/alternative child container
    msg_body = MIMEMultipart('alternative')

    # Encode the text and HTML content and set the character encoding
    textpart = MIMEText(TEXT_BODY.encode(CHARSET), 'plain', CHARSET)
    htmlpart = MIMEText(HTML_BODY.encode(CHARSET), 'html', CHARSET)

    # Add the text and HTML parts to the child container
    msg_body.attach(textpart)
    msg_body.attach(htmlpart)

    # Define the attachment part and encode it using MIMEApplication
    try:
        att = MIMEApplication(open(ATTACHMENT, 'rb').read())
        # Add a header to tell the email client to treat this part as an attachment
        att.add_header('Content-Disposition', 'attachment', filename=os.path.basename(ATTACHMENT))
        # Attach the attachment to the parent container
        msg.attach(att)
    except FileNotFoundError:
        print(f"Warning: Attachment file {ATTACHMENT} not found. Sending email without attachment.")

    # Attach the multipart/alternative child container to the multipart/mixed parent container
    msg.attach(msg_body)

    # Convert the MIME message to a string and then to bytes
    raw_message = str(msg)
    raw_message_bytes = bytes(raw_message, CHARSET)

    try:
        # Attempt to send the raw email
        response = ses_client.send_email(
            FromEmailAddress=SENDER,
            Destination={
                'ToAddresses': [RECIPIENT]
            },
            Content={
                'Raw': {
                    'Data': raw_message_bytes
                }
            }
        )
        # Print the message ID
        print(f"Email sent! Message ID: {response['MessageId']}")
    except Exception as e:
        print(f"Error sending email: {e}")
        raise


if __name__ == "__main__":
    main()
