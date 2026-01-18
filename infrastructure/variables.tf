variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "personal-growth-tracker"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}
