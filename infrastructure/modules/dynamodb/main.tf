variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

resource "aws_dynamodb_table" "goals" {
  name         = "${var.project_name}-${var.environment}-goals"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "user_id"
  range_key    = "goal_id"

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "goal_id"
    type = "S"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-goals"
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "roadmaps" {
  name         = "${var.project_name}-${var.environment}-roadmaps"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "goal_id"
  range_key    = "milestone_id"

  attribute {
    name = "goal_id"
    type = "S"
  }

  attribute {
    name = "milestone_id"
    type = "S"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-roadmaps"
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "skills" {
  name         = "${var.project_name}-${var.environment}-skills"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "user_id"
  range_key    = "skill_id"

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "skill_id"
    type = "S"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-skills"
    Environment = var.environment
  }
}

output "goals_table_name" {
  value = aws_dynamodb_table.goals.name
}

output "roadmaps_table_name" {
  value = aws_dynamodb_table.roadmaps.name
}

output "skills_table_name" {
  value = aws_dynamodb_table.skills.name
}
