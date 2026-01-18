output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.skills.arn
}

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.skills.function_name
}

output "api_gateway_url" {
  description = "URL of the API Gateway endpoint"
  value       = aws_apigatewayv2_api.skills.api_endpoint
}

output "api_gateway_id" {
  description = "ID of the API Gateway"
  value       = aws_apigatewayv2_api.skills.id
}
