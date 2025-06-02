package main

import (
	"bytes"
	"context"
	"fmt"
	"net/url"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sesv2"
	"github.com/aws/aws-sdk-go-v2/service/sesv2/types"
	transport "github.com/aws/smithy-go/endpoints"
	"github.com/aws/smithy-go/logging"
	"github.com/emersion/go-message/mail"
)

const (
	// Sender address must be verified with Amazon SES.
	Sender = "noreply@yourdomain.com"

	// Recipient address.
	Recipient = "receiver@domain.com"

	// Subject line for the email.
	Subject = "Yandex Cloud Postbox Raw Email Test via AWS SDK for Go"

	// HtmlBody is the body for the email.
	HtmlBody = "<h1>Amazon SES Raw Email Test (AWS SDK for Go)</h1><p>This email was sent with " +
		"<a href='https://yandex.cloud/ru/docs/postbox/quickstart'>Yandex Cloud Postbox</a> using the " +
		"<a href='https://aws.amazon.com/sdk-for-go/'>AWS SDK for Go</a> and the " +
		"<a href='https://github.com/emersion/go-message'>go-message</a> library.</p>"

	// TextBody is the email body for recipients with non-HTML email clients.
	TextBody = "This email was sent with Yandex Cloud Postbox using the AWS SDK for Go and the go-message library."
)

func main() {
	cfg, err := config.LoadDefaultConfig(
		context.Background(),
	)
	if err != nil {
		fmt.Println("unable to load SDK config, " + err.Error())
		os.Exit(1)
	}
	// Create a new SES client
	client := sesv2.New(sesv2.Options{
		Region:             "ru-central1",
		EndpointResolverV2: &resolverV2{},
		// The following options are useful for debugging
		ClientLogMode: aws.LogRequestWithBody | aws.LogResponseWithBody,
		Logger: logging.NewStandardLogger(
			os.Stdout,
		),

		Credentials: cfg.Credentials,
		// By default, the SDK uses the default credentials provider chain.
		// Uncomment the following lines to use static credentials.
		//Credentials: &staticCredentialsProvider{
		//	accessKeyID:     "accessKeyID",
		//	secretAccessKey: "secretAccessKey",
		//},
	})

	rawEmail, err := constructRawEmail()

	// Create the SendEmailInput with raw content
	input := &sesv2.SendEmailInput{
		Content: &types.EmailContent{
			Raw: &types.RawMessage{
				Data: rawEmail,
			},
		},
		Destination: &types.Destination{
			ToAddresses: []string{Recipient},
		},
	}

	// Send the raw email
	ctx := context.Background()
	res, err := client.SendEmail(ctx, input)

	if err != nil {
		panic(err)
	}

	fmt.Println("Email sent successfully! Message ID:", *res.MessageId)
}

func constructRawEmail() ([]byte, error) {
	// Construct the email using go-message
	var buf bytes.Buffer

	// Create a new message
	from := []*mail.Address{{Address: Sender}}
	to := []*mail.Address{{Address: Recipient}}

	// Create a message header
	var h mail.Header
	h.SetAddressList("From", from)
	h.SetAddressList("To", to)
	h.SetSubject(Subject)
	h.SetDate(time.Now())

	// Create a multipart writer
	mw, err := mail.CreateWriter(&buf, h)
	if err != nil {
		panic(err)
	}

	// Create the text part
	tw, err := mw.CreateInline()
	if err != nil {
		panic(err)
	}

	var th mail.InlineHeader
	th.Set("Content-Type", "text/plain; charset=UTF-8")
	w, err := tw.CreatePart(th)
	if err != nil {
		panic(err)
	}
	fmt.Fprintf(w, "%s", TextBody)
	w.Close()

	// Create the HTML part
	var hh mail.InlineHeader
	hh.Set("Content-Type", "text/html; charset=UTF-8")
	w, err = tw.CreatePart(hh)
	if err != nil {
		panic(err)
	}
	fmt.Fprintf(w, "%s", HtmlBody)
	w.Close()

	tw.Close()
	mw.Close()

	// Get the raw email content
	rawEmail := buf.Bytes()
	return rawEmail, err
}

type resolverV2 struct{}

func (*resolverV2) ResolveEndpoint(_ context.Context, _ sesv2.EndpointParameters) (
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

func (s *staticCredentialsProvider) Retrieve(_ context.Context) (aws.Credentials, error) {
	return aws.Credentials{
		AccessKeyID:     s.accessKeyID,
		SecretAccessKey: s.secretAccessKey,
	}, nil
}
