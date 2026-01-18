variable "environment" {
  description = "Environment name"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "ecr_repository" {
  description = "ECR repository name"
  type        = string
}

variable "lambda_memory" {
  description = "Lambda memory size"
  type        = number
}

variable "lambda_timeout" {
  description = "Lambda timeout in seconds"
  type        = number
}

variable "dynamodb_table" {
  description = "DynamoDB table name"
  type        = string
}
