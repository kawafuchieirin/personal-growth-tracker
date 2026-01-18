resource "aws_dynamodb_table" "goals" {
  name         = "goals"
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
}

resource "aws_dynamodb_table" "roadmaps" {
  name         = "roadmaps"
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
}

resource "aws_dynamodb_table" "skills" {
  name         = "skills"
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
