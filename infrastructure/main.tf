terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment to use S3 backend
  # backend "s3" {
  #   bucket = "your-terraform-state-bucket"
  #   key    = "personal-growth-tracker/terraform.tfstate"
  #   region = "ap-northeast-1"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = "personal-growth-tracker"
      ManagedBy = "terraform"
    }
  }
}

variable "aws_region" {
  description = "AWS region"
  default     = "ap-northeast-1"
}

module "dynamodb" {
  source = "./modules/dynamodb"
}

module "lambda" {
  source = "./modules/lambda"

  goals_table_name    = module.dynamodb.goals_table_name
  roadmaps_table_name = module.dynamodb.roadmaps_table_name
  skills_table_name   = module.dynamodb.skills_table_name
}

module "api_gateway" {
  source = "./modules/api-gateway"

  lambda_function_arn  = module.lambda.lambda_function_arn
  lambda_function_name = module.lambda.lambda_function_name
  aws_region           = var.aws_region
}

module "cloudfront" {
  source = "./modules/cloudfront"
}

output "api_endpoint" {
  value = module.api_gateway.api_endpoint
}

output "cloudfront_domain" {
  value = module.cloudfront.cloudfront_domain_name
}

output "frontend_bucket" {
  value = module.cloudfront.s3_bucket_name
}

output "lambda_function_url" {
  value = module.lambda.lambda_function_url
}
