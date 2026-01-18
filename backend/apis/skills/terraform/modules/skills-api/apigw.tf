# API Gateway HTTP API
resource "aws_apigatewayv2_api" "skills" {
  name          = local.api_name
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["*"]
    max_age       = 300
  }
}

# Integration
resource "aws_apigatewayv2_integration" "skills" {
  api_id                 = aws_apigatewayv2_api.skills.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.skills.invoke_arn
  payload_format_version = "2.0"
}

# Route - Catch all
resource "aws_apigatewayv2_route" "skills" {
  api_id    = aws_apigatewayv2_api.skills.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.skills.id}"
}

# Stage
resource "aws_apigatewayv2_stage" "skills" {
  api_id      = aws_apigatewayv2_api.skills.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      responseLength = "$context.responseLength"
    })
  }
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${local.api_name}"
  retention_in_days = 14
}
