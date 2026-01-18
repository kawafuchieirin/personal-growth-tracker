output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.habits.arn
}

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.habits.function_name
}

output "api_gateway_url" {
  description = "URL of the API Gateway endpoint"
  value       = aws_apigatewayv2_api.habits.api_endpoint
}

output "api_gateway_id" {
  description = "ID of the API Gateway"
  value       = aws_apigatewayv2_api.habits.id
}

output "habits_table_name" {
  description = "Name of the habits DynamoDB table"
  value       = aws_dynamodb_table.habits.name
}

output "habit_logs_table_name" {
  description = "Name of the habit logs DynamoDB table"
  value       = aws_dynamodb_table.habit_logs.name
}
