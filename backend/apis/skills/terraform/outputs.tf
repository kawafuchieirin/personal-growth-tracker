output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = module.skills_api.lambda_function_arn
}

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = module.skills_api.lambda_function_name
}

output "api_gateway_url" {
  description = "URL of the API Gateway endpoint"
  value       = module.skills_api.api_gateway_url
}
