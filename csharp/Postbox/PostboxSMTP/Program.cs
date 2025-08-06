using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

/// <summary>
/// Demo application that demonstrates how to send emails using Yandex Postbox service
/// with attachment support via MailKit/MimeKit in C#
/// </summary>
class Program
{
    static void Main(string[] args)
    {
        // Configure email sender and recipient details
        var from = "noreply@example.com";
        var to = "receiver@domain.com";
        var subject = "C# Test Email";

        // Create the content for the attachment
        var attachmentContent = "Plain text content of the attachment.";
        
        // Create multipart/alternative content for both plain text and HTML versions
        // This ensures email clients can display the message in the best format they support
        var messageBody = new MultipartAlternative
        {
            new TextPart("plain") {Text = "This is a test email sent from C# console app."},
            new TextPart("html") {Text = "<p>This is a test email sent from C# console app.</p>"}
        };

        // Create the complete email body as multipart/mixed to include both
        // the message content and the attachment
        var body = new Multipart("mixed")
        {
            messageBody,
            // Create the attachment part
            new MimePart("text", "plain")
            {
                // Set the attachment content from a memory stream
                Content = new MimeContent(
                    new MemoryStream(System.Text.Encoding.UTF8.GetBytes(attachmentContent))),
                // Configure it as an attachment rather than inline content
                ContentDisposition = new ContentDisposition(ContentDisposition.Attachment),
                // Use Base64 encoding for the attachment (standard for email attachments)
                ContentTransferEncoding = ContentEncoding.Base64,
                // Specify the filename that will appear in email clients
                FileName = "attachment.txt"
            }
        };

        // Create the email message and set its properties
        var message = new MimeMessage();
        message.From.Add(MailboxAddress.Parse(from));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = body;

        // Send the email using SMTP
        using (var client = new SmtpClient())
        {
            // Connect to Yandex Postbox SMTP server using SSL on port 465
            client.Connect("postbox.cloud.yandex.net", 465, SecureSocketOptions.SslOnConnect);

            // Authenticate using API key (stored in environment variable for security)
            client.Authenticate("API_KEY", Environment.GetEnvironmentVariable("API_KEY"));
            // Send the message and get the response (usually the message ID)
            var response = client.Send(message);
            // Gracefully disconnect from the server
            client.Disconnect(true);
            // Display the message ID from the response
            Console.WriteLine("Message-ID: " + response);
        }
    }
}