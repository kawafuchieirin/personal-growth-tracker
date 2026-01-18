terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

locals {
  function_name = "${var.project_name}-goals-${var.environment}"
  api_name      = "${var.project_name}-goals-api-${var.environment}"
}
