# =============================================================================
# Lambda Module for Multiple APIs
# =============================================================================

variable "project_name" {
  description = "Project name prefix"
  type        = string
  default     = "personal-growth-tracker"
}

variable "apis" {
  description = "List of API names"
  type        = list(string)
  default     = ["goals", "roadmaps", "skills"]
}

variable "goals_table_name" {
  description = "DynamoDB goals table name"
  type        = string
}

variable "roadmaps_table_name" {
  description = "DynamoDB roadmaps table name"
  type        = string
}

variable "skills_table_name" {
  description = "DynamoDB skills table name"
  type        = string
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
  account_id = data.aws_caller_identity.current.account_id
  region     = data.aws_region.current.name
}

# =============================================================================
# IAM Role (shared)
# =============================================================================

data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda" {
  name               = "${var.project_name}-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

data "aws_iam_policy_document" "lambda_policy" {
  statement {
    sid = "CloudWatchLogs"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["arn:aws:logs:*:*:*"]
  }

  statement {
    sid = "DynamoDBAccess"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
      "dynamodb:Query",
      "dynamodb:Scan"
    ]
    resources = [
      "arn:aws:dynamodb:*:*:table/${var.goals_table_name}",
      "arn:aws:dynamodb:*:*:table/${var.roadmaps_table_name}",
      "arn:aws:dynamodb:*:*:table/${var.skills_table_name}"
    ]
  }
}

resource "aws_iam_role_policy" "lambda" {
  name   = "${var.project_name}-lambda-policy"
  role   = aws_iam_role.lambda.id
  policy = data.aws_iam_policy_document.lambda_policy.json
}

# =============================================================================
# ECR Repositories (per API)
# =============================================================================

resource "aws_ecr_repository" "api" {
  for_each = toset(var.apis)

  name                 = "${var.project_name}-${each.key}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "api" {
  for_each = toset(var.apis)

  repository = aws_ecr_repository.api[each.key].name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 5 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 5
      }
      action = { type = "expire" }
    }]
  })
}

# =============================================================================
# Lambda Functions (per API)
# =============================================================================

resource "aws_lambda_function" "api" {
  for_each = toset(var.apis)

  function_name = "${var.project_name}-${each.key}"
  role          = aws_iam_role.lambda.arn
  package_type  = "Image"
  timeout       = 30
  memory_size   = 256

  image_uri = "${aws_ecr_repository.api[each.key].repository_url}:latest"

  environment {
    variables = {
      GOALS_TABLE_NAME    = var.goals_table_name
      ROADMAPS_TABLE_NAME = var.roadmaps_table_name
      SKILLS_TABLE_NAME   = var.skills_table_name
      DEBUG               = "false"
    }
  }

  lifecycle {
    ignore_changes = [image_uri]
  }

  depends_on = [aws_ecr_repository.api]
}

resource "aws_lambda_function_url" "api" {
  for_each = toset(var.apis)

  function_name      = aws_lambda_function.api[each.key].function_name
  authorization_type = "NONE"

  cors {
    allow_origins = ["*"]
    allow_methods = ["*"]
    allow_headers = ["*"]
  }
}

resource "aws_cloudwatch_log_group" "api" {
  for_each = toset(var.apis)

  name              = "/aws/lambda/${var.project_name}-${each.key}"
  retention_in_days = 14
}

# =============================================================================
# Outputs
# =============================================================================

output "lambda_functions" {
  value = {
    for api in var.apis : api => {
      function_name = aws_lambda_function.api[api].function_name
      function_arn  = aws_lambda_function.api[api].arn
      function_url  = aws_lambda_function_url.api[api].function_url
      ecr_repo_url  = aws_ecr_repository.api[api].repository_url
    }
  }
}

output "lambda_role_arn" {
  value = aws_iam_role.lambda.arn
}

# Legacy outputs
output "lambda_function_name" {
  value = aws_lambda_function.api["goals"].function_name
}

output "lambda_function_arn" {
  value = aws_lambda_function.api["goals"].arn
}

output "lambda_function_url" {
  value = aws_lambda_function_url.api["goals"].function_url
}
