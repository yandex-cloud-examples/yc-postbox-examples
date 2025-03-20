terraform {
  required_providers {
    yandex = {
      source = "yandex-cloud/yandex"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "5.89.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "3.6.3"
    }
  }
  required_version = ">= 0.13"
}


provider "aws" {
  secret_key                  = local.secret_key
  access_key                  = local.access_key
  skip_region_validation      = true
  skip_credentials_validation = true
  skip_requesting_account_id  = true
  skip_metadata_api_check     = true
  region                      = "ru-central1"

  endpoints {
    sesv2 = "https://postbox.cloud.yandex.net"
  }
}
