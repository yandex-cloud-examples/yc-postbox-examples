package main

import (
	"context"
	"fmt"
	"net/url"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/sesv2"
	"github.com/aws/aws-sdk-go-v2/service/sesv2/types"
	transport "github.com/aws/smithy-go/endpoints"
)

const (
	// Sender address must be verified with Amazon SES.
	Sender = "noreply@yourdomain.com"

	// Recipient address.
	Recipient = "receiver@domain.com"

	// Subject line for the email.
	Subject = "Yandex Cloud Postbox Test via AWS SDK for Go"

	// HtmlBody is the body for the email.
	HtmlBody = "<h1>Amazon SES Test Email (AWS SDK for Go)</h1><p>This email was sent with " +
		"<a href='https://yandex.cloud/ru/docs/postbox/quickstart'>Yandex Cloud Postbox</a> using the " +
		"<a href='https://aws.amazon.com/sdk-for-go/'>AWS SDK for Go</a>.</p>"

	// TextBody is the email body for recipients with non-HTML email clients.
	TextBody = "This email was sent with Yandex Cloud Postbox using the AWS SDK for Go."

	// CharSet The character encoding for the email.
	CharSet = "UTF-8"
)

func main() {
	client := sesv2.New(sesv2.Options{
		Region:             "ru-central1",
		EndpointResolverV2: &resolverV2{},
		// The following options are useful for debugging
		//ClientLogMode:      aws.LogRequestWithBody | aws.LogResponseWithBody,
		//Logger: logging.NewStandardLogger(
		//	os.Stdout,
		//),

		// By default, the SDK uses the default credentials provider chain.
		// Uncomment the following lines to use static credentials.
		//Credentials: &staticCredentialsProvider{
		//	accessKeyID:     "accessKeyID",
		//	secretAccessKey: "secretAccessKey",
		//},
	})

	// Assemble the email.
	input := &sesv2.SendEmailInput{
		Destination: &types.Destination{
			ToAddresses: []string{Recipient},
		},
		Content: &types.EmailContent{
			Simple: &types.Message{
				Subject: &types.Content{
					Charset: aws.String(CharSet),
					Data:    aws.String(Subject),
				},
				Body: &types.Body{
					Html: &types.Content{
						Charset: aws.String(CharSet),
						Data:    aws.String(HtmlBody),
					},
					Text: &types.Content{
						Charset: aws.String(CharSet),
						Data:    aws.String(TextBody),
					},
				},
			},
		},
		FromEmailAddress: aws.String(Sender),
	}

	// Attempt to send the email.
	ctx := context.Background()
	res, err := client.SendEmail(ctx, input)

	if err != nil {
		panic(err)
	}

	fmt.Println(*res.MessageId)
}

type resolverV2 struct{}

func (*resolverV2) ResolveEndpoint(ctx context.Context, params sesv2.EndpointParameters) (
	transport.Endpoint, error,
) {
	u, err := url.Parse("https://postbox.cloud.yandex.net")
	if err != nil {
		return transport.Endpoint{}, err
	}
	return transport.Endpoint{
		URI: *u,
	}, nil
}

type staticCredentialsProvider struct {
	accessKeyID     string
	secretAccessKey string
}

func (s *staticCredentialsProvider) Retrieve(ctx context.Context) (aws.Credentials, error) {
	return aws.Credentials{
		AccessKeyID:     s.accessKeyID,
		SecretAccessKey: s.secretAccessKey,
	}, nil
}
