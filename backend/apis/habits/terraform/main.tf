terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "habits_api" {
  source = "./modules/habits-api"

  environment           = var.environment
  aws_region            = var.aws_region
  project_name          = var.project_name
  ecr_repository        = var.ecr_repository
  lambda_memory         = var.lambda_memory
  lambda_timeout        = var.lambda_timeout
  habits_table_name     = var.habits_table_name
  habit_logs_table_name = var.habit_logs_table_name
}
