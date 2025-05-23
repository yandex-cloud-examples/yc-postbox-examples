# Input variables for DKIM configuration
variable "domain_signing_selector" {
  type        = string
  default     = "postbox"
  description = "Domain signing selector"
}

variable "domain" {
  type        = string
  description = "Domain name you want to send emails from"
}

variable "dns_zone_name" {
  type        = string
  description = "DNS zone name"
}

# DKIM key pair variables
variable "private_key" {
  type        = string
  description = "Private key for DKIM signing"
}

variable "public_key" {
  type        = string
  description = "Public key for DKIM signing"
}

# Create an SES email identity with DKIM signing configuration
resource "aws_sesv2_email_identity" "postbox" {
  email_identity = var.domain
  dkim_signing_attributes {
    domain_signing_selector    = var.domain_signing_selector
    domain_signing_private_key = local.private_key
  }
  tags = {
    name = "terraform-module"
  }
  configuration_set_name = aws_sesv2_configuration_set.postbox.configuration_set_name
  # Ensure IAM resources are created before the email identity
  depends_on = [
    yandex_iam_service_account.postbox,
    yandex_iam_service_account_static_access_key.postbox-admin-key,
    yandex_resourcemanager_folder_iam_binding.postbox-admin
  ]
}

# Fetch existing DNS zone details
data "yandex_dns_zone" "postbox" {
  folder_id = var.folder_id
  name      = var.dns_zone_name
}

# Local variables for DNS record name formatting
locals {
  zone             = ".${trimsuffix(data.yandex_dns_zone.postbox.zone, ".")}"
  record_name = replace(var.domain, local.zone, "")
  base_record_name = length(local.record_name) > 0 ? ".${local.record_name}" : ""
  public_key       = fileexists(var.public_key) ? file(var.public_key) : var.public_key
  private_key      = fileexists(var.private_key) ? file(var.private_key) : var.private_key
  dkim             = "\"v=DKIM1;h=sha256;k=rsa;p=${trim(local.public_key, "\n")}\""
}

# Create DKIM TXT record in DNS
resource "yandex_dns_recordset" "postbox" {
  name    = "${var.domain_signing_selector}._domainkey${local.base_record_name}"
  zone_id = data.yandex_dns_zone.postbox.id
  type    = "TXT"
  data = [
    local.dkim,
  ]
  ttl = 600
}

# Create SES configuration set for email event handling
resource "aws_sesv2_configuration_set" "postbox" {
  configuration_set_name = "postbox-${random_string.random_suffix.result}"
}

# Configure event destination for email events to YDB Topic
resource "aws_sesv2_configuration_set_event_destination" "kinesis" {
  configuration_set_name = aws_sesv2_configuration_set.postbox.configuration_set_name
  event_destination_name = "postbox-destination-${random_string.random_suffix.result}"

  event_destination {
    kinesis_firehose_destination {
      # YDB Topic endpoint formatted as Kinesis stream ARN
      delivery_stream_arn = "arn:aws:yds:ru-central-1::https://yds.serverless.yandexcloud.net${yandex_ydb_database_serverless.postbox_data_db.database_path}:${yandex_ydb_topic.postbox_notifications.name}"
      # Dummy IAM role required by provider
      iam_role_arn = "arn:aws:iam::third-party:role/IAMRole-Not-Used"
    }

    enabled = true
    # Supported event types for tracking email status
    matching_event_types = [
      "SEND",
      "BOUNCE",
      "DELIVERY"
    ]
  }
}