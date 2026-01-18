# =============================================================================
# Personal Growth Tracker - Main Terraform Configuration
# =============================================================================
# - Single environment (no dev/stg/prod separation)
# - ECR images use 'latest' tag only
# - API Gateway without custom domain
# =============================================================================

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
      Project   = var.project_name
      ManagedBy = "terraform"
    }
  }
}

# =============================================================================
# Variables
# =============================================================================

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "personal-growth-tracker"
}

variable "apis" {
  description = "List of API names"
  type        = list(string)
  default     = ["goals", "roadmaps", "skills"]
}

# =============================================================================
# Modules
# =============================================================================

module "dynamodb" {
  source = "./modules/dynamodb"
}

module "lambda" {
  source = "./modules/lambda"

  project_name        = var.project_name
  apis                = var.apis
  goals_table_name    = module.dynamodb.goals_table_name
  roadmaps_table_name = module.dynamodb.roadmaps_table_name
  skills_table_name   = module.dynamodb.skills_table_name
}

module "api_gateway" {
  source = "./modules/api-gateway"

  project_name = var.project_name
  aws_region   = var.aws_region

  lambda_functions = {
    for api in var.apis : api => {
      function_name = module.lambda.lambda_functions[api].function_name
      function_arn  = module.lambda.lambda_functions[api].function_arn
    }
  }
}

module "cloudfront" {
  source = "./modules/cloudfront"
}

# =============================================================================
# Outputs
# =============================================================================

output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = module.api_gateway.api_endpoint
}

output "api_routes" {
  description = "API routes"
  value       = module.api_gateway.api_routes
}

output "lambda_functions" {
  description = "Lambda function details"
  value       = module.lambda.lambda_functions
}

output "cloudfront_domain" {
  description = "CloudFront domain"
  value       = module.cloudfront.cloudfront_domain_name
}

output "frontend_bucket" {
  description = "Frontend S3 bucket"
  value       = module.cloudfront.s3_bucket_name
}
