# Input variable for the Yandex.Cloud folder where all resources will be created
variable "folder_id" {
  type        = string
  description = "Folder ID where resources will be created"
}

# Generate a random suffix for the service account name to ensure uniqueness
resource "random_string" "random_suffix" {
  length  = 5
  special = false
  upper   = false
  numeric = true
  lower   = true
}

# Optional input for providing an existing secret key
variable "secret_key" {
  type        = string
  default     = ""
  description = "[Optional] Secret key to create Postbox Identity. If not provided, a new key will be generated."
}

# Optional input for providing an existing access key
variable "access_key" {
  type        = string
  default     = ""
  description = "[Optional] Access key to create Postbox Identity. If not provided, a new key will be generated."
}

# Local variables to handle key management logic
locals {
  # Check if both keys are provided by the user
  keys_provided = var.secret_key != "" && var.access_key != ""
  # Reference to the generated static access key resource
  key           = yandex_iam_service_account_static_access_key.postbox-admin-key
  # Use provided secret key if available, otherwise use generated one
  secret_key    = local.keys_provided ? var.secret_key : local.key.secret_key
  # Use provided access key if available, otherwise use generated one
  access_key    = local.keys_provided ? var.access_key : local.key.access_key
}

# Create a service account for Postbox operations
resource "yandex_iam_service_account" "postbox" {
  name      = "postbox-admin-${random_string.random_suffix.result}"
  folder_id = var.folder_id
}

# Assign the postbox.admin role to the service account at folder level
resource "yandex_resourcemanager_folder_iam_binding" "postbox-admin" {
  for_each = toset([
    "postbox.admin",
  ])
  role      = each.value
  folder_id = var.folder_id
  members = [
    "serviceAccount:${yandex_iam_service_account.postbox.id}",
  ]
  # Add a delay after creation to ensure proper role propagation
  sleep_after = 5
}

# Generate static access keys for the service account
resource "yandex_iam_service_account_static_access_key" "postbox-admin-key" {
  service_account_id = yandex_iam_service_account.postbox.id
}