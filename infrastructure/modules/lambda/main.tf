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
  name               = "lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

data "aws_iam_policy_document" "lambda_policy" {
  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["arn:aws:logs:*:*:*"]
  }

  statement {
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
  name   = "lambda-policy"
  role   = aws_iam_role.lambda.id
  policy = data.aws_iam_policy_document.lambda_policy.json
}

resource "aws_lambda_function" "api" {
  function_name = "api"
  role          = aws_iam_role.lambda.arn
  handler       = "app.main.handler"
  runtime       = "python3.14"
  timeout       = 30
  memory_size   = 256

  filename         = "${path.module}/placeholder.zip"
  source_code_hash = filebase64sha256("${path.module}/placeholder.zip")

  environment {
    variables = {
      GOALS_TABLE_NAME    = var.goals_table_name
      ROADMAPS_TABLE_NAME = var.roadmaps_table_name
      SKILLS_TABLE_NAME   = var.skills_table_name
    }
  }

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

resource "aws_lambda_function_url" "api" {
  function_name      = aws_lambda_function.api.function_name
  authorization_type = "NONE"

  cors {
    allow_origins = ["*"]
    allow_methods = ["*"]
    allow_headers = ["*"]
  }
}

output "lambda_function_name" {
  value = aws_lambda_function.api.function_name
}

output "lambda_function_arn" {
  value = aws_lambda_function.api.arn
}

output "lambda_function_url" {
  value = aws_lambda_function_url.api.function_url
}

output "lambda_role_arn" {
  value = aws_iam_role.lambda.arn
}
