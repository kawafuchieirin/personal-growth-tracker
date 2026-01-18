# =============================================================================
# API Gateway Module (Multiple APIs, No Custom Domain)
# =============================================================================

variable "project_name" {
  description = "Project name prefix"
  type        = string
  default     = "personal-growth-tracker"
}

variable "lambda_functions" {
  description = "Map of Lambda function configurations"
  type = map(object({
    function_name = string
    function_arn  = string
  }))
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

# =============================================================================
# API Gateway HTTP API
# =============================================================================

resource "aws_apigatewayv2_api" "api" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["*"]
  }
}

resource "aws_apigatewayv2_stage" "api" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}

# =============================================================================
# Lambda Integrations (per API)
# =============================================================================

resource "aws_apigatewayv2_integration" "lambda" {
  for_each = var.lambda_functions

  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = each.value.function_arn
  payload_format_version = "2.0"
}

# =============================================================================
# Routes (path-based routing)
# =============================================================================

# /api/v1/{api_name}/* -> Lambda
resource "aws_apigatewayv2_route" "api_proxy" {
  for_each = var.lambda_functions

  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /api/v1/${each.key}/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda[each.key].id}"
}

resource "aws_apigatewayv2_route" "api_root" {
  for_each = var.lambda_functions

  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /api/v1/${each.key}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda[each.key].id}"
}

# Health check routes
resource "aws_apigatewayv2_route" "health" {
  for_each = var.lambda_functions

  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET /health/${each.key}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda[each.key].id}"
}

# =============================================================================
# Lambda Permissions
# =============================================================================

resource "aws_lambda_permission" "api_gateway" {
  for_each = var.lambda_functions

  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = each.value.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

# =============================================================================
# Outputs
# =============================================================================

output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = aws_apigatewayv2_stage.api.invoke_url
}

output "api_id" {
  description = "API Gateway ID"
  value       = aws_apigatewayv2_api.api.id
}

output "api_routes" {
  description = "API routes"
  value = {
    for api, _ in var.lambda_functions : api => "${aws_apigatewayv2_stage.api.invoke_url}api/v1/${api}"
  }
}
