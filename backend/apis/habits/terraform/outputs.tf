output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = module.habits_api.lambda_function_arn
}

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = module.habits_api.lambda_function_name
}

output "api_gateway_url" {
  description = "URL of the API Gateway endpoint"
  value       = module.habits_api.api_gateway_url
}

output "api_gateway_id" {
  description = "ID of the API Gateway"
  value       = module.habits_api.api_gateway_id
}

output "habits_table_name" {
  description = "Name of the habits DynamoDB table"
  value       = module.habits_api.habits_table_name
}

output "habit_logs_table_name" {
  description = "Name of the habit logs DynamoDB table"
  value       = module.habits_api.habit_logs_table_name
}
