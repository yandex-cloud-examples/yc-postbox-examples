using Amazon.Runtime;
using Amazon.SimpleEmailV2;
using Amazon.SimpleEmailV2.Model;
using System.Text.Json;


var client = new AmazonSimpleEmailServiceV2Client(
    // Replace the credentials with your own
    // new BasicAWSCredentials("access_key", "secret_key"),
    new AmazonSimpleEmailServiceV2Config
    {
        ServiceURL = "https://postbox.cloud.yandex.net",
        SignatureMethod = SigningAlgorithm.HmacSHA256,
        SignatureVersion = "4",
        AuthenticationRegion = "ru-central1",
    }
);

try
{
    var response = await client.SendEmailAsync(
        new SendEmailRequest
        {
            Destination = new Destination
            {
                ToAddresses = ["receiver@domain.com"]
            },
            Content = new EmailContent
            {
                Simple = new Message
                {
                    Body = new Body
                    {
                        Text = new Content
                        {
                            Charset = "UTF-8",
                            Data = "Hello, world!"
                        }
                    },
                    Subject = new Content
                    {
                        Charset = "UTF-8",
                        Data = "Test email"
                    }
                }
            },
            FromEmailAddress = "noreply@example.com"
        });

    Console.Write(response.MessageId);
}
catch (Exception ex)
{
    // Log the exception as JSON
    Console.WriteLine(JsonSerializer.Serialize(ex));
}