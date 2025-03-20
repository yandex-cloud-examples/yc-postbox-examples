# Yandex Cloud Postbox Terraform Module

## Features

- Create a service account with necessary permissions for email operations
- Set up DKIM email authentication for your domain
- Configure DNS records automatically for DKIM verification
- Create a YDB database and topic for handling email events
- Set up email identity and configuration for sending emails
- Track email delivery status with event destinations

## Module Usage

This module requires the following:

- A Yandex.Cloud folder
- An existing DNS zone managed by Yandex.Cloud
- DKIM key pair for email authentication

### Generating DKIM Keys

You can generate the required DKIM key pair using the provided `key-gen.sh` script:

1. Make the script executable:

   ```bash
   chmod +x key-gen.sh
   ```

2. Run the script:

   ```bash
   ./key-gen.sh
   ```

3. This will generate four files:

- `privatekey.pem` - AWS-formatted private key (use this for the private_key input variable)
- `publickey.pem` - Public key
- `raw_privatekey.pem` - Original private key with headers
- `dkim_dns_value.txt` - Public key formatted for DKIM DNS TXT record (use this for the public_key input variable)

4. Use the generated keys in your Terraform configuration:

```hcl
module "postbox" {
  // other configuration...

  private_key = file("${path.module}/privatekey.pem")
  public_key = file("${path.module}/dkim_dns_value.txt")
}
```

**Notes:**

1. You can provide existing access and secret keys or let the module generate them for you
2. The module creates all necessary infrastructure for sending authenticated emails from your domain

### Example

```hcl
module "postbox" {
  source = "./postbox"

  folder_id = var.folder_id

  dns_zone_name           = "example"
  domain                  = "terraform.example.ru"
  private_key = file("./privatekey.pem")
  public_key = file("./dkim_dns_value.txt")
  domain_signing_selector = "tf"
}
```

### Configure Terraform for Yandex Cloud

- Install [YC CLI](https://cloud.yandex.com/docs/cli/quickstart)
- Add environment variables for terraform auth in Yandex.Cloud

```
export YC_TOKEN=$(yc iam create-token)
export YC_CLOUD_ID=$(yc config get cloud-id)
export YC_FOLDER_ID=$(yc config get folder-id)
```

<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->

## Requirements

| Name                                                                      | Version    |
|---------------------------------------------------------------------------|------------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.0.0   |
| <a name="requirement_aws"></a> [aws](#requirement\_aws)                   | >= 5.89.0  |
| <a name="requirement_random"></a> [random](#requirement\_random)          | >= 3.6.3   |
| <a name="requirement_yandex"></a> [yandex](#requirement\_yandex)          | >= 0.139.0 |

## Providers

| Name                                                       | Version    |
|------------------------------------------------------------|------------|
| <a name="provider_aws"></a> [aws](#provider\_aws)          | >= 5.89.0  |
| <a name="provider_random"></a> [random](#provider\_random) | >= 3.6.3   |
| <a name="provider_yandex"></a> [yandex](#provider\_yandex) | >= 0.139.0 |

## Modules

No modules.

## Resources

| Name                                                                                                                                                                                      | Type        |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| [aws_sesv2_configuration_set.postbox](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/sesv2_configuration_set)                                                | resource    |
| [aws_sesv2_configuration_set_event_destination.kinesis](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/sesv2_configuration_set_event_destination)            | resource    |
| [aws_sesv2_email_identity.postbox](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/sesv2_email_identity)                                                      | resource    |
| [random_string.random_suffix](https://registry.terraform.io/providers/hashicorp/random/latest/docs/resources/string)                                                                      | resource    |
| [yandex_dns_recordset.postbox](https://registry.terraform.io/providers/yandex-cloud/yandex/latest/docs/resources/dns_recordset)                                                           | resource    |
| [yandex_iam_service_account.postbox](https://registry.terraform.io/providers/yandex-cloud/yandex/latest/docs/resources/iam_service_account)                                               | resource    |
| [yandex_iam_service_account_static_access_key.postbox-admin-key](https://registry.terraform.io/providers/yandex-cloud/yandex/latest/docs/resources/iam_service_account_static_access_key) | resource    |
| [yandex_resourcemanager_folder_iam_binding.postbox-admin](https://registry.terraform.io/providers/yandex-cloud/yandex/latest/docs/resources/resourcemanager_folder_iam_binding)           | resource    |
| [yandex_ydb_database_serverless.postbox_data_db](https://registry.terraform.io/providers/yandex-cloud/yandex/latest/docs/resources/ydb_database_serverless)                               | resource    |
| [yandex_ydb_topic.postbox_notifications](https://registry.terraform.io/providers/yandex-cloud/yandex/latest/docs/resources/ydb_topic)                                                     | resource    |
| [yandex_dns_zone.postbox](https://registry.terraform.io/providers/yandex-cloud/yandex/latest/docs/data-sources/dns_zone)                                                                  | data source |

## Inputs

| Name                                                                                                        | Description                                                                                     | Type     | Default     | Required |
|-------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------|----------|-------------|:--------:|
| <a name="input_folder_id"></a> [folder\_id](#input\_folder\_id)                                             | Folder ID where resources will be created                                                       | `string` | n/a         |   yes    |
| <a name="input_domain_signing_selector"></a> [domain\_signing\_selector](#input\_domain\_signing\_selector) | Domain signing selector                                                                         | `string` | `"postbox"` |    no    |
| <a name="input_domain"></a> [domain](#input\_domain)                                                        | Domain name you want to send emails from                                                        | `string` | n/a         |   yes    |
| <a name="input_dns_zone_name"></a> [dns\_zone\_name](#input\_dns\_zone\_name)                               | DNS zone name                                                                                   | `string` | n/a         |   yes    |
| <a name="input_private_key"></a> [private\_key](#input\_private\_key)                                       | Private key for DKIM signing                                                                    | `string` | n/a         |   yes    |
| <a name="input_public_key"></a> [public\_key](#input\_public\_key)                                          | Public key for DKIM signing                                                                     | `string` | n/a         |   yes    |
| <a name="input_secret_key"></a> [secret\_key](#input\_secret\_key)                                          | [Optional] Secret key to create Postbox Identity. If not provided, a new key will be generated. | `string` | `""`        |    no    |
| <a name="input_access_key"></a> [access\_key](#input\_access\_key)                                          | [Optional] Access key to create Postbox Identity. If not provided, a new key will be generated. | `string` | `""`        |    no    |

## Outputs

| Name                                                                    | Description                               |
|-------------------------------------------------------------------------|-------------------------------------------|
| <a name="output_dkim_record"></a> [dkim\_record](#output\_dkim\_record) | DKIM DNS record configuration information |

<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->