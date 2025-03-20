#!/bin/bash

# Generate private key
openssl genrsa -out raw_privatekey.pem 2048

# Generate public key from the private key
openssl rsa -in raw_privatekey.pem -pubout -out publickey.pem

# Process private key for AWS (remove headers and line breaks)
cat raw_privatekey.pem | grep -v "BEGIN" | grep -v "END" | tr -d '\n' > privatekey.pem

# Format public key for DKIM DNS TXT record
# Remove headers, strip newlines and concatenate for DNS TXT record
DKIM_DNS_VALUE=$(cat publickey.pem | grep -v "BEGIN" | grep -v "END" | tr -d '\n')
echo "$DKIM_DNS_VALUE" > dkim_dns_value.txt

echo "Keys generated:"
echo "- privatekey.pem (AWS-formatted private key)"
echo "- publickey.pem (Public key)"
echo "- raw_privatekey.pem (Original private key with headers)"
echo "- dkim_dns_value.txt (Public key formatted for DKIM DNS TXT record)"