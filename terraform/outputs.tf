# Output the DKIM DNS record configuration information
# This output provides all necessary details to manually create a DKIM record in DNS
output "dkim_record" {
  value = {
    # The complete DKIM record value including DKIM version, hash algorithm, key type, and public key
    value = local.dkim

    # The fully qualified domain name for the DKIM record
    # Format: selector._domainkey.domain.com
    name  = "${var.domain_signing_selector}._domainkey.${var.domain}"

    # Record type is TXT as per DKIM specification
    type  = "TXT"

    # Time-to-live value in seconds (1 hour)
    ttl   = 3600
  }
}