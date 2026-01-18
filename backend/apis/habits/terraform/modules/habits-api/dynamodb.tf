# DynamoDB Table for Habits
resource "aws_dynamodb_table" "habits" {
  name         = var.habits_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "user_id"
  range_key    = "habit_id"

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "habit_id"
    type = "S"
  }

  tags = {
    Name        = var.habits_table_name
    Environment = var.environment
  }
}

# DynamoDB Table for Habit Logs
resource "aws_dynamodb_table" "habit_logs" {
  name         = var.habit_logs_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "habit_id"
  range_key    = "date"

  attribute {
    name = "habit_id"
    type = "S"
  }

  attribute {
    name = "date"
    type = "S"
  }

  attribute {
    name = "user_id"
    type = "S"
  }

  # GSI for querying by user_id
  global_secondary_index {
    name            = "user_id-date-index"
    hash_key        = "user_id"
    range_key       = "date"
    projection_type = "ALL"
  }

  tags = {
    Name        = var.habit_logs_table_name
    Environment = var.environment
  }
}
