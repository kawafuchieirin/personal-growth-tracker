variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

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

variable "ecr_repository" {
  description = "ECR repository name"
  type        = string
  default     = "pgt-habits-api"
}

variable "lambda_memory" {
  description = "Lambda memory size"
  type        = number
  default     = 256
}

variable "lambda_timeout" {
  description = "Lambda timeout in seconds"
  type        = number
  default     = 30
}

variable "habits_table_name" {
  description = "DynamoDB habits table name"
  type        = string
  default     = "personal-growth-tracker-habits"
}

variable "habit_logs_table_name" {
  description = "DynamoDB habit logs table name"
  type        = string
  default     = "personal-growth-tracker-habit-logs"
}
