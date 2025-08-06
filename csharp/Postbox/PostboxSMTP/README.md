# PostboxSMTP

This repository contains example code for integrating with Yandex Cloud Postbox using C#.

It uses `MailKit` instead of `System.Net.Mail.SmtpClient` because class does not expose the raw SMTP server response
after sending a message. It only throws exceptions if sending fails. You cannot retrieve the server-assigned Message-ID
or the full DATA response using this class.

So to show how get the server response (Message-ID assigned by the server), in this example we use `MailKit` library.

## Features

- Example SMTP client implementation in C#
- Demonstrates sending emails via Yandex Cloud Postbox
- Includes configuration and usage examples

## Prerequisites

- .NET 6.0 SDK or later
- Access to Yandex Cloud Postbox
- Valid SMTP credentials

## Getting Started

1. **Clone the repository:**
   ```
    git clone git@github.com:yandex-cloud-examples/yc-postbox-examples.git
    cd yc-postbox-examples/csharp/Postbox/PosboxSMTP
   ```

2. **Configure SMTP settings:**
    - Update the configuration file or environment variables with your SMTP credentials.

3. **Build and run:**
   ```
    dotnet build
    dotnet run
   ```

## Usage

- Modify the sample code to send emails using your own parameters.
- Refer to the source code for detailed usage examples.

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue in this repository.
